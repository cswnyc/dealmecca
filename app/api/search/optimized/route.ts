import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { fullTextSearch } from '@/lib/full-text-search';
import { databaseOptimizer } from '@/lib/database-optimizer';
import { getPerformanceMonitor } from '@/lib/performance-monitor';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const performanceMonitor = getPerformanceMonitor(prisma);

// Optimized search endpoint with full-text search and performance monitoring
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const requestId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const query = searchParams.get('q') || '';
    const searchType = (searchParams.get('searchType') as 'companies' | 'contacts' | 'both') || 'both';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const useCache = searchParams.get('cache') !== 'false';
    
    // Extract filters
    const filters = {
      companyTypes: searchParams.getAll('companyType').filter(Boolean),
      industries: searchParams.getAll('industry').filter(Boolean),
      locations: searchParams.getAll('location').map(loc => {
        const [city, state] = loc.split(', ');
        return { city, state };
      }).filter(loc => loc.city || loc.state),
      seniorities: searchParams.getAll('seniority').filter(Boolean),
      departments: searchParams.getAll('department').filter(Boolean),
      verified: searchParams.get('verified') === 'true' ? true : 
                searchParams.get('verified') === 'false' ? false : undefined,
      isDecisionMaker: searchParams.get('isDecisionMaker') === 'true' ? true :
                      searchParams.get('isDecisionMaker') === 'false' ? false : undefined
    };

    // Get user context from middleware headers
    const userId = request.headers.get('x-user-id') || undefined;
    const userEmail = request.headers.get('x-user-email') || undefined;

    console.log(`🔍 [${requestId}] Optimized search request:`, {
      query: query.substring(0, 50),
      searchType,
      filters: Object.entries(filters).filter(([_, v]) => v !== undefined && (!Array.isArray(v) || v.length > 0)),
      limit,
      offset
    });

    // Execute full-text search
    const searchResult = await performanceMonitor.trackQuery(
      'optimizedSearch',
      async () => {
        return await fullTextSearch.search({
          query,
          searchType,
          limit,
          offset,
          filters,
          useCache,
          userId
        });
      },
      { route: '/api/search/optimized', userId }
    );

    const duration = performance.now() - startTime;
    
    console.log(`✅ [${requestId}] Search completed:`, {
      totalResults: searchResult.totalCompanies + searchResult.totalContacts,
      companies: searchResult.totalCompanies,
      contacts: searchResult.totalContacts,
      duration: Math.round(duration),
      cached: searchResult.searchStats.cached,
      complexity: searchResult.searchStats.queryComplexity
    });

    // Response with comprehensive metadata
    return NextResponse.json({
      success: true,
      results: {
        companies: searchResult.companies,
        contacts: searchResult.contacts,
        totalCompanies: searchResult.totalCompanies,
        totalContacts: searchResult.totalContacts,
        totalResults: searchResult.totalCompanies + searchResult.totalContacts
      },
      pagination: {
        limit,
        offset,
        hasMore: (searchResult.totalCompanies + searchResult.totalContacts) > (offset + limit)
      },
      facets: searchResult.facets,
      suggestions: searchResult.suggestions,
      performance: {
        requestId,
        totalDuration: Math.round(duration),
        searchDuration: Math.round(searchResult.searchStats.executionTimeMs),
        cached: searchResult.searchStats.cached,
        queryComplexity: searchResult.searchStats.queryComplexity
      },
      search: {
        query,
        searchType,
        filtersApplied: Object.entries(filters)
          .filter(([_, v]) => v !== undefined && (!Array.isArray(v) || v.length > 0))
          .map(([key, value]) => ({ key, value }))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ [${requestId}] Search failed:`, error);
    
    // Track the error
    performanceMonitor.trackAPICall({
      method: 'GET',
      route: '/api/search/optimized',
      duration,
      statusCode: 500,
      userId: undefined,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      performance: {
        requestId,
        totalDuration: Math.round(duration),
        cached: false
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST endpoint for advanced search operations
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  const requestId = `advanced_search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'bulk_search':
        return await handleBulkSearch(params, requestId);
      
      case 'search_analytics':
        return await handleSearchAnalytics(params, requestId);
      
      case 'optimize_database':
        return await handleDatabaseOptimization(requestId);
      
      case 'export_results':
        return await handleResultsExport(params, requestId);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          supportedActions: ['bulk_search', 'search_analytics', 'optimize_database', 'export_results']
        }, { status: 400 });
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Advanced search operation failed:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Operation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      requestId
    }, { status: 500 });
  }
}

