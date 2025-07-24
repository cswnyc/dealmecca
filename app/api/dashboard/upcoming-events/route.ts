import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '3')

    // Get upcoming events the user is attending or might be interested in
    const now = new Date()
    
    // First try to get events user is registered for
    const userEvents = await prisma.event.findMany({
      where: {
        startDate: {
          gte: now
        },
        attendees: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        attendees: {
          where: {
            userId: userId
          },
          select: {
            status: true,
            isGoing: true
          }
        },
        _count: {
          select: {
            attendees: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      take: limit
    })

    // Format user events
    const formattedUserEvents = userEvents.map(event => ({
      id: event.id,
      name: event.name,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: event.location,
      venue: event.venue,
      category: event.category,
      industry: event.industry,
      estimatedCost: event.estimatedCost,
      expectedAttendees: event.attendeeCount,
      isVirtual: event.isVirtual,
      isHybrid: event.isHybrid,
      imageUrl: event.imageUrl,
      registrationUrl: event.registrationUrl,
      attendanceStatus: event.attendees?.[0]?.status || 'REGISTERED',
      avgRating: event.avgOverallRating || 0,
      isUserGoing: event.attendees?.[0]?.isGoing || false,
      totalAttendees: event._count.attendees,
      isRegistered: true
    }))

    // If user has fewer registered events than limit, fill with recommended events
    let allEvents = formattedUserEvents
    if (formattedUserEvents.length < limit) {
      const additionalEvents = await prisma.event.findMany({
        where: {
          startDate: {
            gte: now
          },
          NOT: {
            attendees: {
              some: {
                userId: userId
              }
            }
          }
        },
        include: {
          _count: {
            select: {
              attendees: true
            }
          }
        },
        orderBy: [
          { attendeeCount: 'desc' },
          { startDate: 'asc' }
        ],
        take: limit - formattedUserEvents.length
      })

      // Format additional events
      const formattedAdditionalEvents = additionalEvents.map(event => ({
        id: event.id,
        name: event.name,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        location: event.location,
        venue: event.venue,
        category: event.category,
        industry: event.industry,
        estimatedCost: event.estimatedCost,
        expectedAttendees: event.attendeeCount,
        isVirtual: event.isVirtual,
        isHybrid: event.isHybrid,
        imageUrl: event.imageUrl,
        registrationUrl: event.registrationUrl,
        attendanceStatus: 'INTERESTED' as const,
        avgRating: event.avgOverallRating || 0,
        isUserGoing: false,
        totalAttendees: event._count.attendees,
        isRegistered: false
      }))

      allEvents = [...formattedUserEvents, ...formattedAdditionalEvents]
    }

    return NextResponse.json({
      events: allEvents,
      total: allEvents.length
    })

  } catch (error) {
    console.error('Dashboard upcoming events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 