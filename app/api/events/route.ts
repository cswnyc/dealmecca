import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers (optional for public access)
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const userTier = request.headers.get('x-user-tier')
    
    // Allow access without authentication for public testing

    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const industry = searchParams.get('industry')
    const location = searchParams.get('location')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const minCost = searchParams.get('minCost')
    const maxCost = searchParams.get('maxCost')
    const isVirtual = searchParams.get('isVirtual')
    const isHybrid = searchParams.get('isHybrid')
    const status = searchParams.get('status') || 'PUBLISHED' // Default to published events
    const createdBy = searchParams.get('createdBy') // Filter by creator (admin only)
    const hasCapacity = searchParams.get('hasCapacity') // Filter events with/without capacity limits
    const availableOnly = searchParams.get('availableOnly') // Filter only events with available spots
    const company = searchParams.get('company') // Filter by company with attendees
    const sortBy = searchParams.get('sortBy') || 'startDate'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}

    // Default to published events unless admin specifically requests others
    if (userRole === 'ADMIN' && status) {
      where.status = status
    } else {
      where.status = 'PUBLISHED' // Non-admins can only see published events
    }

    if (query) {
      where.OR = [
        { name: { startsWith: query } },
        { name: { endsWith: query } },
        { description: { startsWith: query } },
        { description: { endsWith: query } },
        { location: { startsWith: query } },
        { location: { endsWith: query } },
        { venue: { startsWith: query } },
        { venue: { endsWith: query } },
        { organizerName: { startsWith: query } },
        { organizerName: { endsWith: query } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (industry) {
      where.industry = {
        startsWith: industry
      }
    }

    if (location) {
      where.location = {
        startsWith: location
      }
    }

    if (startDate) {
      where.startDate = {
        gte: new Date(startDate)
      }
    }

    if (endDate) {
      where.endDate = {
        lte: new Date(endDate)
      }
    }

    if (minCost) {
      where.estimatedCost = {
        gte: parseInt(minCost)
      }
    }

    if (maxCost) {
      where.estimatedCost = {
        ...where.estimatedCost,
        lte: parseInt(maxCost)
      }
    }

    if (isVirtual === 'true') {
      where.isVirtual = true
    }

    if (isHybrid === 'true') {
      where.isHybrid = true
    }

    // Admin-only filters
    if (userRole === 'ADMIN' && createdBy) {
      where.createdBy = createdBy
    }

    if (hasCapacity === 'true') {
      where.capacity = { not: null }
    } else if (hasCapacity === 'false') {
      where.capacity = null
    }

    // Filter by company with attendees (admin only)
    if (userRole === 'ADMIN' && company) {
      where.attendees = {
        some: {
          OR: [
            { companyId: company },
            { contact: { companyId: company } }
          ]
        }
      }
    }

    // Filter by registration deadline if provided
    const now = new Date()
    if (availableOnly === 'true') {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { registrationDeadline: null }, // No deadline
            { registrationDeadline: { gte: now } } // Deadline hasn't passed
          ]
        }
      ]
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'startDate') {
      orderBy.startDate = sortOrder
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'rating') {
      orderBy.avgOverallRating = sortOrder
    } else if (sortBy === 'cost') {
      orderBy.estimatedCost = sortOrder
    } else if (sortBy === 'attendeeCount') {
      orderBy.attendeeCount = sortOrder
    } else {
      orderBy.startDate = 'asc'
    }

    // Get events with attendee counts
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
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
            where: userId ? {
              userId: userId
            } : {
              id: 'never-match' // Safe query that returns no results when no userId
            },
            select: {
              id: true,
              status: true,
              isGoing: true,
              hasAttended: true,
              companyId: true,
              contactId: true,
              registeredAt: true
            }
          },
          creator: userRole === 'ADMIN' ? {
            select: {
              id: true,
              name: true,
              email: true
            }
          } : false
        }
      }),
      prisma.event.count({ where })
    ])

    // Transform events to include user attendance status and capacity info
    const transformedEvents = events.map((event: any) => {
      const userAttendance = event.attendees[0] || null
      const { attendees, _count, ...eventData } = event
      
      // Calculate capacity status
      const registeredCount = _count.attendees
      const isAtCapacity = event.capacity !== null && registeredCount >= event.capacity
      const isNearCapacity = event.capacity !== null && registeredCount >= (event.capacity * 0.9)
      const isRegistrationClosed = event.registrationDeadline ? new Date(event.registrationDeadline) < new Date() : false
      
      return {
        ...eventData,
        attendeesCount: registeredCount,
        ratingsCount: _count.ratings,
        userAttendance: userAttendance ? {
          status: userAttendance.status,
          isGoing: userAttendance.isGoing,
          hasAttended: userAttendance.hasAttended
        } : null,
        // Parse industry JSON string to array safely
        industry: (() => {
          try {
            return JSON.parse(event.industry || '[]');
          } catch (e) {
            return [];
          }
        })(),
        // Capacity status information
        capacityStatus: {
          isAtCapacity,
          isNearCapacity,
          isRegistrationClosed,
          availableSpots: event.capacity ? Math.max(0, event.capacity - registeredCount) : null,
          fillPercentage: event.capacity ? Math.round((registeredCount / event.capacity) * 100) : 0
        },
        // Creator info for admins
        creator: userRole === 'ADMIN' && event.creator ? {
          id: event.creator.id,
          name: event.creator.name
        } : undefined
      }
    })

    return NextResponse.json({
      events: transformedEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create events
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    const { name, startDate, endDate, location, category, industry } = body
    
    if (!name || !startDate || !endDate || !location || !category || !industry) {
      return NextResponse.json(
        { error: 'Missing required fields: name, startDate, endDate, location, category, industry' },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Validate registration deadline if provided
    if (body.registrationDeadline) {
      const regDeadline = new Date(body.registrationDeadline)
      if (regDeadline >= start) {
        return NextResponse.json(
          { error: 'Registration deadline must be before event start date' },
          { status: 400 }
        )
      }
    }

    // Validate capacity if provided
    if (body.capacity && body.capacity < 1) {
      return NextResponse.json(
        { error: 'Capacity must be at least 1' },
        { status: 400 }
      )
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        name,
        description: body.description,
        website: body.website,
        startDate: start,
        endDate: end,
        location,
        venue: body.venue,
        category,
        industry: JSON.stringify(industry), // Store as JSON string
        estimatedCost: body.estimatedCost ? parseInt(body.estimatedCost) : null,
        attendeeCount: body.attendeeCount ? parseInt(body.attendeeCount) : null,
        isVirtual: body.isVirtual || false,
        isHybrid: body.isHybrid || false,
        imageUrl: body.imageUrl,
        logoUrl: body.logoUrl,
        organizerName: body.organizerName,
        organizerUrl: body.organizerUrl,
        registrationUrl: body.registrationUrl,
        callForSpeakers: body.callForSpeakers || false,
        sponsorshipAvailable: body.sponsorshipAvailable || false,
        // NEW FIELDS for Version 1
        createdBy: userId, // Set the creating admin
        status: body.status || 'DRAFT', // Default to draft
        capacity: body.capacity ? parseInt(body.capacity) : null,
        registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : null,
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
    const transformedEvent = {
      ...event,
      attendeesCount: event._count.attendees,
      ratingsCount: event._count.ratings,
      industry: JSON.parse(event.industry || '[]'),
      userAttendance: null,
      capacityStatus: {
        isAtCapacity: false,
        isNearCapacity: false,
        isRegistrationClosed: false,
        availableSpots: event.capacity || null,
        fillPercentage: 0
      },
      creator: event.creator
    }

    return NextResponse.json(transformedEvent, { status: 201 })
  } catch (error) {
    console.error('Event creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 