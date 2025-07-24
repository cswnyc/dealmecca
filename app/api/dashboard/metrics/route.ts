import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthError, createInternalError } from '@/lib/api-responses'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return createAuthError()
    }

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'month'

    // Calculate date ranges
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        searchesUsed: true,
        searchesResetAt: true,
        subscriptionTier: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get search limit based on subscription tier
    const searchLimit = user.subscriptionTier === 'FREE' ? 10 : -1 // -1 = unlimited

    // Calculate searches data
    const searchesUsed = user.searchesUsed
    const searchesRemaining = searchLimit === -1 ? -1 : Math.max(0, searchLimit - searchesUsed)
    
    // Calculate next reset date (first of next month)
    const resetDate = new Date(user.searchesResetAt)
    const nextResetDate = new Date(resetDate.getFullYear(), resetDate.getMonth() + 1, 1)

    // Get event attendance data for the period
    const eventAttendees = await prisma.eventAttendee.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        event: {
          select: {
            name: true,
            startDate: true,
            estimatedCost: true
          }
        }
      }
    })

    // Calculate basic event metrics
    const eventsPlanned = eventAttendees.filter(a => 
      ['PLANNING_TO_ATTEND', 'REGISTERED', 'ATTENDING'].includes(a.status)
    ).length
    
    const eventsAttended = eventAttendees.filter(a => a.hasAttended).length
    
    // Get forum activity for the period
    const forumPosts = await prisma.post.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        }
      },
      select: {
        id: true,
        votes: true,
        _count: {
          select: {
            comments: true
          }
        }
      }
    })

    const postsCreated = forumPosts.length
    const helpfulVotes = forumPosts.reduce((sum, post) => sum + post.votes, 0)

    // Get comments made by user
    const userComments = await prisma.comment.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        }
      },
      select: {
        id: true,
        votes: true
      }
    })

    const questionsAnswered = userComments.length
    const commentVotes = userComments.reduce((sum, comment) => sum + comment.votes, 0)

    const metrics = {
      searches: {
        used: searchesUsed,
        limit: searchLimit,
        remaining: searchesRemaining,
        resetDate: nextResetDate
      },
      events: {
        attended: eventsAttended,
        planned: eventsPlanned,
        totalCost: 0, // Placeholder
        estimatedROI: 0, // Placeholder
        progress: 0 // Placeholder
      },
      networking: {
        connectionsThisMonth: 0, // Placeholder
        totalConnections: 0, // Placeholder
        activeDeals: 0, // Placeholder
        progress: 0 // Placeholder
      },
      forum: {
        postsCreated: postsCreated,
        helpfulVotes: helpfulVotes + commentVotes,
        questionsAnswered: questionsAnswered
      },
      achievements: {
        total: 0, // Placeholder
        unlocked: 0 // Placeholder
      },
      engagement: {
        dashboardVisits: 1, // Placeholder
        lastVisit: null
      }
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Dashboard metrics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
} 