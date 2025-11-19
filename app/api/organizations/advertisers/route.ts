import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fixed Prisma schema validation - using valid CompanyType enum values
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry') || '';
    const location = searchParams.get('location') || '';

    // Build where clause
    const where: any = {
      OR: [
        { companyType: 'NATIONAL_ADVERTISER' },
        { companyType: 'LOCAL_ADVERTISER' },
        { companyType: 'ADVERTISER' }
      ]
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

    // Add industry filter if provided
    if (industry && industry !== 'all') {
      where.AND = where.AND || [];
      where.AND.push({
        industry: { equals: industry, mode: 'insensitive' }
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

    // Fetch advertisers from database
    const advertisers = await prisma.company.findMany({
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
        updatedAt: true,
        _count: {
          select: {
            contacts: {
              where: { isActive: true }
            },
            clientTeams: {
              where: {
                isActive: true,
                type: 'ADVERTISER_TEAM'
              }
            }
          }
        },
        clientTeams: {
          where: {
            isActive: true,
            type: 'ADVERTISER_TEAM'
          },
          take: 10,
          select: {
            company: {
              select: {
                id: true,
                name: true,
                companyType: true,
                logoUrl: true,
                verified: true
              }
            },
            description: true
          },
          orderBy: {
            updatedAt: 'desc'
          }
        }
      },
      orderBy: [
        { verified: 'desc' },
        { name: 'asc' }
      ]
    });

    // Transform to match expected format
    const transformedAdvertisers = advertisers.map(advertiser => {
      // Calculate last activity (for now, use updatedAt)
      const lastActivityDate = new Date(advertiser.updatedAt);
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
        id: advertiser.id,
        name: advertiser.name,
        type: advertiser.companyType,
        industry: advertiser.industry || '',
        city: advertiser.city || '',
        state: advertiser.state || '',
        country: advertiser.country || 'US',
        verified: advertiser.verified,
        logoUrl: advertiser.logoUrl || undefined,
        teamCount: advertiser._count.contacts || 0,
        lastActivity,
        agencies: advertiser.clientTeams.map(team => ({
          id: team.company.id,
          name: team.company.name,
          companyType: team.company.companyType,
          logoUrl: team.company.logoUrl || undefined,
          verified: team.company.verified,
          isAOR: team.description?.includes('Agency of Record') || team.description?.includes('AOR') || false
        }))
      };
    });

    return NextResponse.json({
      success: true,
      advertisers: transformedAdvertisers,
      total: transformedAdvertisers.length
    });

  } catch (error) {
    console.error('Error fetching advertisers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch advertisers' },
      { status: 500 }
    );
  }
}
