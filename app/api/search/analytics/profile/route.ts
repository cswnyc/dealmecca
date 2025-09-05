import { NextRequest, NextResponse } from 'next/server';
import { searchAnalyticsEngine } from '@/lib/search-analytics';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    
    // Validate days parameter
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 365' },
        { status: 400 }
      );
    }

    // Get user search profile
    const profile = await searchAnalyticsEngine.getUserSearchProfile(userId, days);

    logger.info('search', 'User search profile requested', {
      userId,
      days,
      searchingStyle: profile.searchingStyle,
      searchFrequency: profile.searchFrequency,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      profile,
      metadata: {
        periodDays: days,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('search', 'User search profile API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'Failed to retrieve user search profile' },
      { status: 500 }
    );
  }
}