import { NextRequest, NextResponse } from 'next/server'
// Firebase auth handled by middleware - removed @/lib/auth import
import { PrismaClient } from '@prisma/client'
import { createAuthError, createSearchLimitError, createInternalError } from '@/lib/api-responses'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const userTier = request.headers.get('x-user-tier')
    
    if (!userId) {
      return createAuthError()
    }

    const body = await request.json()
    const { query, resultsCount, searchType } = body

    if (!query || resultsCount === undefined) {
      return NextResponse.json(
        { error: 'Query and results count are required' },
        { status: 400 }
      )
    }

    // Get user by ID (from middleware headers)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user can perform search
    const canSearch = await canUserSearch(user.id)
    
    if (!canSearch) {
      const searchLimit = user.subscriptionTier === 'FREE' ? 10 : 100
      const resetDate = user.searchesResetAt ? new Date(user.searchesResetAt).toLocaleDateString() : undefined
      
      return createSearchLimitError({
        currentUsage: user.searchesUsed || 0,
        limit: searchLimit,
        tier: user.subscriptionTier || 'FREE',
        resetDate
      })
    }

    // Record the search
    const search = await recordSearch(user.id, query, resultsCount, searchType)

    // Get updated user search statistics
    const userStats = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        subscriptionTier: true,
        searches: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        },
      },
    })

    const searchLimit = userStats?.subscriptionTier === 'FREE' ? 10 : -1 // -1 means unlimited
    const searchesRemaining = searchLimit === -1 ? -1 : Math.max(0, searchLimit - (userStats?.searches.length || 0))

    return NextResponse.json({
      success: true,
      search,
      searchLimit,
      searchesRemaining,
    })
  } catch (error) {
    console.error('Search tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const userTier = request.headers.get('x-user-tier')
    
    if (!userId) {
      return createAuthError()
    }

    // Get user by ID (from middleware headers)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const [searches, total] = await Promise.all([
      prisma.search.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.search.count({ where: { userId: user.id } }),
    ])

    // Get search statistics
    const monthlySearches = await prisma.search.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    })

    const searchLimit = user.subscriptionTier === 'FREE' ? 10 : -1
    const searchesRemaining = searchLimit === -1 ? -1 : Math.max(0, searchLimit - monthlySearches)

    return NextResponse.json({
      searches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        monthlySearches,
        searchLimit,
        searchesRemaining,
      },
    })
  } catch (error) {
    console.error('Search history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 