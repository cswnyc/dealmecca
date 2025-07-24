import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get comprehensive analytics for org charts
    const [
      totalCompanies,
      totalContacts,
      agencyStats,
      advertiserStats,
      industryStats,
      verificationStats,
      growthStats,
      topCategories,
      recentActivity,
      locationStats
    ] = await Promise.all([
      // Total company count
      prisma.company.count(),
      
      // Total contact count
      prisma.contact.count({ where: { isActive: true } }),
      
      // Agency statistics
      prisma.company.count({
        where: {
          companyType: {
            in: [
              'INDEPENDENT_AGENCY',
              'HOLDING_COMPANY_AGENCY',
              'AGENCY' // Legacy value for backward compatibility
            ]
          }
        }
      }),
      
      // Advertiser statistics
      prisma.company.count({
        where: {
          companyType: {
            in: [
              'NATIONAL_ADVERTISER',
              'LOCAL_ADVERTISER',
              'ADVERTISER' // Legacy value for backward compatibility
            ]
          }
        }
      }),
      
      // Industry count (unique industries)
      prisma.company.findMany({
        select: { industry: true },
        where: { industry: { not: null } },
        distinct: ['industry']
      }),
      
      // Verification statistics
      Promise.all([
        prisma.company.count({ where: { verified: true } }),
        prisma.contact.count({ where: { verified: true, isActive: true } }),
        prisma.company.count({ where: { dataQuality: 'VERIFIED' } })
      ]),
      
      // Growth statistics (last 30 days)
      Promise.all([
        prisma.company.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.contact.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            },
            isActive: true
          }
        })
      ]),
      
      // Top categories
      Promise.all([
        // Top agency types
        prisma.company.groupBy({
          by: ['agencyType'],
          where: { 
            agencyType: { not: null },
            companyType: {
              in: [
                'INDEPENDENT_AGENCY',
                'HOLDING_COMPANY_AGENCY'
              ]
            }
          },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }),
        
        // Top industries
        prisma.company.groupBy({
          by: ['industry'],
          where: { industry: { not: null } },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }),
        
        // Top company types
        prisma.company.groupBy({
          by: ['companyType'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        })
      ]),
      
      // Recent activity (last 7 days)
      Promise.all([
        prisma.company.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.contact.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            },
            isActive: true
          }
        }),
        prisma.company.count({
          where: {
            lastVerified: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.company.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]),
      
      // Location statistics
      Promise.all([
        prisma.company.groupBy({
          by: ['state'],
          where: { state: { not: null } },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }),
        prisma.company.groupBy({
          by: ['city'],
          where: { city: { not: null } },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        })
      ])
    ]);

    // Calculate verification rates
    const companyVerificationRate = totalCompanies > 0 
      ? Math.round((verificationStats[0] / totalCompanies) * 100) 
      : 0;
    
    const contactVerificationRate = totalContacts > 0 
      ? Math.round((verificationStats[1] / totalContacts) * 100) 
      : 0;

    // Calculate growth rates
    const monthlyGrowthRate = totalCompanies > 0 
      ? Math.round((growthStats[0] / totalCompanies) * 100) 
      : 0;
    
    const weeklyGrowthRate = totalCompanies > 0 
      ? Math.round((recentActivity[0] / totalCompanies) * 100) 
      : 0;

    // Format response
    const analytics = {
      success: true,
      timestamp: new Date(),
      overview: {
        totalAgencies: agencyStats,
        totalAdvertisers: advertiserStats,
        totalContacts: totalContacts,
        totalIndustries: industryStats.length,
        totalCompanies: totalCompanies,
        verificationRate: {
          companies: companyVerificationRate,
          contacts: contactVerificationRate
        },
        growthRate: {
          monthly: monthlyGrowthRate,
          weekly: weeklyGrowthRate
        }
      },
      topCategories: {
        agencyTypes: topCategories[0].map(item => ({
          value: item.agencyType || '',
          label: (item.agencyType || '').replace(/_/g, ' '),
          count: item._count.id
        })),
        industries: topCategories[1].map(item => ({
          value: item.industry || '',
          label: (item.industry || '').replace(/_/g, ' '),
          count: item._count.id
        })),
        companyTypes: topCategories[2].map(item => ({
          value: item.companyType,
          label: item.companyType.replace(/_/g, ' '),
          count: item._count.id
        })),
        locations: [
          ...locationStats[0].map(item => ({
            value: item.state || '',
            label: item.state || '',
            count: item._count.id,
            type: 'state'
          })),
          ...locationStats[1].slice(0, 5).map(item => ({
            value: item.city || '',
            label: item.city || '',
            count: item._count.id,
            type: 'city'
          }))
        ]
      },
      recentActivity: {
        newCompanies: recentActivity[0],
        newContacts: recentActivity[1],
        verifications: recentActivity[2],
        updates: recentActivity[3]
      },
      breakdown: {
        agencies: {
          total: agencyStats,
          verified: await prisma.company.count({
            where: {
              verified: true,
              companyType: {
                in: [
                  'INDEPENDENT_AGENCY',
                  'HOLDING_COMPANY_AGENCY'
                ]
              }
            }
          })
        },
        advertisers: {
          total: advertiserStats,
          verified: await prisma.company.count({
            where: {
              verified: true,
              companyType: {
                in: [
                  'NATIONAL_ADVERTISER',
                  'LOCAL_ADVERTISER'
                ]
              }
            }
          })
        }
      }
    };

    // Track analytics request
    await prisma.search.create({
      data: {
        userId: session.user.id,
        query: 'org_analytics',
        resultsCount: totalCompanies,
        searchType: 'analytics'
      }
    });

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
} 