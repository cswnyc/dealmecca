import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // Filter by attendance status
    const timeframe = searchParams.get('timeframe') // upcoming, past, all
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = (page - 1) * limit

    // Build where clause for user's event attendances
    const where: any = {
      userId: userId
    }

    if (status) {
      where.status = status
    }

    // Add date filtering based on timeframe
    const now = new Date()
    let eventDateFilter: any = {}
    
    if (timeframe === 'upcoming') {
      eventDateFilter = {
        startDate: {
          gte: now
        }
      }
    } else if (timeframe === 'past') {
      eventDateFilter = {
        endDate: {
          lt: now
        }
      }
    }

    // Get user's event attendances
    const [attendances, total] = await Promise.all([
      prisma.eventAttendee.findMany({
        where,
        orderBy: [
          { event: { startDate: 'asc' } },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit,
        include: {
          event: {
            include: {
              _count: {
                select: {
                  attendees: true,
                  ratings: true
                }
              }
            }
          }
        }
      }),
      prisma.eventAttendee.count({ 
        where
      })
    ])

    // Filter out attendances where event doesn't match date criteria
    const filteredAttendances = attendances.filter(attendance => {
      if (!attendance.event) return false
      
      // Apply date filtering
      const now = new Date()
      if (timeframe === 'upcoming') {
        return attendance.event.startDate >= now
      } else if (timeframe === 'past') {
        return attendance.event.endDate < now
      }
      
      return true
    })

    // Transform attendances to include event data and user's ROI data
    const transformedAttendances = filteredAttendances.map(attendance => {
      const event = attendance.event!
      
      return {
        id: attendance.id,
        status: attendance.status,
        isGoing: attendance.isGoing,
        hasAttended: attendance.hasAttended,
        createdAt: attendance.createdAt,
        updatedAt: attendance.updatedAt,
        // ROI and personal data
        connectionsIntended: attendance.connectionsIntended,
        connectionsMade: attendance.connectionsMade,
        leadsGenerated: attendance.leadsGenerated,
        dealsFromEvent: attendance.dealsFromEvent,
        revenueFromEvent: attendance.revenueFromEvent,
        totalCost: attendance.totalCost,
        notes: attendance.notes,
        // Event details
        event: {
          id: event.id,
          name: event.name,
          description: event.description,
          website: event.website,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          venue: event.venue,
          category: event.category,
          industry: JSON.parse(event.industry || '[]'),
          estimatedCost: event.estimatedCost,
          attendeeCount: event.attendeeCount,
          isVirtual: event.isVirtual,
          isHybrid: event.isHybrid,
          imageUrl: event.imageUrl,
          logoUrl: event.logoUrl,
          organizerName: event.organizerName,
          organizerUrl: event.organizerUrl,
          registrationUrl: event.registrationUrl,
          // Aggregate ratings
          avgOverallRating: event.avgOverallRating,
          avgNetworkingRating: event.avgNetworkingRating,
          avgContentRating: event.avgContentRating,
          avgROIRating: event.avgROIRating,
          totalRatings: event.totalRatings,
          // Counts
          attendeesCount: event._count.attendees,
          ratingsCount: event._count.ratings
        }
      }
    })

    // Get user's event statistics
    const stats = await prisma.eventAttendee.groupBy({
      by: ['status'],
      where: { userId: userId },
      _count: {
        status: true
      }
    })

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)

    // Get ROI statistics
    const roiStats = await prisma.eventAttendee.aggregate({
      where: { 
        userId: userId,
        hasAttended: true
      },
      _sum: {
        connectionsMade: true,
        leadsGenerated: true,
        dealsFromEvent: true,
        revenueFromEvent: true,
        totalCost: true
      },
      _count: {
        id: true
      }
    })

    // Get upcoming events the user is attending
    const upcomingEvents = await prisma.eventAttendee.count({
      where: {
        userId: userId,
        isGoing: true,
        event: {
          startDate: {
            gte: now
          }
        }
      }
    })

    return NextResponse.json({
      events: transformedAttendances,
      pagination: {
        page,
        limit,
        total: filteredAttendances.length,
        totalPages: Math.ceil(filteredAttendances.length / limit)
      },
      stats: {
        statusCounts,
        totalEvents: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
        upcomingEvents,
        attendedEvents: statusCounts['ATTENDED'] || 0,
        interestedEvents: statusCounts['INTERESTED'] || 0,
        // ROI Summary
        roi: {
          totalEventsAttended: roiStats._count.id,
          totalConnections: roiStats._sum.connectionsMade || 0,
          totalLeads: roiStats._sum.leadsGenerated || 0,
          totalDeals: roiStats._sum.dealsFromEvent || 0,
          totalRevenue: roiStats._sum.revenueFromEvent || 0,
          totalCost: roiStats._sum.totalCost || 0,
          avgConnectionsPerEvent: roiStats._count.id ? 
            Math.round((roiStats._sum.connectionsMade || 0) / roiStats._count.id) : 0,
          avgLeadsPerEvent: roiStats._count.id ? 
            Math.round((roiStats._sum.leadsGenerated || 0) / roiStats._count.id) : 0,
          roiRatio: (roiStats._sum.totalCost || 0) > 0 ? 
            ((roiStats._sum.revenueFromEvent || 0) / (roiStats._sum.totalCost || 0)) : 0
        }
      }
    })
  } catch (error) {
    console.error('User events API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 