// Handle bulk search requests
async function handleBulkSearch(params: any, requestId: string) {
  const { queries, searchType = 'both', globalFilters = {} } = params;
  
  if (!Array.isArray(queries) || queries.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'Invalid queries array'
    }, { status: 400 });
  }

  const results = [];
  const limit = Math.min(queries.length, 10); // Limit bulk searches

  for (let i = 0; i < limit; i++) {
    const query = queries[i];
    try {
      const searchResult = await fullTextSearch.search({
        query,
        searchType,
        limit: 20,
        offset: 0,
        filters: globalFilters,
        useCache: true
      });
      
      results.push({
        query,
        success: true,
        totalResults: searchResult.totalCompanies + searchResult.totalContacts,
        companies: searchResult.totalCompanies,
        contacts: searchResult.totalContacts,
        topResults: [
          ...searchResult.companies.slice(0, 3).map(c => ({ type: 'company', name: c.name, score: c.searchScore })),
          ...searchResult.contacts.slice(0, 3).map(c => ({ type: 'contact', name: c.fullName, score: c.searchScore }))
        ]
      });
    } catch (error) {
      results.push({
        query,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return NextResponse.json({
    success: true,
    requestId,
    results,
    summary: {
      totalQueries: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  });
}

// Handle search analytics requests
async function handleSearchAnalytics(params: any, requestId: string) {
  const { timeframe = '24h' } = params;
  
  try {
    const searchMetrics = performanceMonitor.getQueryMetrics(1000)
      .filter(m => m.query.includes('Search') || m.query.includes('search'));
    
    const analytics = {
      totalSearches: searchMetrics.length,
      avgResponseTime: searchMetrics.length > 0 
        ? searchMetrics.reduce((sum, m) => sum + m.duration, 0) / searchMetrics.length 
        : 0,
      slowSearches: searchMetrics.filter(m => m.duration > 1000).length,
      errorRate: searchMetrics.filter(m => m.errorMessage).length / Math.max(searchMetrics.length, 1) * 100,
      popularQueries: [], // Would be implemented with proper search tracking
      performanceTrends: [] // Would be implemented with time-series data
    };

    return NextResponse.json({
      success: true,
      requestId,
      timeframe,
      analytics
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      requestId,
      error: 'Failed to generate analytics'
    }, { status: 500 });
  }
}

// Handle database optimization
async function handleDatabaseOptimization(requestId: string) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
  
  // Check admin permissions
  // Authentication handled by middleware - skip check
  if (false) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: request.headers.get('x-user-email') },
    select: { role: true }
  });

  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    // Run database analysis and optimization
    const [health, optimization] = await Promise.all([
      databaseOptimizer.analyzeDatabaseHealth(),
      databaseOptimizer.runOptimization()
    ]);

    return NextResponse.json({
      success: true,
      requestId,
      health: {
        tableCount: health.tableStats.length,
        largestTable: health.tableStats[0]?.tableName,
        indexCount: health.indexEfficiency.length,
        slowQueryCount: health.slowQueries.length,
        recommendations: health.recommendations
      },
      optimization: {
        statisticsUpdated: optimization.statisticsUpdated,
        recommendations: optimization.recommendations
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      requestId,
      error: 'Optimization failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle results export
async function handleResultsExport(params: any, requestId: string) {
  const { query, searchType, filters, format = 'json' } = params;
  
  if (!['json', 'csv'].includes(format)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid format. Supported: json, csv'
    }, { status: 400 });
  }

  try {
    // Execute search with higher limits for export
    const searchResult = await fullTextSearch.search({
      query,
      searchType,
      limit: 1000, // Higher limit for exports
      offset: 0,
      filters,
      useCache: false // Don't cache export requests
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = [
        ...searchResult.companies.map(c => ({
          type: 'company',
          id: c.id,
          name: c.name,
          industry: c.industry,
          location: `${c.city || ''}, ${c.state || ''}`.trim().replace(/^,|,$/, ''),
          employeeCount: c.employeeCount,
          verified: c.verified,
          contactCount: c.contactCount,
          searchScore: c.searchScore
        })),
        ...searchResult.contacts.map(c => ({
          type: 'contact',
          id: c.id,
          name: c.fullName,
          title: c.title,
          company: c.company.name,
          department: c.department,
          seniority: c.seniority,
          verified: c.verified,
          isDecisionMaker: c.isDecisionMaker,
          searchScore: c.searchScore
        }))
      ];

      // Simple CSV conversion (in production, use proper CSV library)
      const headers = Object.keys(csvData[0] || {}).join(',');
      const rows = csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
      const csv = [headers, ...rows].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="search_results_${requestId}.csv"`
        }
      });
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      requestId,
      format,
      data: searchResult,
      exportMetadata: {
        generatedAt: new Date().toISOString(),
        totalResults: searchResult.totalCompanies + searchResult.totalContacts,
        query: query
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      requestId,
      error: 'Export failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}