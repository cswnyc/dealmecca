import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const sortBy = searchParams.get('sortBy') || 'company_count';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    
    // Build base filter conditions
    const baseConditions: any = {
      industry: { not: null }
    };

    // Add search filter if provided
    if (q) {
      baseConditions.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    // Apply additional filters from query params
    const companyType = searchParams.getAll('companyType');
    if (companyType.length > 0) {
      baseConditions.companyType = { in: companyType };
    }

    const verified = searchParams.get('verified');
    if (verified !== null) {
      baseConditions.verified = verified === 'true';
    }

    // Get industry aggregation data
    const industryAggregation = await prisma.company.groupBy({
      by: ['industry'],
      where: baseConditions,
      _count: {
        id: true
      },
      _sum: {
        teamCount: true
      },
      orderBy: sortDirection === 'desc' 
        ? { _count: { id: 'desc' } }
        : { _count: { id: 'asc' } }
    });

    // Enhanced industry data with additional metrics
    const enhancedIndustries = await Promise.all(
      industryAggregation
        .filter(item => item.industry !== null)
        .map(async (item) => {
          const industry = item.industry!;
          
          // Get additional metrics for each industry
          const [
            agencyCount,
            advertiserCount,
            verifiedCount,
            recentlyUpdatedCount,
            avgRevenue,
            topCompanies
          ] = await Promise.all([
            // Agency count in this industry
            prisma.company.count({
              where: {
                ...baseConditions,
                industry: industry,
                companyType: {
                  in: ['INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY', 'MEDIA_HOLDING_COMPANY']
                }
              }
            }),
            
            // Advertiser count in this industry
            prisma.company.count({
              where: {
                ...baseConditions,
                industry: industry,
                companyType: {
                  in: ['NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER']
                }
              }
            }),
            
            // Verified companies count
            prisma.company.count({
              where: {
                ...baseConditions,
                industry: industry,
                verified: true
              }
            }),
            
            // Recently updated count (last 30 days)
            prisma.company.count({
              where: {
                ...baseConditions,
                industry: industry,
                updatedAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
              }
            }),
            
            // Average revenue range (simplified)
            prisma.company.findMany({
              where: {
                ...baseConditions,
                industry: industry,
                revenueRange: { not: null }
              },
              select: { revenueRange: true },
              take: 100 // Sample for performance
            }),
            
            // Top companies in this industry
            prisma.company.findMany({
              where: {
                ...baseConditions,
                industry: industry,
                verified: true
              },
              select: {
                id: true,
                name: true,
                slug: true,
                companyType: true,
                verified: true,
                employeeCount: true,
                revenueRange: true
              },
              orderBy: [
                { verified: 'desc' },
                { revenueRange: 'desc' },
                { employeeCount: 'desc' }
              ],
              take: 5
            })
          ]);

          // Calculate growth trend (simplified)
          const growthRate = recentlyUpdatedCount > 0 
            ? Math.round((recentlyUpdatedCount / item._count.id) * 100) 
            : 0;

          // Format industry name for display
          const displayName = industry.replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase());

          return {
            id: industry,
            name: displayName,
            slug: industry.toLowerCase().replace(/_/g, '-'),
            description: getIndustryDescription(industry),
            
            // Core metrics
            totalCompanies: item._count.id,
            agencyCount: agencyCount,
            advertiserCount: advertiserCount,
            verifiedCount: verifiedCount,
            
            // Performance metrics
            verificationRate: item._count.id > 0 
              ? Math.round((verifiedCount / item._count.id) * 100) 
              : 0,
            growthRate: growthRate,
            recentActivity: recentlyUpdatedCount,
            
            // Team metrics
            totalTeams: item._sum.teamCount || 0,
            avgTeamSize: item._sum.teamCount && item._count.id > 0 
              ? Math.round((item._sum.teamCount || 0) / item._count.id) 
              : 0,
            
            // Top companies
            topCompanies: topCompanies,
            
            // Categories
            category: getIndustryCategory(industry),
            tags: getIndustryTags(industry),
            
            // Metadata
            lastUpdated: new Date(),
            featured: isIndustryFeatured(industry)
          };
        })
    );

    // Apply sorting
    let sortedIndustries = enhancedIndustries;
    switch (sortBy) {
      case 'name':
        sortedIndustries = enhancedIndustries.sort((a, b) => 
          sortDirection === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
        break;
      case 'agency_count':
        sortedIndustries = enhancedIndustries.sort((a, b) => 
          sortDirection === 'asc' 
            ? a.agencyCount - b.agencyCount
            : b.agencyCount - a.agencyCount
        );
        break;
      case 'advertiser_count':
        sortedIndustries = enhancedIndustries.sort((a, b) => 
          sortDirection === 'asc' 
            ? a.advertiserCount - b.advertiserCount
            : b.advertiserCount - a.advertiserCount
        );
        break;
      case 'growth_rate':
        sortedIndustries = enhancedIndustries.sort((a, b) => 
          sortDirection === 'asc' 
            ? a.growthRate - b.growthRate
            : b.growthRate - a.growthRate
        );
        break;
      case 'verification_rate':
        sortedIndustries = enhancedIndustries.sort((a, b) => 
          sortDirection === 'asc' 
            ? a.verificationRate - b.verificationRate
            : b.verificationRate - a.verificationRate
        );
        break;
      default: // 'company_count'
        sortedIndustries = enhancedIndustries.sort((a, b) => 
          sortDirection === 'asc' 
            ? a.totalCompanies - b.totalCompanies
            : b.totalCompanies - a.totalCompanies
        );
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedIndustries = sortedIndustries.slice(offset, offset + limit);
    
    // Calculate pagination info
    const totalItems = sortedIndustries.length;
    const totalPages = Math.ceil(totalItems / limit);

    // Generate facets for filtering
    const facets = {
      categories: getIndustryCategoryFacets(enhancedIndustries),
      companyCountRanges: getCompanyCountRangeFacets(enhancedIndustries),
      verificationRates: getVerificationRateFacets(enhancedIndustries)
    };

    // Track search
    await prisma.search.create({
      data: {
        userId: session.user.id,
        query: q || 'industries_browse',
        resultsCount: totalItems,
        searchType: 'industries'
      }
    });

    return NextResponse.json({
      success: true,
      industries: paginatedIndustries,
      totalCount: totalItems,
      pagination: {
        page: page,
        limit: limit,
        total: totalItems,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      facets: facets,
      metadata: {
        query: q,
        sortBy: sortBy,
        sortDirection: sortDirection,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Industries API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch industries',
        timestamp: new Date()
      },
      { status: 500 }
    );
  }
}

// Helper functions
function getIndustryDescription(industry: string): string {
  const descriptions: Record<string, string> = {
    'AUTOMOTIVE': 'Automotive manufacturers, dealerships, and related services',
    'CPG_FOOD_BEVERAGE': 'Consumer packaged goods in food and beverage sectors',
    'CPG_PERSONAL_CARE': 'Personal care and beauty consumer products',
    'CPG_HOUSEHOLD': 'Household goods and cleaning products',
    'FINANCIAL_SERVICES': 'Banking, insurance, investment, and financial technology',
    'HEALTHCARE_PHARMA': 'Healthcare providers, pharmaceutical, and medical devices',
    'RETAIL_ECOMMERCE': 'Retail stores, online commerce, and shopping platforms',
    'TECHNOLOGY': 'Software, hardware, telecommunications, and tech services',
    'ENTERTAINMENT_MEDIA': 'Entertainment, media, publishing, and content creation',
    'TRAVEL_HOSPITALITY': 'Travel, hotels, restaurants, and hospitality services',
    'SPORTS_FITNESS': 'Sports, fitness, outdoor recreation, and wellness',
    'FASHION_BEAUTY': 'Fashion, beauty, luxury goods, and lifestyle brands',
    'EDUCATION': 'Educational institutions, EdTech, and learning platforms',
    'REAL_ESTATE': 'Real estate, construction, and property management',
    'ENERGY': 'Energy, utilities, renewable energy, and oil & gas',
    'GOVERNMENT_NONPROFIT': 'Government agencies and nonprofit organizations'
  };
  
  return descriptions[industry] || 'Companies and organizations in this industry';
}

function getIndustryCategory(industry: string): string {
  const categories: Record<string, string> = {
    'CPG_FOOD_BEVERAGE': 'Consumer Goods',
    'CPG_PERSONAL_CARE': 'Consumer Goods',
    'CPG_HOUSEHOLD': 'Consumer Goods',
    'RETAIL_ECOMMERCE': 'Commerce',
    'TECHNOLOGY': 'Technology',
    'FINANCIAL_SERVICES': 'Financial',
    'HEALTHCARE_PHARMA': 'Healthcare',
    'ENTERTAINMENT_MEDIA': 'Media',
    'TRAVEL_HOSPITALITY': 'Services',
    'AUTOMOTIVE': 'Manufacturing',
    'SPORTS_FITNESS': 'Lifestyle',
    'FASHION_BEAUTY': 'Lifestyle',
    'EDUCATION': 'Services',
    'REAL_ESTATE': 'Real Estate',
    'ENERGY': 'Energy',
    'GOVERNMENT_NONPROFIT': 'Public Sector'
  };
  
  return categories[industry] || 'Other';
}

function getIndustryTags(industry: string): string[] {
  const tags: Record<string, string[]> = {
    'TECHNOLOGY': ['Innovation', 'Digital', 'Software', 'SaaS'],
    'ENTERTAINMENT_MEDIA': ['Content', 'Streaming', 'Publishing', 'Social'],
    'CPG_FOOD_BEVERAGE': ['FMCG', 'Consumer', 'Brands', 'Retail'],
    'FINANCIAL_SERVICES': ['FinTech', 'Banking', 'Insurance', 'Investment'],
    'HEALTHCARE_PHARMA': ['Medical', 'Biotech', 'Wellness', 'Healthcare'],
    'AUTOMOTIVE': ['Mobility', 'Electric', 'Transportation', 'Manufacturing'],
    'SPORTS_FITNESS': ['Active', 'Wellness', 'Outdoor', 'Lifestyle']
  };
  
  return tags[industry] || ['Business'];
}

function isIndustryFeatured(industry: string): boolean {
  const featuredIndustries = [
    'TECHNOLOGY',
    'ENTERTAINMENT_MEDIA', 
    'CPG_FOOD_BEVERAGE',
    'FINANCIAL_SERVICES',
    'AUTOMOTIVE'
  ];
  
  return featuredIndustries.includes(industry);
}

function getIndustryCategoryFacets(industries: any[]) {
  const categories = industries.reduce((acc, industry) => {
    const category = industry.category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(categories).map(([category, count]) => ({
    value: category,
    label: category,
    count: count
  }));
}

function getCompanyCountRangeFacets(industries: any[]) {
  const ranges = [
    { min: 0, max: 10, label: '1-10 companies' },
    { min: 11, max: 50, label: '11-50 companies' },
    { min: 51, max: 100, label: '51-100 companies' },
    { min: 101, max: 500, label: '101-500 companies' },
    { min: 501, max: Infinity, label: '500+ companies' }
  ];

  return ranges.map(range => ({
    value: `${range.min}-${range.max === Infinity ? 'plus' : range.max}`,
    label: range.label,
    count: industries.filter(industry => 
      industry.totalCompanies >= range.min && 
      industry.totalCompanies <= range.max
    ).length
  }));
}

function getVerificationRateFacets(industries: any[]) {
  const ranges = [
    { min: 0, max: 25, label: '0-25% verified' },
    { min: 26, max: 50, label: '26-50% verified' },
    { min: 51, max: 75, label: '51-75% verified' },
    { min: 76, max: 100, label: '76-100% verified' }
  ];

  return ranges.map(range => ({
    value: `${range.min}-${range.max}`,
    label: range.label,
    count: industries.filter(industry => 
      industry.verificationRate >= range.min && 
      industry.verificationRate <= range.max
    ).length
  }));
} 