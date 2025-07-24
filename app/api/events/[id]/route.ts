import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
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

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            attendees: {
              where: {
                status: { in: ['REGISTERED', 'ATTENDING', 'ATTENDED'] }
              }
            },
            ratings: true
          }
        },
        attendees: {
          include: {
            user: {
              select: {
                name: true,
                subscriptionTier: true
              }
            },
            // Include org chart relationships
            company: {
              select: {
                id: true,
                name: true,
                companyType: true,
                industry: true,
                city: true,
                state: true
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
            }
          }
        },
        ratings: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                name: true,
                subscriptionTier: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Find current user's attendance record
    const currentUserAttendance = event.attendees.find((a: any) => a.userId === userId)

    // Calculate average ratings
    const avgRatings = event.ratings.length > 0 ? {
      overall: event.ratings.reduce((sum: number, r: any) => sum + r.overallRating, 0) / event.ratings.length,
      networking: event.ratings.reduce((sum: number, r: any) => sum + r.networkingRating, 0) / event.ratings.length,
      content: event.ratings.reduce((sum: number, r: any) => sum + r.contentRating, 0) / event.ratings.length,
      roi: event.ratings.reduce((sum: number, r: any) => sum + r.roiRating, 0) / event.ratings.length,
    } : {
      overall: 0,
      networking: 0,
      content: 0,
      roi: 0
    }

    // Calculate average costs from attendees who provided cost data
    const costData = event.attendees.filter((a: any) => a.totalCost != null && a.totalCost > 0)
    const avgCosts = costData.length > 0 ? {
      registration: Math.round(costData.reduce((sum: number, a: any) => sum + ((a.totalCost || 0) * 0.3), 0) / costData.length),
      travel: Math.round(costData.reduce((sum: number, a: any) => sum + ((a.totalCost || 0) * 0.4), 0) / costData.length),
      accommodation: Math.round(costData.reduce((sum: number, a: any) => sum + ((a.totalCost || 0) * 0.3), 0) / costData.length),
      total: Math.round(costData.reduce((sum: number, a: any) => sum + (a.totalCost || 0), 0) / costData.length)
    } : {
      registration: event.estimatedCost ? Math.round(event.estimatedCost * 0.3) : 1500,
      travel: event.estimatedCost ? Math.round(event.estimatedCost * 0.4) : 2000,
      accommodation: event.estimatedCost ? Math.round(event.estimatedCost * 0.3) : 1500,
      total: event.estimatedCost || 5000
    }

    // Calculate ROI statistics
    const roiData = event.attendees.filter((a: any) => a.connectionsMade > 0 || a.dealsFromEvent > 0 || (a.revenueFromEvent != null && a.revenueFromEvent > 0))
    const roiStats = roiData.length > 0 ? {
      avgConnections: Math.round(roiData.reduce((sum: number, a: any) => sum + (a.connectionsMade || 0), 0) / roiData.length),
      avgDeals: Math.round(roiData.reduce((sum: number, a: any) => sum + (a.dealsFromEvent || 0), 0) / roiData.length),
      avgRevenue: Math.round(roiData.reduce((sum: number, a: any) => sum + (a.revenueFromEvent || 0), 0) / roiData.length)
    } : {
      avgConnections: 15,
      avgDeals: 3,
      avgRevenue: 25000
    }

    // Transform attendees data for privacy and include org chart info
    const transformedAttendees = event.attendees.map((attendee: any) => ({
      id: attendee.id,
      status: attendee.status,
      isGoing: attendee.isGoing,
      registeredAt: attendee.registeredAt,
      user: {
        name: attendee.user.name ? attendee.user.name.charAt(0) + '***' : 'Anonymous',
        subscriptionTier: attendee.user.subscriptionTier
      },
      company: attendee.company ? {
        id: attendee.company.id,
        name: attendee.company.name,
        companyType: attendee.company.companyType,
        industry: attendee.company.industry,
        location: `${attendee.company.city || ''}${attendee.company.city && attendee.company.state ? ', ' : ''}${attendee.company.state || ''}`.trim() || null
      } : null,
      contact: attendee.contact ? {
        id: attendee.contact.id,
        name: `${attendee.contact.firstName} ${attendee.contact.lastName}`,
        title: attendee.contact.title,
        department: attendee.contact.department,
        seniority: attendee.contact.seniority
      } : null,
      createdAt: attendee.createdAt
    }))

    // Transform reviews for privacy
    const transformedReviews = event.ratings.map((rating: any) => ({
      id: rating.id,
      overallRating: rating.overallRating,
      networkingRating: rating.networkingRating,
      contentRating: rating.contentRating,
      roiRating: rating.roiRating,
      review: rating.review,
      wouldRecommend: rating.wouldRecommend,
      wouldAttendAgain: rating.wouldAttendAgain,
      bestFor: rating.bestFor ? JSON.parse(rating.bestFor) : [],
      worstAspect: rating.worstAspect,
      isVerified: rating.isVerified,
      helpfulVotes: rating.helpfulVotes,
      createdAt: rating.createdAt,
      user: {
        name: rating.user.name ? rating.user.name.charAt(0) + '***' : 'Anonymous',
        subscriptionTier: rating.user.subscriptionTier
      }
    }))

    // Calculate capacity status
    const registeredCount = event._count.attendees
    const isAtCapacity = event.capacity !== null && registeredCount >= event.capacity
    const isNearCapacity = event.capacity !== null && registeredCount >= (event.capacity * 0.9)
    const isRegistrationClosed = event.registrationDeadline ? new Date(event.registrationDeadline) < new Date() : false

    // Build response
    const response = {
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        venue: event.venue,
        category: event.category,
        industry: event.industry,
        isVirtual: event.isVirtual,
        isHybrid: event.isHybrid,
        websiteUrl: event.website,
        registrationUrl: event.registrationUrl,
        logoUrl: event.logoUrl,
        bannerUrl: event.imageUrl,
        estimatedCost: event.estimatedCost,
        // NEW FIELDS for Version 1
        status: event.status,
        capacity: event.capacity,
        registrationDeadline: event.registrationDeadline,
        eventType: event.eventType,
        creator: event.creator,
        capacityStatus: {
          isAtCapacity,
          isNearCapacity,
          isRegistrationClosed,
          availableSpots: event.capacity ? Math.max(0, event.capacity - registeredCount) : null,
          fillPercentage: event.capacity ? Math.round((registeredCount / event.capacity) * 100) : 0
        },
        _count: {
          attendees: registeredCount,
          ratings: event._count.ratings
        }
      },
      currentUserAttendance: currentUserAttendance ? {
        id: currentUserAttendance.id,
        status: currentUserAttendance.status,
        isGoing: currentUserAttendance.isGoing,
        hasAttended: currentUserAttendance.hasAttended,
        registeredAt: currentUserAttendance.registeredAt,
        companyId: currentUserAttendance.companyId,
        contactId: currentUserAttendance.contactId,
        createdAt: currentUserAttendance.createdAt
      } : null,
      avgRatings,
      avgCosts,
      roiStats,
      attendees: transformedAttendees,
      reviews: transformedReviews
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Event detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update events
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Validate dates if provided
    if (body.startDate && body.endDate) {
      const start = new Date(body.startDate)
      const end = new Date(body.endDate)
      
      if (start >= end) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        )
      }
    }

    // Validate registration deadline if provided
    if (body.registrationDeadline && body.startDate) {
      const regDeadline = new Date(body.registrationDeadline)
      const start = new Date(body.startDate)
      if (regDeadline >= start) {
        return NextResponse.json(
          { error: 'Registration deadline must be before event start date' },
          { status: 400 }
        )
      }
    }

    // Validate capacity if provided
    if (body.capacity !== undefined && body.capacity !== null && body.capacity < 1) {
      return NextResponse.json(
        { error: 'Capacity must be at least 1 or null for unlimited' },
        { status: 400 }
      )
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        website: body.website,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        location: body.location,
        venue: body.venue,
        category: body.category,
        industry: body.industry ? JSON.stringify(body.industry) : undefined,
        estimatedCost: body.estimatedCost ? parseInt(body.estimatedCost) : undefined,
        attendeeCount: body.attendeeCount ? parseInt(body.attendeeCount) : undefined,
        isVirtual: body.isVirtual,
        isHybrid: body.isHybrid,
        imageUrl: body.imageUrl,
        logoUrl: body.logoUrl,
        organizerName: body.organizerName,
        organizerUrl: body.organizerUrl,
        registrationUrl: body.registrationUrl,
        callForSpeakers: body.callForSpeakers,
        sponsorshipAvailable: body.sponsorshipAvailable,
        // NEW FIELDS for Version 1
        status: body.status,
        capacity: body.capacity !== undefined ? (body.capacity ? parseInt(body.capacity) : null) : undefined,
        registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : undefined,
        eventType: body.eventType,
      },
      include: {
        _count: {
          select: {
            attendees: {
              where: {
                status: { in: ['REGISTERED', 'ATTENDING', 'ATTENDED'] }
              }
            },
            ratings: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Transform response
    const registeredCount = updatedEvent._count.attendees
    const isAtCapacity = updatedEvent.capacity !== null && registeredCount >= updatedEvent.capacity
    const isNearCapacity = updatedEvent.capacity !== null && registeredCount >= (updatedEvent.capacity * 0.9)
    const isRegistrationClosed = updatedEvent.registrationDeadline ? new Date(updatedEvent.registrationDeadline) < new Date() : false

    const transformedEvent = {
      ...updatedEvent,
      attendeesCount: registeredCount,
      ratingsCount: updatedEvent._count.ratings,
      industry: JSON.parse(updatedEvent.industry || '[]'),
      userAttendance: null,
      capacityStatus: {
        isAtCapacity,
        isNearCapacity,
        isRegistrationClosed,
        availableSpots: updatedEvent.capacity ? Math.max(0, updatedEvent.capacity - registeredCount) : null,
        fillPercentage: updatedEvent.capacity ? Math.round((registeredCount / updatedEvent.capacity) * 100) : 0
      },
      creator: updatedEvent.creator
    }

    return NextResponse.json(transformedEvent)
  } catch (error) {
    console.error('Event update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete events
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            attendees: true,
            ratings: true
          }
        }
      }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Enhanced deletion constraints for Version 1
    const hasRegistrations = existingEvent._count.attendees > 0
    const hasRatings = existingEvent._count.ratings > 0
    const isPublished = existingEvent.status === 'PUBLISHED'
    const hasCapacityLimits = existingEvent.capacity !== null
    
    // More restrictive deletion policy for published events with registrations
    if (isPublished && hasRegistrations) {
      return NextResponse.json(
        { 
          error: 'Cannot delete published event with registrations',
          message: 'Published events with attendees should be cancelled instead of deleted to preserve data integrity.',
          suggestion: 'Consider updating the event status to CANCELLED instead',
          eventInfo: {
            status: existingEvent.status,
            attendeeCount: existingEvent._count.attendees,
            ratingsCount: existingEvent._count.ratings,
            capacity: existingEvent.capacity
          }
        },
        { status: 409 }
      )
    }
    
    // Allow deletion of draft events or events without registrations/ratings
    if (hasRatings && hasRegistrations) {
      return NextResponse.json(
        { 
          error: 'Cannot delete event with existing attendees and ratings',
          message: 'This event has both attendees and ratings and cannot be deleted to preserve data integrity.',
          suggestion: 'Consider updating the event status to CANCELLED instead'
        },
        { status: 409 }
      )
    }

    // Delete event
    await prisma.event.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Event deleted successfully',
      deletedEvent: {
        id: id,
        name: existingEvent.name
      }
    })
  } catch (error) {
    console.error('Event deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 