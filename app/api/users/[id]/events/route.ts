import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user info from middleware headers
    const requestingUserId = request.headers.get('x-user-id');
    
    if (!requestingUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get user's event attendances
    const userEvents = await prisma.eventAttendee.findMany({
      where: {
        userId: id
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            description: true,
            startDate: true,
            endDate: true,
            location: true,
            category: true,
            status: true,
            isVirtual: true,
            isHybrid: true
          }
        }
      },
      orderBy: {
        event: {
          startDate: 'desc'
        }
      }
    });

    // Format the response to match the expected interface
    const events = userEvents.map((attendance: any) => ({
      id: attendance.id,
      status: attendance.status,
      isGoing: attendance.isGoing,
      hasAttended: attendance.hasAttended,
      registeredAt: attendance.createdAt,
      event: attendance.event
    }));

    return NextResponse.json({ 
      events
    });

  } catch (error) {
    console.error('Error fetching user events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user events' },
      { status: 500 }
    );
  }
} 