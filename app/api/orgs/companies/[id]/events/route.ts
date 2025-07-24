import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get events where this company has attendees
    const events = await prisma.event.findMany({
      where: {
        AND: [
          {
            OR: [
              { status: 'PUBLISHED' },
              { status: 'COMPLETED' }
            ]
          },
          {
            attendees: {
              some: {
                OR: [
                  // Direct company association
                  { companyId: id },
                  // Through contact's company
                  { 
                    contact: {
                      companyId: id
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      include: {
        attendees: {
          where: {
            OR: [
              { companyId: id },
              { 
                contact: {
                  companyId: id
                }
              }
            ]
          },
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            },
            contact: {
              select: {
                id: true,
                fullName: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            attendees: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    // Add company attendee count to each event
    const eventsWithCompanyCount = events.map((event: any) => ({
      ...event,
      companyAttendeeCount: event.attendees.length,
      companyAttendees: event.attendees.map((attendee: any) => ({
        id: attendee.id,
        status: attendee.status,
        user: attendee.user,
        contact: attendee.contact
      }))
    }));

    return NextResponse.json({ 
      events: eventsWithCompanyCount
    });

  } catch (error) {
    console.error('Error fetching company events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company events' },
      { status: 500 }
    );
  }
} 