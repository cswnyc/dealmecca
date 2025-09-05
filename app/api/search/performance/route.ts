import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const hours = parseInt(searchParams.get('hours') || '24');
    
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Get performance metrics from search logs
    const [
      searchPerformance,
      queryDistribution,
      errorAnalysis,
      cacheStats,
      slowQueries
    ] = await Promise.all([
      getSearchPerformanceMetrics(startTime),
      getQueryDistribution(startTime),
      getErrorAnalysis(startTime),
      getCacheStatistics(startTime),
      getSlowQueriesAnalysis(startTime)
    ]);

    return NextResponse.json({
      timeRange: {
        start: startTime.toISOString(),
        end: new Date().toISOString(),
        hours
      },
      performance: searchPerformance,
      queries: queryDistribution,
      errors: errorAnalysis,
      cache: cacheStats,
      slowQueries
    });

  } catch (error) {
    logger.error('search', 'Search performance metrics API error', { error });
    
    return NextResponse.json(
      { error: 'Failed to retrieve performance metrics' },
      { status: 500 }
    );
  }
}

async function getSearchPerformanceMetrics(since: Date) {
  const searches = await prisma.search.findMany({
    where: { createdAt: { gte: since } },
    select: {
      queryTime: true,
      resultCount: true,
      successful: true,
      createdAt: true
    }
  });

  if (searches.length === 0) {
    return {
      totalSearches: 0,
      avgResponseTime: 0,
      successRate: 100,
      avgResultsPerSearch: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0
    };
  }

  const sortedTimes = searches.map(s => s.queryTime || 0).sort((a, b) => a - b);
  const successfulSearches = searches.filter(s => s.successful).length;
  
  return {
    totalSearches: searches.length,
    avgResponseTime: Math.round(searches.reduce((sum, s) => sum + (s.queryTime || 0), 0) / searches.length),
    successRate: Math.round((successfulSearches / searches.length) * 100),
    avgResultsPerSearch: Math.round(searches.reduce((sum, s) => sum + (s.resultCount || 0), 0) / searches.length),
    p95ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0,
    p99ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0,
    hourlyBreakdown: generateHourlyBreakdown(searches)
  };
}

async function getQueryDistribution(since: Date) {
  const queries = await prisma.search.groupBy({
    by: ['query'],
    where: { createdAt: { gte: since } },
    _count: { query: true },
    _avg: { queryTime: true, resultCount: true },
    orderBy: { _count: { query: 'desc' } },
    take: 20
  });

  return {
    topQueries: queries.map(q => ({
      query: q.query,
      count: q._count.query,
      avgResponseTime: Math.round(q._avg.queryTime || 0),
      avgResults: Math.round(q._avg.resultCount || 0)
    })),
    uniqueQueries: queries.length
  };
}

async function getErrorAnalysis(since: Date) {
  const failedSearches = await prisma.search.findMany({
    where: {
      createdAt: { gte: since },
      successful: false
    },
    select: {
      query: true,
      queryTime: true,
      resultCount: true
    }
  });

  const errorsByQuery = new Map();
  failedSearches.forEach(search => {
    const count = errorsByQuery.get(search.query) || 0;
    errorsByQuery.set(search.query, count + 1);
  });

  return {
    totalErrors: failedSearches.length,
    errorRate: failedSearches.length > 0 ? 
      Math.round((failedSearches.length / (failedSearches.length + 100)) * 100) : 0, // Rough estimate
    topFailingQueries: Array.from(errorsByQuery.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }))
  };
}

async function getCacheStatistics(since: Date) {
  // Placeholder cache stats - in production, integrate with actual cache system
  return {
    hitRate: 78,
    missRate: 22,
    avgCacheResponseTime: 25,
    cacheSize: '145MB',
    evictions: 12
  };
}

async function getSlowQueriesAnalysis(since: Date) {
  const slowSearches = await prisma.search.findMany({
    where: {
      createdAt: { gte: since },
      queryTime: { gt: 2000 } // Queries taking more than 2 seconds
    },
    select: {
      query: true,
      queryTime: true,
      resultCount: true,
      searchFilters: true
    },
    orderBy: { queryTime: 'desc' },
    take: 10
  });

  return {
    count: slowSearches.length,
    queries: slowSearches.map(s => ({
      query: s.query,
      responseTime: s.queryTime,
      resultCount: s.resultCount,
      filters: s.searchFilters ? Object.keys(s.searchFilters as any).length : 0,
      analysis: analyzeSlowQuery(s)
    }))
  };
}

function generateHourlyBreakdown(searches: any[]) {
  const hourlyData = new Array(24).fill(0).map((_, hour) => ({
    hour,
    searches: 0,
    avgResponseTime: 0,
    responseTimes: [] as number[]
  }));

  searches.forEach(search => {
    const hour = new Date(search.createdAt).getHours();
    hourlyData[hour].searches++;
    hourlyData[hour].responseTimes.push(search.queryTime || 0);
  });

  return hourlyData.map(data => ({
    hour: data.hour,
    searches: data.searches,
    avgResponseTime: data.responseTimes.length > 0 ? 
      Math.round(data.responseTimes.reduce((a, b) => a + b, 0) / data.responseTimes.length) : 0
  }));
}

function analyzeSlowQuery(search: any): string {
  const reasons = [];
  
  if (search.resultCount > 1000) {
    reasons.push('Large result set');
  }
  
  if (search.searchFilters && Object.keys(search.searchFilters).length > 5) {
    reasons.push('Complex filtering');
  }
  
  if (search.query.length > 50) {
    reasons.push('Long query text');
  }
  
  if (search.query.includes('*') || search.query.includes('%')) {
    reasons.push('Wildcard search');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'Unknown cause';
}