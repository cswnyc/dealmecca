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
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const verified = searchParams.get('verified') // Filter by verified ratings
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {
      eventId: id
    }

    if (verified === 'true') {
      where.isVerified = true
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'rating') {
      orderBy.overallRating = sortOrder
    } else if (sortBy === 'helpful') {
      orderBy.helpfulVotes = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Get ratings
    const [ratings, total] = await Promise.all([
      prisma.eventRating.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        select: {
          id: true,
          overallRating: true,
          networkingRating: true,
          contentRating: true,
          roiRating: true,
          review: true,
          wouldRecommend: true,
          wouldAttendAgain: true,
          bestFor: true,
          worstAspect: true,
          isVerified: true,
          helpfulVotes: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              subscriptionTier: true
            }
          }
        }
      }),
      prisma.eventRating.count({ where })
    ])

    // Transform ratings for privacy
    const transformedRatings = ratings.map(rating => {
      const isCurrentUser = rating.user.id === userId
      
      return {
        id: rating.id,
        overallRating: rating.overallRating,
        networkingRating: rating.networkingRating,
        contentRating: rating.contentRating,
        roiRating: rating.roiRating,
        review: rating.review,
        wouldRecommend: rating.wouldRecommend,
        wouldAttendAgain: rating.wouldAttendAgain,
        bestFor: JSON.parse(rating.bestFor || '[]'),
        worstAspect: rating.worstAspect,
        isVerified: rating.isVerified,
        helpfulVotes: rating.helpfulVotes,
        createdAt: rating.createdAt,
        user: {
          id: rating.user.id,
          name: isCurrentUser ? rating.user.name : 
                rating.user.name ? rating.user.name.charAt(0) + '***' : 'Anonymous',
          subscriptionTier: rating.user.subscriptionTier,
          isCurrentUser
        }
      }
    })

    // Get rating statistics
    const stats = await prisma.eventRating.aggregate({
      where: { eventId: id },
      _avg: {
        overallRating: true,
        networkingRating: true,
        contentRating: true,
        roiRating: true
      },
      _count: {
        id: true
      }
    })

    // Get rating distribution
    const distribution = await prisma.eventRating.groupBy({
      by: ['overallRating'],
      where: { eventId: id },
      _count: {
        overallRating: true
      }
    })

    const ratingDistribution = distribution.reduce((acc, item) => {
      acc[item.overallRating] = item._count.overallRating
      return acc
    }, {} as Record<number, number>)

    return NextResponse.json({
      ratings: transformedRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        total: stats._count.id,
        averages: {
          overall: stats._avg.overallRating || 0,
          networking: stats._avg.networkingRating || 0,
          content: stats._avg.contentRating || 0,
          roi: stats._avg.roiRating || 0
        },
        distribution: ratingDistribution,
        verifiedCount: await prisma.eventRating.count({ 
          where: { eventId: id, isVerified: true } 
        })
      }
    })
  } catch (error) {
    console.error('Event ratings API error:', error)
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

    // Check if user has attended this event
    const attendance = await prisma.eventAttendee.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: id
        }
      }
    })

    if (!attendance) {
      return NextResponse.json(
        { error: 'You must be registered for this event to submit a rating' },
        { status: 403 }
      )
    }

    // For events that have ended, user should have attended
    const eventEnded = new Date() > event.endDate
    if (eventEnded && !attendance.hasAttended) {
      return NextResponse.json(
        { error: 'You must have attended this event to submit a rating' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      overallRating,
      networkingRating,
      contentRating,
      roiRating,
      review,
      wouldRecommend,
      wouldAttendAgain,
      bestFor,
      worstAspect
    } = body

    // Validate ratings (1-5 scale)
    const ratings = [overallRating, networkingRating, contentRating, roiRating]
    for (const rating of ratings) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'All ratings must be between 1 and 5' },
          { status: 400 }
        )
      }
    }

    // Validate bestFor array
    const validBestFor = ['NEW_BUSINESS', 'LEARNING', 'NETWORKING', 'PRODUCT_DEMOS', 'PARTNERSHIPS', 'RECRUITING', 'BRAND_AWARENESS', 'THOUGHT_LEADERSHIP']
    if (bestFor && bestFor.some((item: string) => !validBestFor.includes(item))) {
      return NextResponse.json(
        { error: 'Invalid bestFor values', validBestFor },
        { status: 400 }
      )
    }

    // Check if user has already rated this event
    const existingRating = await prisma.eventRating.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: id
        }
      }
    })

    let rating
    if (existingRating) {
      // Update existing rating
      rating = await prisma.eventRating.update({
        where: { id: existingRating.id },
        data: {
          overallRating,
          networkingRating,
          contentRating,
          roiRating,
          review,
          wouldRecommend,
          wouldAttendAgain,
          bestFor: JSON.stringify(bestFor || []),
          worstAspect,
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
              name: true
            }
          }
        }
      })
    } else {
      // Create new rating
      rating = await prisma.eventRating.create({
        data: {
          userId: userId,
          eventId: id,
          overallRating,
          networkingRating,
          contentRating,
          roiRating,
          review,
          wouldRecommend,
          wouldAttendAgain,
          bestFor: JSON.stringify(bestFor || []),
          worstAspect,
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
              name: true
            }
          }
        }
      })
    }

    // Update event aggregate ratings
    const stats = await prisma.eventRating.aggregate({
      where: { eventId: id },
      _avg: {
        overallRating: true,
        networkingRating: true,
        contentRating: true,
        roiRating: true
      },
      _count: {
        id: true
      }
    })

    await prisma.event.update({
      where: { id },
      data: {
        avgOverallRating: stats._avg.overallRating,
        avgNetworkingRating: stats._avg.networkingRating,
        avgContentRating: stats._avg.contentRating,
        avgROIRating: stats._avg.roiRating,
        totalRatings: stats._count.id
      }
    })

    return NextResponse.json({
      message: existingRating ? 'Rating updated' : 'Rating submitted',
      rating: {
        id: rating.id,
        overallRating: rating.overallRating,
        networkingRating: rating.networkingRating,
        contentRating: rating.contentRating,
        roiRating: rating.roiRating,
        review: rating.review,
        wouldRecommend: rating.wouldRecommend,
        wouldAttendAgain: rating.wouldAttendAgain,
        bestFor: JSON.parse(rating.bestFor || '[]'),
        worstAspect: rating.worstAspect,
        isVerified: rating.isVerified,
        helpfulVotes: rating.helpfulVotes,
        createdAt: rating.createdAt,
        user: rating.user,
        event: rating.event
      }
    })
  } catch (error) {
    console.error('Event rating API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 