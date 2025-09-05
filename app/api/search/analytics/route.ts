import { NextRequest, NextResponse } from 'next/server';
import { searchAnalyticsEngine } from '@/lib/search-analytics';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const userId = request.headers.get('x-user-id');
    const userTier = request.headers.get('x-user-tier') || 'FREE';
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' || 'weekly';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    // Default to last week if no dates provided
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const defaultStart = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startDate = startDateParam ? new Date(startDateParam) : defaultStart;

    // Validate date range
    const maxDays = userTier === 'FREE' ? 30 : userTier === 'PRO' ? 90 : 365;
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > maxDays) {
      return NextResponse.json(
        { 
          error: `Date range too large. Maximum ${maxDays} days allowed for ${userTier} tier.`,
          maxDays 
        },
        { status: 400 }
      );
    }

    // Get analytics data
    const analytics = await searchAnalyticsEngine.getSearchAnalytics(
      startDate,
      endDate,
      userId
    );

    logger.info('search', 'Search analytics requested', {
      userId,
      userTier,
      period,
      daysDiff,
      totalSearches: analytics.overview.totalSearches,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      analytics,
      metadata: {
        userTier,
        maxDaysAllowed: maxDays,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('search', 'Search analytics API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'Failed to retrieve search analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Track search interaction for analytics
    const body = await request.json();
    
    const {
      userId,
      sessionId,
      query,
      searchType,
      filters,
      resultCount,
      queryTime,
      clickedResults,
      timeSpent,
      successful
    } = body;

    // Validate required fields
    if (!sessionId || !query || !searchType) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, query, searchType' },
        { status: 400 }
      );
    }

    await searchAnalyticsEngine.trackSearchInteraction({
      userId,
      sessionId,
      query,
      searchType,
      filters: filters || {},
      resultCount: resultCount || 0,
      queryTime: queryTime || 0,
      clickedResults: clickedResults || 0,
      timeSpent: timeSpent || 0,
      successful: successful !== false // Default to true unless explicitly false
    });

    logger.info('search', 'Search interaction tracked', {
      userId: userId || 'anonymous',
      query,
      searchType,
      resultCount,
      successful
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('search', 'Search interaction tracking error', { error });
    
    return NextResponse.json(
      { error: 'Failed to track search interaction' },
      { status: 500 }
    );
  }
}