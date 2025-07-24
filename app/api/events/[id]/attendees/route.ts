import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userTier = request.headers.get('x-user-tier')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // Filter by attendance status
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {
      eventId: id
    }

    if (status) {
      where.status = status
    }

    // Get attendees with privacy filtering
    const [attendees, total] = await Promise.all([
      prisma.eventAttendee.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
                  select: {
            id: true,
            status: true,
            isGoing: true,
            hasAttended: true,
            registeredAt: true,
            companyId: true,
            contactId: true,
            createdAt: true,
            // Include user info but filter for privacy
            user: {
              select: {
                id: true,
                name: true,
                subscriptionTier: true,
                // Only show connection info if user is Pro+
                ...(userTier !== 'FREE' && {
                  searches: {
                    take: 1,
                    select: { id: true }
                  }
                })
              }
            },
            // Include org chart relationships for networking
            company: {
              select: {
                id: true,
                name: true,
                companyType: true,
                industry: true,
                city: true,
                state: true,
                website: true
              }
            },
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                title: true,
                department: true,
                seniority: true
              }
            },
            // Only show ROI data for the current user
            ...(userId && {
              connectionsIntended: true,
              connectionsMade: true,
              leadsGenerated: true,
              dealsFromEvent: true,
              revenueFromEvent: true,
              totalCost: true,
              notes: true
            })
          }
      }),
      prisma.eventAttendee.count({ where })
    ])

    // Transform attendees data for privacy
    const transformedAttendees = attendees.map((attendee: any) => {
      const isCurrentUser = attendee.user.id === userId
      
      return {
        id: attendee.id,
        status: attendee.status,
        isGoing: attendee.isGoing,
        hasAttended: attendee.hasAttended,
        createdAt: attendee.createdAt,
        user: {
          id: attendee.user.id,
          // Anonymize names for privacy except for current user
          name: isCurrentUser ? attendee.user.name : 
                attendee.user.name ? attendee.user.name.charAt(0) + '***' : 'Anonymous',
          subscriptionTier: attendee.user.subscriptionTier,
          isActiveUser: userTier !== 'FREE' && attendee.user.searches ? attendee.user.searches.length > 0 : false,
          isCurrentUser
        },
        // Only show ROI data for current user
        ...(isCurrentUser && {
          connectionsIntended: attendee.connectionsIntended,
          connectionsMade: attendee.connectionsMade,
          leadsGenerated: attendee.leadsGenerated,
          dealsFromEvent: attendee.dealsFromEvent,
          revenueFromEvent: attendee.revenueFromEvent,
          totalCost: attendee.totalCost,
          notes: attendee.notes
        })
      }
    })

    // Get attendee statistics
    const stats = await prisma.eventAttendee.groupBy({
      by: ['status'],
      where: { eventId: id },
      _count: {
        status: true
      }
    })

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      attendees: transformedAttendees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        total,
        statusCounts,
        going: statusCounts['ATTENDING'] || 0,
        interested: statusCounts['INTERESTED'] || 0,
        attended: statusCounts['ATTENDED'] || 0
      }
    })
  } catch (error) {
    console.error('Event attendees API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      status, 
      isGoing, 
      connectionsIntended, 
      totalCost, 
      notes 
    } = body

    // Validate status
    const validStatuses = ['INTERESTED', 'PLANNING_TO_ATTEND', 'REGISTERED', 'ATTENDING', 'ATTENDED', 'CANCELLED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status', validStatuses },
        { status: 400 }
      )
    }

    // Check if user is already registered for this event
    const existingAttendee = await prisma.eventAttendee.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: id
        }
      }
    })

    let attendee
    if (existingAttendee) {
      // Update existing attendance
      attendee = await prisma.eventAttendee.update({
        where: { id: existingAttendee.id },
        data: {
          status: status || existingAttendee.status,
          isGoing: isGoing !== undefined ? isGoing : existingAttendee.isGoing,
          connectionsIntended: connectionsIntended !== undefined ? connectionsIntended : existingAttendee.connectionsIntended,
          totalCost: totalCost !== undefined ? totalCost : existingAttendee.totalCost,
          notes: notes !== undefined ? notes : existingAttendee.notes,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              subscriptionTier: true
            }
          },
          event: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true
            }
          }
        }
      })
    } else {
      // Create new attendance record
      attendee = await prisma.eventAttendee.create({
        data: {
          userId: userId,
          eventId: id,
          status: status || 'INTERESTED',
          isGoing: isGoing || false,
          connectionsIntended: connectionsIntended || 0,
          totalCost: totalCost || null,
          notes: notes || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              subscriptionTier: true
            }
          },
          event: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      message: existingAttendee ? 'Attendance updated' : 'Attendance registered',
      attendee: {
        id: attendee.id,
        status: attendee.status,
        isGoing: attendee.isGoing,
        hasAttended: attendee.hasAttended,
        connectionsIntended: attendee.connectionsIntended,
        connectionsMade: attendee.connectionsMade,
        leadsGenerated: attendee.leadsGenerated,
        dealsFromEvent: attendee.dealsFromEvent,
        revenueFromEvent: attendee.revenueFromEvent,
        totalCost: attendee.totalCost,
        notes: attendee.notes,
        createdAt: attendee.createdAt,
        updatedAt: attendee.updatedAt,
        user: attendee.user,
        event: attendee.event
      }
    })
  } catch (error) {
    console.error('Event attendance API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 