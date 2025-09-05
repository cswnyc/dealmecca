import { NextRequest, NextResponse } from 'next/server';
import { savedSearchManager } from '@/lib/saved-search';
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

    const stats = await savedSearchManager.getUserSavedSearchStats(userId);

    logger.info('search', 'User saved search stats retrieved', {
      userId,
      totalSearches: stats.totalSavedSearches,
      activeAlerts: stats.activeAlerts,
      duration: Date.now() - startTime
    });

    return NextResponse.json(stats);

  } catch (error) {
    logger.error('search', 'Failed to get saved search stats', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'Failed to retrieve saved search statistics' },
      { status: 500 }
    );
  }
}