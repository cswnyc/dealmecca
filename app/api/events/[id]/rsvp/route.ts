import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Check if event exists and get capacity info
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            attendees: {
              where: {
                status: { in: ['REGISTERED', 'ATTENDING', 'ATTENDED'] }
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if event is published
    if (event.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Event is not available for registration' },
        { status: 400 }
      )
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      return NextResponse.json(
        { error: 'Registration deadline has passed' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { 
      status, 
      isGoing = false, 
      companyId, 
      contactId, 
      connectionsIntended = 0, 
      totalCost, 
      notes 
    } = body

    // Validate status
    const validStatuses = ['INTERESTED', 'PLANNING_TO_ATTEND', 'REGISTERED', 'ATTENDING', 'CANCELLED']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status', validStatuses },
        { status: 400 }
      )
    }

    // Check capacity for registration statuses
    if (['REGISTERED', 'ATTENDING'].includes(status)) {
      const currentRegistered = event._count.attendees
      
      if (event.capacity && currentRegistered >= event.capacity) {
        // Check if user is already registered (allow status updates)
        const existingAttendance = await prisma.eventAttendee.findUnique({
          where: {
            userId_eventId: {
              userId: userId,
              eventId: id
            }
          }
        })

        if (!existingAttendance || !['REGISTERED', 'ATTENDING', 'ATTENDED'].includes(existingAttendance.status)) {
          return NextResponse.json(
            { 
              error: 'Event is at capacity', 
              suggestion: 'You can register as INTERESTED to be notified if spots become available',
              capacityInfo: {
                capacity: event.capacity,
                registered: currentRegistered,
                available: 0
              }
            },
            { status: 409 }
          )
        }
      }
    }

    // Validate org chart relationships if provided
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      })
      if (!company) {
        return NextResponse.json(
          { error: 'Invalid company ID' },
          { status: 400 }
        )
      }
    }

    if (contactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: contactId }
      })
      if (!contact) {
        return NextResponse.json(
          { error: 'Invalid contact ID' },
          { status: 400 }
        )
      }
      
      // Ensure contact belongs to the specified company if both are provided
      if (companyId && contact.companyId !== companyId) {
        return NextResponse.json(
          { error: 'Contact does not belong to the specified company' },
          { status: 400 }
        )
      }
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
        where: {
          userId_eventId: {
            userId: userId,
            eventId: id
          }
        },
        data: {
          status,
          isGoing,
          companyId: companyId || existingAttendee.companyId,
          contactId: contactId || existingAttendee.contactId,
          connectionsIntended: connectionsIntended || existingAttendee.connectionsIntended,
          totalCost: totalCost !== undefined ? totalCost : existingAttendee.totalCost,
          notes: notes !== undefined ? notes : existingAttendee.notes,
          registeredAt: ['REGISTERED', 'ATTENDING'].includes(status) && !['REGISTERED', 'ATTENDING', 'ATTENDED'].includes(existingAttendee.status) 
            ? new Date() 
            : existingAttendee.registeredAt
        },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              startDate: true,
              capacity: true
            }
          },
          company: {
            select: {
              id: true,
              name: true,
              companyType: true
            }
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true
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
          status,
          isGoing,
          companyId,
          contactId,
          connectionsIntended,
          totalCost,
          notes,
          registeredAt: ['REGISTERED', 'ATTENDING'].includes(status) ? new Date() : new Date()
        },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              startDate: true,
              capacity: true
            }
          },
          company: {
            select: {
              id: true,
              name: true,
              companyType: true
            }
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true
            }
          }
        }
      })
    }

    // Get updated capacity info
    const updatedEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            attendees: {
              where: {
                status: { in: ['REGISTERED', 'ATTENDING', 'ATTENDED'] }
              }
            }
          }
        }
      }
    })

    const registeredCount = updatedEvent?._count.attendees || 0
    const capacityStatus = {
      isAtCapacity: event.capacity !== null && registeredCount >= event.capacity,
      isNearCapacity: event.capacity !== null && registeredCount >= (event.capacity * 0.9),
      availableSpots: event.capacity ? Math.max(0, event.capacity - registeredCount) : null,
      fillPercentage: event.capacity ? Math.round((registeredCount / event.capacity) * 100) : 0
    }

    // Track networking event RSVP activity (only for meaningful engagement)
    if (['REGISTERED', 'ATTENDING'].includes(status)) {
      try {
        // Prepare company affiliations for tracking
        const companyAffiliations: string[] = [];
        if (attendee.company) {
          companyAffiliations.push(attendee.company.name);
        }

        await prisma.userNetworkingActivity.create({
          data: {
            userId: userId,
            companyId: attendee.companyId,
            interactionType: 'NETWORKING_EVENT_JOINED',
            metadata: JSON.stringify({
              eventId: id,
              eventName: attendee.event.name,
              rsvpStatus: status,
              companyAffiliations,
              connectionsIntended: connectionsIntended || 0
            })
          }
        });
      } catch (trackingError) {
        // Don't fail the RSVP if tracking fails, just log it
        console.warn('Failed to track networking activity for RSVP:', trackingError);
      }
    }

    return NextResponse.json({
      message: existingAttendee ? 'RSVP updated successfully' : 'RSVP created successfully',
      attendance: {
        id: attendee.id,
        status: attendee.status,
        isGoing: attendee.isGoing,
        registeredAt: attendee.registeredAt,
        event: {
          id: attendee.event.id,
          name: attendee.event.name,
          startDate: attendee.event.startDate
        },
        company: attendee.company,
        contact: attendee.contact
      },
      capacityStatus
    }, { status: existingAttendee ? 200 : 201 })
    
  } catch (error) {
    console.error('RSVP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 