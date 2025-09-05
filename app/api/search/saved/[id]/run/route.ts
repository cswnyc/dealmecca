import { NextRequest, NextResponse } from 'next/server';
import { savedSearchManager } from '@/lib/saved-search';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    const userId = request.headers.get('x-user-id');
    const searchId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user owns this saved search
    const { searches } = await savedSearchManager.getUserSavedSearches(userId, {
      limit: 1000
    });

    const savedSearch = searches.find(s => s.id === searchId);

    if (!savedSearch) {
      return NextResponse.json(
        { error: 'Saved search not found or access denied' },
        { status: 404 }
      );
    }

    // Run the saved search
    const result = await savedSearchManager.runSavedSearch(searchId);

    logger.info('search', 'Saved search executed', {
      userId,
      searchId,
      resultCount: result.newResultCount,
      changePercentage: result.changePercentage,
      alertTriggered: result.alertTriggered,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      searchId,
      searchName: savedSearch.name,
      ...result,
      executedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('search', 'Failed to run saved search', {
      searchId: params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'Failed to execute saved search' },
      { status: 500 }
    );
  }
}