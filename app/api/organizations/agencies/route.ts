import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const location = searchParams.get('location') || '';

    // Build where clause
    const where: any = {
      OR: [
        { companyType: 'AGENCY' },
        { companyType: 'INDEPENDENT_AGENCY' },
        { companyType: 'HOLDING_COMPANY_AGENCY' },
        { companyType: 'MEDIA_HOLDING_COMPANY' }
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

    // Add type filter if provided
    if (type && type !== 'all') {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { companyType: type.toUpperCase() },
          { agencyType: type.toUpperCase() }
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

    // Fetch agencies from database
    const agencies = await prisma.Company.findMany({
      where,
      select: {
        id: true,
        name: true,
        companyType: true,
        agencyType: true,
        city: true,
        state: true,
        country: true,
        verified: true,
        logoUrl: true,
        teamCount: true,
        updatedAt: true,
        _count: {
          select: {
            contacts: true
          }
        }
      },
      orderBy: [
        { verified: 'desc' },
        { name: 'asc' }
      ]
    });

    // Transform to match expected format
    const transformedAgencies = agencies.map(agency => {
      // Determine agency type
      let type: 'INDEPENDENT_AGENCY' | 'HOLDING_COMPANY_AGENCY' | 'MEDIA_HOLDING_COMPANY' = 'INDEPENDENT_AGENCY';

      if (agency.companyType === 'HOLDING_COMPANY_AGENCY' || agency.agencyType === 'HOLDING_COMPANY') {
        type = 'HOLDING_COMPANY_AGENCY';
      } else if (agency.companyType === 'MEDIA_HOLDING_COMPANY') {
        type = 'MEDIA_HOLDING_COMPANY';
      } else if (agency.companyType === 'INDEPENDENT_AGENCY' || agency.agencyType === 'INDEPENDENT') {
        type = 'INDEPENDENT_AGENCY';
      }

      // Calculate last activity (for now, use updatedAt)
      const lastActivityDate = new Date(agency.updatedAt);
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
        id: agency.id,
        name: agency.name,
        type,
        city: agency.city || '',
        state: agency.state || '',
        country: agency.country || 'US',
        verified: agency.verified,
        logoUrl: agency.logoUrl || undefined,
        teamCount: agency.teamCount || agency._count.contacts || 0,
        lastActivity,
        // For now, clients array is empty since we don't have client relationships in the database
        clients: []
      };
    });

    return NextResponse.json({
      success: true,
      agencies: transformedAgencies,
      total: transformedAgencies.length
    });

  } catch (error) {
    console.error('Error fetching agencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agencies' },
      { status: 500 }
    );
  }
}
