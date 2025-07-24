import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canPerformSearch, SUBSCRIPTION_LIMITS } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const userTier = request.headers.get('x-user-tier')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        subscriptionTier: true,
        searchesUsed: true,
        searchesResetAt: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if we need to reset search count (monthly reset)
    const now = new Date()
    const resetDate = new Date(user.searchesResetAt)
    
    // If it's been more than a month since last reset, reset the count
    const shouldReset = now.getTime() - resetDate.getTime() > 30 * 24 * 60 * 60 * 1000
    
    let currentSearches = user.searchesUsed
    let nextResetDate = resetDate

    if (shouldReset) {
      currentSearches = 0
      nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1) // First day of next month
      
      // Update user with reset count and new reset date
      await prisma.user.update({
        where: { id: user.id },
        data: {
          searchesUsed: 0,
          searchesResetAt: nextResetDate,
        },
      })
    }

    const limits = SUBSCRIPTION_LIMITS[user.subscriptionTier]
    const searchLimit = limits.searches === -1 ? null : limits.searches

    return NextResponse.json({
      usage: {
        searches: {
          used: currentSearches,
          limit: searchLimit,
          unlimited: searchLimit === null,
          resetDate: nextResetDate.toISOString(),
        },
        tier: user.subscriptionTier,
        features: {
          canExportData: limits.canExportData,
          canAccessPremiumForum: limits.canAccessPremiumForum,
          canDirectMessage: limits.canDirectMessage,
          prioritySupport: limits.prioritySupport,
        },
      },
      canUpgrade: user.subscriptionTier === 'FREE',
      upgradeReasons: currentSearches >= (searchLimit || 0) - 2 ? [
        'You\'re close to your search limit',
        'Upgrade for unlimited searches',
      ] : [],
    })
  } catch (error) {
    console.error('Usage tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to get usage data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const userTier = request.headers.get('x-user-tier')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, metadata } = body

    if (action !== 'search') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        subscriptionTier: true,
        searchesUsed: true,
        searchesResetAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if search is allowed
    const canSearch = canPerformSearch(user.subscriptionTier, user.searchesUsed)
    
    if (!canSearch) {
      return NextResponse.json(
        {
          error: 'SEARCH_LIMIT_REACHED',
          message: 'You\'ve reached your monthly search limit. Upgrade to Pro for unlimited searches.',
          upgradeUrl: '/pricing',
          currentUsage: user.searchesUsed,
          limit: SUBSCRIPTION_LIMITS[user.subscriptionTier].searches,
        },
        { status: 429 }
      )
    }

    // Increment search count for free users
    if (user.subscriptionTier === 'FREE') {
      await prisma.$transaction(async (tx) => {
        // Update search count
        await tx.user.update({
          where: { id: user.id },
          data: {
            searchesUsed: { increment: 1 },
          },
        })

        // Create search record
        await tx.search.create({
          data: {
            userId: user.id,
            query: metadata?.query || 'Unknown query',
            resultsCount: metadata?.resultsCount || 0,
            searchType: metadata?.searchType || 'general',
          },
        })
      })
    } else {
      // For paid users, just create the search record
      await prisma.search.create({
        data: {
          userId: user.id,
          query: metadata?.query || 'Unknown query',
          resultsCount: metadata?.resultsCount || 0,
          searchType: metadata?.searchType || 'general',
        },
      })
    }

    const newUsage = user.subscriptionTier === 'FREE' ? user.searchesUsed + 1 : user.searchesUsed
    const limit = SUBSCRIPTION_LIMITS[user.subscriptionTier].searches

    return NextResponse.json({
      success: true,
      usage: {
        searches: {
          used: newUsage,
          limit: limit === -1 ? null : limit,
          unlimited: limit === -1,
        },
        tier: user.subscriptionTier,
      },
      warningThreshold: limit !== -1 && newUsage >= limit - 2,
    })
  } catch (error) {
    console.error('Usage increment error:', error)
    return NextResponse.json(
      { error: 'Failed to update usage' },
      { status: 500 }
    )
  }
} 