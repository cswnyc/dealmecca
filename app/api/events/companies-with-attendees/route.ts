import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin users can access this endpoint
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get companies that have attendees in events
    const companies = await prisma.company.findMany({
      where: {
        eventAttendees: {
          some: {} // Has at least one event attendee
        }
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            eventAttendees: true
          }
        }
      },
      orderBy: [
        {
          eventAttendees: {
            _count: 'desc'
          }
        },
        {
          name: 'asc'
        }
      ]
    });

    return NextResponse.json({ 
      companies: companies.map((company: any) => ({
        id: company.id,
        name: company.name,
        attendeeCount: company._count.eventAttendees
      }))
    });

  } catch (error) {
    console.error('Error fetching companies with attendees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
} 