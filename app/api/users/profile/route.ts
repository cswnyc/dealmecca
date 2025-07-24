import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const userTier = request.headers.get('x-user-tier')
    
    // Debug logging
    console.log('Profile API - Headers:', {
      userId,
      userRole,
      userTier,
      allHeaders: Object.fromEntries(request.headers.entries())
    })
    
    if (!userId) {
      console.log('Profile API - No user ID found in headers')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        searchesUsed: true,
        searchesResetAt: true,
        createdAt: true,
        updatedAt: true,
        searches: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            category: true,
            votes: true,
            createdAt: true,
            _count: {
              select: {
                comments: true,
              },
            },
          },
        },
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate search limit based on subscription tier
    const searchLimit = user.subscriptionTier === 'FREE' ? 10 : -1 // -1 means unlimited
    
    // Calculate searches since reset date (monthly limit)
    const currentMonthSearches = await prisma.search.count({
      where: {
        userId: userId,
        createdAt: {
          gte: user.searchesResetAt,
        },
      },
    })
    
    const searchesRemaining = searchLimit === -1 ? -1 : Math.max(0, searchLimit - currentMonthSearches)
    
    // Get search statistics for the last 30 days for charts
    const last30DaysSearches = await prisma.search.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group searches by day for chart data
    const searchesByDay = last30DaysSearches.reduce((acc, search) => {
      const day = search.createdAt.toISOString().split('T')[0]
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      ...user,
      searchLimit,
      searchesRemaining,
      searchesUsedThisMonth: currentMonthSearches,
      searchesByDay,
      searchStats: {
        total: user.searches.length,
        thisMonth: currentMonthSearches,
        avgResultsPerSearch: user.searches.length > 0 
          ? Math.round(user.searches.reduce((sum, s) => sum + s.resultsCount, 0) / user.searches.length)
          : 0,
      },
    })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 