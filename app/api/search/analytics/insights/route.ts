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

    // Only allow PRO+ users to access insights
    if (userTier === 'FREE') {
      return NextResponse.json(
        { 
          error: 'Insights require PRO or ENTERPRISE tier',
          upgradeRequired: true,
          currentTier: userTier
        },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' || 'weekly';
    const dateParam = searchParams.get('date');
    const date = dateParam ? new Date(dateParam) : new Date();

    // Generate comprehensive insight report
    const report = await searchAnalyticsEngine.generateInsightReport(period, date);

    logger.info('search', 'Search insights requested', {
      userId,
      userTier,
      period,
      date: date.toISOString(),
      recommendationCount: report.recommendations.length,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      report,
      metadata: {
        userTier,
        generatedAt: new Date().toISOString(),
        dataFreshness: 'real-time'
      }
    });

  } catch (error) {
    logger.error('search', 'Search insights API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'Failed to generate search insights' },
      { status: 500 }
    );
  }
}