import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthError, createInternalError } from '@/lib/api-responses'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return createAuthError()
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

    // Get recent searches
    const recentSearches = await prisma.search.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        query: true,
        resultsCount: true,
        searchType: true,
        createdAt: true
      }
    })

    // Calculate search statistics
    const allTimeSearches = await prisma.search.findMany({
      where: { userId },
      select: {
        id: true,
        resultsCount: true,
        createdAt: true
      }
    })

    // Calculate this month's searches
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const thisMonthSearches = allTimeSearches.filter(search => 
      new Date(search.createdAt) >= thisMonthStart
    )

    // Calculate last month's searches
    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    const lastMonthSearches = allTimeSearches.filter(search => {
      const searchDate = new Date(search.createdAt)
      return searchDate >= lastMonthStart && searchDate <= lastMonthEnd
    })

    // Calculate average results per search
    const totalResults = allTimeSearches.reduce((sum, search) => sum + search.resultsCount, 0)
    const avgResultsPerSearch = allTimeSearches.length > 0 ? totalResults / allTimeSearches.length : 0

    const searchUsageData = {
      searchesUsed,
      searchLimit,
      searchesRemaining,
      resetDate: nextResetDate,
      subscriptionTier: user.subscriptionTier,
      recentSearches: recentSearches.map(search => ({
        ...search,
        createdAt: search.createdAt.toISOString()
      })),
      searchStats: {
        totalAllTime: allTimeSearches.length,
        thisMonth: thisMonthSearches.length,
        lastMonth: lastMonthSearches.length,
        avgResultsPerSearch: Math.round(avgResultsPerSearch * 10) / 10 // Round to 1 decimal
      }
    }

    return NextResponse.json(searchUsageData)

  } catch (error) {
    console.error('Search usage API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search usage data' },
      { status: 500 }
    )
  }
} 