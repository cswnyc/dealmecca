import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fixed Prisma schema validation - using DSP_SSP as single enum value
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const location = searchParams.get('location') || '';

    // Build where clause
    const where: any = {
      companyType: 'DSP_SSP'
    };

    // Add search filter if provided
    if (search) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    // Add location filter if provided
    if (location && location !== 'all') {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { state: location },
          { city: { contains: location, mode: 'insensitive' } }
        ]
      });
    }

    // Fetch DSPs/SSPs from database
    const platforms = await prisma.company.findMany({
      where,
      select: {
        id: true,
        name: true,
        companyType: true,
        industry: true,
        city: true,
        state: true,
        country: true,
        verified: true,
        logoUrl: true,
        website: true,
        updatedAt: true,
        _count: {
          select: {
            contacts: {
              where: { isActive: true }
            },
            CompanyPartnership_agencyIdToCompany: {
              where: { isActive: true }
            },
            CompanyPartnership_advertiserIdToCompany: {
              where: { isActive: true }
            }
          }
        },
        CompanyPartnership_agencyIdToCompany: {
          where: { isActive: true },
          take: 5,
          select: {
            advertiser: {
              select: {
                id: true,
                name: true,
                companyType: true,
                logoUrl: true,
                verified: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        }
      },
      orderBy: [
        { verified: 'desc' },
        { name: 'asc' }
      ]
    });

    // Transform to match expected format
    const transformedPlatforms = platforms.map(platform => {
      // Calculate last activity (for now, use updatedAt)
      const lastActivityDate = new Date(platform.updatedAt);
      const now = new Date();
      const diffMs = now.getTime() - lastActivityDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      let lastActivity = '24+ hrs';
      if (diffHours < 1) {
        lastActivity = '< 1 hr';
      } else if (diffHours < 24) {
        lastActivity = `${diffHours} hr${diffHours > 1 ? 's' : ''}`;
      } else if (diffDays < 7) {
        lastActivity = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else {
        lastActivity = `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
      }

      return {
        id: platform.id,
        name: platform.name,
        type: platform.companyType,
        industry: platform.industry || '',
        city: platform.city || '',
        state: platform.state || '',
        country: platform.country || 'US',
        verified: platform.verified,
        logoUrl: platform.logoUrl || undefined,
        website: platform.website || undefined,
        teamCount: platform._count.contacts || 0,
        lastActivity,
        partnerCount: platform._count.CompanyPartnership_agencyIdToCompany + platform._count.CompanyPartnership_advertiserIdToCompany,
        clients: platform.CompanyPartnership_agencyIdToCompany.map(partnership => ({
          id: partnership.advertiser.id,
          name: partnership.advertiser.name,
          companyType: partnership.advertiser.companyType,
          logoUrl: partnership.advertiser.logoUrl || undefined,
          verified: partnership.advertiser.verified
        }))
      };
    });

    return NextResponse.json({
      success: true,
      platforms: transformedPlatforms,
      total: transformedPlatforms.length
    });

  } catch (error) {
    console.error('Error fetching DSP/SSP platforms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platforms' },
      { status: 500 }
    );
  }
}
