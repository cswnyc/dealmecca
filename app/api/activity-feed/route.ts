import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/requireAuth';

/**
 * GET - Fetch activity feed for followed companies and contacts
 *
 * This endpoint aggregates activities from:
 * - Companies the user follows
 * - Contacts at followed companies
 * - Company updates (new contacts, partnerships, insights)
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // Filter by activity type

    // Get companies user follows
    const followedCompanies = await prisma.companyFollow.findMany({
      where: { userId: user.id },
      select: { companyId: true }
    });

    const followedCompanyIds = followedCompanies.map(f => f.companyId);

    if (followedCompanyIds.length === 0) {
      return NextResponse.json({
        success: true,
        activities: [],
        hasMore: false,
        total: 0
      });
    }

    // Fetch recent activities related to followed companies
    const activities: any[] = [];

    // 1. New contacts added to followed companies
    const newContacts = await prisma.contact.findMany({
      where: {
        companyId: { in: followedCompanyIds },
        isActive: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        title: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    newContacts.forEach(contact => {
      activities.push({
        id: `contact-${contact.id}`,
        type: 'NEW_CONTACT',
        title: 'New Contact Added',
        description: `${contact.firstName} ${contact.lastName} joined ${contact.company.name}`,
        metadata: {
          contactId: contact.id,
          contactName: `${contact.firstName} ${contact.lastName}`,
          contactTitle: contact.title,
          companyId: contact.company.id,
          companyName: contact.company.name,
          companyLogo: contact.company.logoUrl
        },
        actionUrl: `/people/${contact.id}`,
        createdAt: contact.createdAt,
        icon: 'user-plus'
      });
    });

    // 2. New partnerships for followed companies
    const newPartnerships = await prisma.companyPartnership.findMany({
      where: {
        OR: [
          { agencyId: { in: followedCompanyIds } },
          { advertiserId: { in: followedCompanyIds } }
        ],
        isActive: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        partnershipType: true,
        createdAt: true,
        agency: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        },
        advertiser: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    newPartnerships.forEach(partnership => {
      activities.push({
        id: `partnership-${partnership.id}`,
        type: 'NEW_PARTNERSHIP',
        title: 'New Partnership',
        description: `${partnership.agency.name} partnered with ${partnership.advertiser.name}`,
        metadata: {
          partnershipId: partnership.id,
          partnershipType: partnership.partnershipType,
          agencyId: partnership.agency.id,
          agencyName: partnership.agency.name,
          agencyLogo: partnership.agency.logoUrl,
          advertiserId: partnership.advertiser.id,
          advertiserName: partnership.advertiser.name,
          advertiserLogo: partnership.advertiser.logoUrl
        },
        actionUrl: `/companies/${partnership.agency.id}`,
        createdAt: partnership.createdAt,
        icon: 'handshake'
      });
    });

    // 3. New insights for followed companies
    const newInsights = await prisma.companyInsight.findMany({
      where: {
        companyId: { in: followedCompanyIds },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    newInsights.forEach(insight => {
      activities.push({
        id: `insight-${insight.id}`,
        type: 'NEW_INSIGHT',
        title: insight.title,
        description: `New ${insight.type.toLowerCase().replace('_', ' ')} for ${insight.company.name}`,
        metadata: {
          insightId: insight.id,
          insightType: insight.type,
          companyId: insight.company.id,
          companyName: insight.company.name,
          companyLogo: insight.company.logoUrl,
          preview: insight.content.substring(0, 100)
        },
        actionUrl: `/companies/${insight.company.id}`,
        createdAt: insight.createdAt,
        icon: 'lightbulb'
      });
    });

    // 4. Company updates (when company info changes)
    const recentCompanyUpdates = await prisma.company.findMany({
      where: {
        id: { in: followedCompanyIds },
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        },
        // Only if updated more than 1 hour after creation (to filter out new companies)
        AND: {
          updatedAt: {
            not: {
              equals: prisma.company.fields.createdAt
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        updatedAt: true,
        description: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    recentCompanyUpdates.forEach(company => {
      activities.push({
        id: `company-update-${company.id}`,
        type: 'COMPANY_UPDATE',
        title: 'Company Updated',
        description: `${company.name} updated their profile`,
        metadata: {
          companyId: company.id,
          companyName: company.name,
          companyLogo: company.logoUrl
        },
        actionUrl: `/companies/${company.id}`,
        createdAt: company.updatedAt,
        icon: 'building'
      });
    });

    // Sort all activities by date
    activities.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Filter by type if specified
    const filteredActivities = type
      ? activities.filter(a => a.type === type)
      : activities;

    // Apply pagination
    const paginatedActivities = filteredActivities.slice(offset, offset + limit);
    const hasMore = filteredActivities.length > offset + limit;

    return NextResponse.json({
      success: true,
      activities: paginatedActivities,
      hasMore,
      total: filteredActivities.length
    });

  } catch (error: any) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity feed' },
      { status: error.status || 500 }
    );
  }
}
