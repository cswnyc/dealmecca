import { NextRequest, NextResponse } from 'next/server';
import { searchShortcutEngine } from '@/lib/search-shortcuts';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const userId = request.headers.get('x-user-id');
    const userLocation = request.headers.get('x-user-location');
    const searchParams = request.nextUrl.searchParams;
    
    const type = searchParams.get('type') as 'industry' | 'recent' | 'location' | 'dynamic' | 'all' || 'all';
    const query = searchParams.get('q') || undefined;
    const appliedFilters = searchParams.get('filters') || '{}';
    
    let parsedFilters: Record<string, any> = {};
    let parsedUserLocation: { city: string; state: string } | undefined;
    
    try {
      parsedFilters = JSON.parse(appliedFilters);
    } catch (e) {
      logger.warn('search', 'Failed to parse applied filters', { appliedFilters });
    }
    
    if (userLocation) {
      try {
        parsedUserLocation = JSON.parse(userLocation);
      } catch (e) {
        logger.warn('search', 'Failed to parse user location', { userLocation });
      }
    }

    const results: any = {};

    // Get different types of shortcuts based on request
    if (type === 'industry' || type === 'all') {
      results.industryShortcuts = await searchShortcutEngine.getIndustryShortcuts();
    }

    if ((type === 'recent' || type === 'all') && userId) {
      results.recentFilters = await searchShortcutEngine.getRecentlySearchedFilters(userId);
    }

    if (type === 'location' || type === 'all') {
      results.locationShortcuts = await searchShortcutEngine.getLocationBasedFilters(parsedUserLocation);
    }

    if (type === 'dynamic' || type === 'all') {
      results.dynamicFilters = await searchShortcutEngine.getDynamicFilters(query, parsedFilters);
    }

    logger.info('search', 'Search shortcuts requested', {
      type,
      userId: userId || 'anonymous',
      hasLocation: !!parsedUserLocation,
      query: query || '(none)',
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      ...results,
      metadata: {
        requestType: type,
        hasUserContext: !!userId,
        hasLocationContext: !!parsedUserLocation,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('search', 'Search shortcuts API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'Failed to retrieve search shortcuts' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clear shortcuts cache (admin functionality)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    searchShortcutEngine.clearCaches();
    
    logger.info('search', 'Search shortcuts cache cleared', { userId });

    return NextResponse.json({ 
      success: true,
      message: 'Search shortcuts cache cleared'
    });

  } catch (error) {
    logger.error('search', 'Failed to clear shortcuts cache', { error });
    
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}