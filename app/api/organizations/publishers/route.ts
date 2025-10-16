import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';

    // Build where clause
    const where: any = {
      companyType: 'PUBLISHER'
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

    // Fetch publishers from database
    const publishers = await prisma.company.findMany({
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
            }
          }
        }
      },
      orderBy: [
        { verified: 'desc' },
        { name: 'asc' }
      ]
    });

    // Transform to match expected format
    const transformedPublishers = publishers.map(publisher => {
      // Calculate last activity (for now, use updatedAt)
      const lastActivityDate = new Date(publisher.updatedAt);
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
        id: publisher.id,
        name: publisher.name,
        type: publisher.companyType,
        industry: publisher.industry || '',
        city: publisher.city || '',
        state: publisher.state || '',
        country: publisher.country || 'US',
        verified: publisher.verified,
        logoUrl: publisher.logoUrl || undefined,
        website: publisher.website || undefined,
        teamCount: publisher._count.contacts || 0,
        lastActivity
      };
    });

    return NextResponse.json({
      success: true,
      publishers: transformedPublishers,
      total: transformedPublishers.length
    });

  } catch (error) {
    console.error('Error fetching publishers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch publishers' },
      { status: 500 }
    );
  }
}
