import { NextRequest, NextResponse } from 'next/server';
import { searchFacetEngine } from '@/lib/search-facets';
import { logger } from '@/lib/logger';
import { SearchFilters } from '@/lib/search-utils';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get('q') || '';
    const searchType = searchParams.get('type') as 'company' | 'contact' || 'company';
    
    // Parse applied filters from query parameters
    const appliedFilters: SearchFilters = {};
    
    // Parse array filters
    const arrayFilters = ['companyType', 'industry', 'location', 'seniority', 'department'];
    arrayFilters.forEach(filterKey => {
      const values = searchParams.getAll(filterKey);
      if (values.length > 0) {
        appliedFilters[filterKey] = values;
      }
    });
    
    // Parse boolean filters
    const booleanFilters = ['verified'];
    booleanFilters.forEach(filterKey => {
      const value = searchParams.get(filterKey);
      if (value === 'true' || value === 'false') {
        appliedFilters[filterKey] = value === 'true';
      }
    });

    // Get user info for analytics
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const userTier = request.headers.get('x-user-tier') || 'FREE';

    // Get faceted search data
    const facetedData = await searchFacetEngine.getFacetedSearchData(
      searchTerm,
      appliedFilters,
      searchType
    );

    // Log the request
    logger.info('search', 'Faceted search data requested', {
      searchTerm: searchTerm || '(empty)',
      searchType,
      appliedFilters: Object.keys(appliedFilters),
      totalResults: facetedData.totalResults,
      facetCount: facetedData.facets.length,
      queryTime: facetedData.facetQueryTime,
      userId,
      userTier,
      duration: Date.now() - startTime
    });

    return NextResponse.json(facetedData);

  } catch (error) {
    logger.error('search', 'Faceted search API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch faceted search data',
        facets: [],
        appliedFilters: {},
        totalResults: 0,
        facetQueryTime: Date.now() - startTime,
        recommendations: {
          suggestedFilters: [],
          popularCombinations: []
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Track facet interactions for analytics
    const userId = request.headers.get('x-user-id') || 'anonymous';
    const body = await request.json();
    
    const { 
      facetKey, 
      facetValue, 
      action, // 'select', 'deselect', 'expand', 'collapse'
      searchTerm,
      searchType,
      appliedFilters 
    } = body;

    // Log facet interaction
    logger.info('search', 'Facet interaction tracked', {
      userId,
      facetKey,
      facetValue,
      action,
      searchTerm,
      searchType,
      timestamp: new Date().toISOString()
    });

    // TODO: Store interaction data for improving facet recommendations
    // This could be used to:
    // 1. Improve facet ordering
    // 2. Suggest popular filter combinations
    // 3. Personalize facet display
    // 4. A/B test facet UI changes

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('search', 'Facet interaction tracking error', { error });
    
    return NextResponse.json(
      { error: 'Failed to track facet interaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clear facet cache (admin only)
    const userId = request.headers.get('x-user-id');
    
    // Note: In a real app, you'd validate admin permissions here
    // For now, allowing any authenticated user to clear cache
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    searchFacetEngine.clearCache();
    
    logger.info('search', 'Search facet cache cleared', { userId });

    return NextResponse.json({ 
      success: true,
      message: 'Search facet cache cleared'
    });

  } catch (error) {
    logger.error('search', 'Failed to clear facet cache', { error });
    
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}