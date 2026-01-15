import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/requireAdmin';

/**
 * GET - Fetch organization analytics and statistics (Admin)
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    // Get total counts
    const [
      totalCompanies,
      totalAgencies,
      totalAdvertisers,
      totalContacts,
      verifiedCompanies,
      companiesWithLogos,
      totalPartnerships
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({
        where: {
          OR: [
            { companyType: 'AGENCY' },
            { companyType: 'INDEPENDENT_AGENCY' },
            { companyType: 'HOLDING_COMPANY_AGENCY' },
            { companyType: 'MEDIA_HOLDING_COMPANY' }
          ]
        }
      }),
      prisma.company.count({
        where: { companyType: 'ADVERTISER' }
      }),
      prisma.contact.count({ where: { isActive: true } }),
      prisma.company.count({ where: { verified: true } }),
      prisma.company.count({ where: { logoUrl: { not: null } } }),
      prisma.companyPartnership.count({ where: { isActive: true } })
    ]);

    // Geographic distribution
    const stateDistribution = await prisma.company.groupBy({
      by: ['state'],
      _count: true,
      where: {
        state: { not: null }
      },
      orderBy: {
        _count: {
          state: 'desc'
        }
      },
      take: 10
    });

    // Industry distribution (for advertisers)
    const industryDistribution = await prisma.company.groupBy({
      by: ['industry'],
      _count: true,
      where: {
        industry: { not: null },
        companyType: 'ADVERTISER'
      },
      orderBy: {
        _count: {
          industry: 'desc'
        }
      },
      take: 10
    });

    // Agency type distribution
    const agencyTypeDistribution = await prisma.company.groupBy({
      by: ['agencyType'],
      _count: true,
      where: {
        agencyType: { not: null }
      }
    });

    // Growth metrics - Companies added over time
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCompanies = await prisma.company.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    const recentContacts = await prisma.contact.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        },
        isActive: true
      }
    });

    // User engagement metrics
    const [
      totalFollows,
      totalSearches,
      totalSavedSearches
    ] = await Promise.all([
      prisma.companyFollow.count(),
      prisma.search.count(),
      prisma.savedSearch.count({
        where: {
          isActive: true
        }
      })
    ]);

    // Top companies by followers
    const topCompaniesByFollowers = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true,
        companyType: true,
        _count: {
          select: {
            CompanyFollow: true
          }
        }
      },
      orderBy: {
        CompanyFollow: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Company completeness scores
    const companiesWithDescriptions = await prisma.company.count({
      where: { description: { not: null } }
    });

    const companiesWithWebsite = await prisma.company.count({
      where: { website: { not: null } }
    });

    const companiesWithLinkedIn = await prisma.company.count({
      where: { linkedinUrl: { not: null } }
    });

    // Partnership type distribution
    const partnershipTypeDistribution = await prisma.companyPartnership.groupBy({
      by: ['relationshipType'],
      _count: true,
      where: {
        isActive: true
      }
    });

    // Contact role distribution
    const roleDistribution = await prisma.contact.groupBy({
      by: ['primaryRole'],
      _count: true,
      where: {
        isActive: true,
        primaryRole: { not: null }
      },
      orderBy: {
        _count: {
          primaryRole: 'desc'
        }
      },
      take: 10
    });

    // Seniority distribution
    const seniorityDistribution = await prisma.contact.groupBy({
      by: ['seniority'],
      _count: true,
      where: {
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalCompanies,
          totalAgencies,
          totalAdvertisers,
          totalContacts,
          verifiedCompanies,
          companiesWithLogos,
          totalPartnerships,
          verificationRate: totalCompanies > 0 ? (verifiedCompanies / totalCompanies) * 100 : 0,
          logoCompletionRate: totalCompanies > 0 ? (companiesWithLogos / totalCompanies) * 100 : 0
        },
        growth: {
          recentCompanies,
          recentContacts,
          companiesLast30Days: recentCompanies,
          contactsLast30Days: recentContacts
        },
        distribution: {
          byState: stateDistribution.map(s => ({
            state: s.state,
            count: s._count
          })),
          byIndustry: industryDistribution.map(i => ({
            industry: i.industry,
            count: i._count
          })),
          byAgencyType: agencyTypeDistribution.map(a => ({
            agencyType: a.agencyType,
            count: a._count
          })),
          byPartnershipType: partnershipTypeDistribution.map(p => ({
            partnershipType: p.relationshipType,
            count: p._count
          }))
        },
        contacts: {
          total: totalContacts,
          byRole: roleDistribution.map(r => ({
            role: r.primaryRole,
            count: r._count
          })),
          bySeniority: seniorityDistribution.map(s => ({
            seniority: s.seniority,
            count: s._count
          }))
        },
        completeness: {
          withDescriptions: companiesWithDescriptions,
          withWebsite: companiesWithWebsite,
          withLinkedIn: companiesWithLinkedIn,
          descriptionRate: totalCompanies > 0 ? (companiesWithDescriptions / totalCompanies) * 100 : 0,
          websiteRate: totalCompanies > 0 ? (companiesWithWebsite / totalCompanies) * 100 : 0,
          linkedInRate: totalCompanies > 0 ? (companiesWithLinkedIn / totalCompanies) * 100 : 0
        },
        engagement: {
          totalFollows,
          userFollows: 0, // Not tracking per-user in admin view
          totalSearches,
          savedSearches: totalSavedSearches,
          topCompanies: topCompaniesByFollowers.map(c => ({
            id: c.id,
            name: c.name,
            logoUrl: c.logoUrl,
            type: c.companyType,
            followers: c._count.CompanyFollow
          }))
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: error.status || 500 }
    );
  }
}
