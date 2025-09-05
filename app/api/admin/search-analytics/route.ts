import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { getPerformanceMonitor } from '@/lib/performance-monitor';
import { databaseOptimizer } from '@/lib/database-optimizer';

const prisma = new PrismaClient();
const performanceMonitor = getPerformanceMonitor(prisma);

// Search analytics and usage tracking endpoint
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const type = searchParams.get('type') || 'overview';

    let startDate: Date;
    switch (timeframe) {
      case '1h':
        startDate = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    switch (type) {
      case 'overview':
        return await getSearchOverview(startDate);
      case 'performance':
        return await getPerformanceAnalytics(startDate);
      case 'usage':
        return await getUsageAnalytics(startDate);
      case 'popular':
        return await getPopularSearches(startDate);
      case 'database':
        return await getDatabaseHealth();
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search analytics' },
      { status: 500 }
    );
  }
}

// Get search overview analytics
async function getSearchOverview(startDate: Date) {
  const [
    totalSearches,
    uniqueUsers,
    avgResultsPerSearch,
    topSearchTerms,
    searchTypeBreakdown,
    hourlyTrends
  ] = await Promise.all([
    // Total searches
    prisma.search.count({
      where: { createdAt: { gte: startDate } }
    }),

    // Unique users searching
    prisma.search.findMany({
      where: { createdAt: { gte: startDate } },
      select: { userId: true },
      distinct: ['userId']
    }).then(results => results.length),

    // Average results per search
    prisma.search.aggregate({
      where: { createdAt: { gte: startDate } },
      _avg: { resultsCount: true }
    }).then(result => result._avg.resultsCount || 0),

    // Top search terms
    prisma.$queryRaw<any[]>`
      SELECT 
        query,
        COUNT(*) as search_count,
        AVG("resultsCount") as avg_results,
        COUNT(DISTINCT "userId") as unique_users
      FROM "Search" 
      WHERE "createdAt" >= ${startDate}
        AND LENGTH(query) >= 3
      GROUP BY query
      ORDER BY search_count DESC
      LIMIT 10
    `,

    // Search type breakdown
    prisma.$queryRaw<any[]>`
      SELECT 
        COALESCE("searchType", 'unknown') as search_type,
        COUNT(*) as count,
        AVG("resultsCount") as avg_results
      FROM "Search"
      WHERE "createdAt" >= ${startDate}
      GROUP BY "searchType"
      ORDER BY count DESC
    `,

    // Hourly search trends
    prisma.$queryRaw<any[]>`
      SELECT 
        DATE_TRUNC('hour', "createdAt") as hour,
        COUNT(*) as searches,
        AVG("resultsCount") as avg_results,
        COUNT(DISTINCT "userId") as unique_users
      FROM "Search"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('hour', "createdAt")
      ORDER BY hour ASC
    `
  ]);

  return NextResponse.json({
    success: true,
    timeframe: startDate.toISOString(),
    overview: {
      totalSearches,
      uniqueUsers,
      avgResultsPerSearch: Math.round(avgResultsPerSearch * 100) / 100,
      searchesPerUser: uniqueUsers > 0 ? Math.round((totalSearches / uniqueUsers) * 100) / 100 : 0
    },
    topSearchTerms: topSearchTerms.map(term => ({
      query: term.query,
      searches: parseInt(term.search_count),
      avgResults: Math.round(parseFloat(term.avg_results) * 100) / 100,
      uniqueUsers: parseInt(term.unique_users)
    })),
    searchTypeBreakdown: searchTypeBreakdown.map(type => ({
      type: type.search_type,
      count: parseInt(type.count),
      avgResults: Math.round(parseFloat(type.avg_results) * 100) / 100
    })),
    hourlyTrends: hourlyTrends.map(trend => ({
      hour: trend.hour,
      searches: parseInt(trend.searches),
      avgResults: Math.round(parseFloat(trend.avg_results) * 100) / 100,
      uniqueUsers: parseInt(trend.unique_users)
    }))
  });
}

// Get performance analytics
async function getPerformanceAnalytics(startDate: Date) {
  const queryMetrics = performanceMonitor.getQueryMetrics(1000)
    .filter(m => m.timestamp > startDate);
  
  const searchQueries = queryMetrics.filter(m => 
    m.query.toLowerCase().includes('search') || 
    m.route.includes('/api/search/')
  );

  const performanceStats = {
    totalQueries: searchQueries.length,
    avgDuration: searchQueries.length > 0 
      ? searchQueries.reduce((sum, q) => sum + q.duration, 0) / searchQueries.length 
      : 0,
    slowQueries: searchQueries.filter(q => q.duration > 1000).length,
    errorRate: searchQueries.filter(q => q.errorMessage).length / Math.max(searchQueries.length, 1) * 100,
    p95Duration: calculatePercentile(searchQueries.map(q => q.duration), 95),
    p99Duration: calculatePercentile(searchQueries.map(q => q.duration), 99)
  };

  const slowQueriesAnalysis = searchQueries
    .filter(q => q.duration > 1000)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10)
    .map(q => ({
      query: q.query,
      duration: Math.round(q.duration),
      resultCount: q.resultCount || 0,
      timestamp: q.timestamp,
      error: q.errorMessage
    }));

  return NextResponse.json({
    success: true,
    performance: {
      ...performanceStats,
      avgDuration: Math.round(performanceStats.avgDuration * 100) / 100,
      errorRate: Math.round(performanceStats.errorRate * 100) / 100,
      p95Duration: Math.round(performanceStats.p95Duration * 100) / 100,
      p99Duration: Math.round(performanceStats.p99Duration * 100) / 100
    },
    slowQueries: slowQueriesAnalysis,
    recommendations: generatePerformanceRecommendations(performanceStats, slowQueriesAnalysis)
  });
}

// Get usage analytics
async function getUsageAnalytics(startDate: Date) {
  const [
    userEngagement,
    searchPatterns,
    resultInteraction,
    featureUsage
  ] = await Promise.all([
    // User engagement metrics
    prisma.$queryRaw<any[]>`
      SELECT 
        u.role,
        u."subscriptionTier",
        COUNT(s.id) as total_searches,
        AVG(s."resultsCount") as avg_results,
        COUNT(DISTINCT s."userId") as active_users
      FROM "User" u
      LEFT JOIN "Search" s ON u.id = s."userId" AND s."createdAt" >= ${startDate}
      GROUP BY u.role, u."subscriptionTier"
      ORDER BY total_searches DESC
    `,

    // Search patterns
    prisma.$queryRaw<any[]>`
      SELECT 
        CASE 
          WHEN LENGTH(query) <= 5 THEN 'short'
          WHEN LENGTH(query) <= 20 THEN 'medium'
          ELSE 'long'
        END as query_length,
        COUNT(*) as count,
        AVG("resultsCount") as avg_results
      FROM "Search"
      WHERE "createdAt" >= ${startDate}
      GROUP BY 1
      ORDER BY count DESC
    `,

    // Result interaction (searches with good results)
    prisma.$queryRaw<any[]>`
      SELECT 
        CASE 
          WHEN "resultsCount" = 0 THEN 'no_results'
          WHEN "resultsCount" <= 5 THEN 'few_results'
          WHEN "resultsCount" <= 20 THEN 'good_results'
          ELSE 'many_results'
        END as result_bucket,
        COUNT(*) as count,
        AVG("resultsCount") as avg_results
      FROM "Search"
      WHERE "createdAt" >= ${startDate}
      GROUP BY 1
      ORDER BY count DESC
    `,

    // Feature usage (search types)
    prisma.$queryRaw<any[]>`
      SELECT 
        "searchType",
        COUNT(*) as usage_count,
        COUNT(DISTINCT "userId") as unique_users,
        AVG("resultsCount") as avg_results
      FROM "Search"
      WHERE "createdAt" >= ${startDate}
        AND "searchType" IS NOT NULL
      GROUP BY "searchType"
      ORDER BY usage_count DESC
    `
  ]);

  return NextResponse.json({
    success: true,
    userEngagement: userEngagement.map(row => ({
      role: row.role,
      tier: row.subscriptionTier,
      totalSearches: parseInt(row.total_searches) || 0,
      avgResults: Math.round(parseFloat(row.avg_results) * 100) / 100 || 0,
      activeUsers: parseInt(row.active_users) || 0
    })),
    searchPatterns: searchPatterns.map(row => ({
      queryLength: row.query_length,
      count: parseInt(row.count),
      avgResults: Math.round(parseFloat(row.avg_results) * 100) / 100
    })),
    resultInteraction: resultInteraction.map(row => ({
      resultBucket: row.result_bucket,
      count: parseInt(row.count),
      avgResults: Math.round(parseFloat(row.avg_results) * 100) / 100
    })),
    featureUsage: featureUsage.map(row => ({
      searchType: row.searchType,
      usageCount: parseInt(row.usage_count),
      uniqueUsers: parseInt(row.unique_users),
      avgResults: Math.round(parseFloat(row.avg_results) * 100) / 100
    }))
  });
}

// Get popular searches
async function getPopularSearches(startDate: Date) {
  const [popularQueries, trendingQueries, zeroResultQueries] = await Promise.all([
    // Most popular queries
    prisma.$queryRaw<any[]>`
      SELECT 
        query,
        COUNT(*) as search_count,
        AVG("resultsCount") as avg_results,
        COUNT(DISTINCT "userId") as unique_users,
        MAX("createdAt") as last_searched
      FROM "Search"
      WHERE "createdAt" >= ${startDate}
        AND LENGTH(query) >= 3
        AND "resultsCount" > 0
      GROUP BY query
      ORDER BY search_count DESC
      LIMIT 20
    `,

    // Trending queries (increased usage)
    prisma.$queryRaw<any[]>`
      WITH current_period AS (
        SELECT query, COUNT(*) as current_count
        FROM "Search"
        WHERE "createdAt" >= ${startDate}
        GROUP BY query
      ),
      previous_period AS (
        SELECT query, COUNT(*) as previous_count
        FROM "Search"
        WHERE "createdAt" >= ${new Date(startDate.getTime() - (Date.now() - startDate.getTime()))}
          AND "createdAt" < ${startDate}
        GROUP BY query
      )
      SELECT 
        c.query,
        c.current_count,
        COALESCE(p.previous_count, 0) as previous_count,
        CASE 
          WHEN COALESCE(p.previous_count, 0) = 0 THEN 100
          ELSE ROUND(((c.current_count - p.previous_count) * 100.0 / p.previous_count), 2)
        END as growth_rate
      FROM current_period c
      LEFT JOIN previous_period p ON c.query = p.query
      WHERE c.current_count >= 3
      ORDER BY growth_rate DESC
      LIMIT 10
    `,

    // Zero result queries (need attention)
    prisma.$queryRaw<any[]>`
      SELECT 
        query,
        COUNT(*) as search_count,
        COUNT(DISTINCT "userId") as unique_users,
        MAX("createdAt") as last_searched
      FROM "Search"
      WHERE "createdAt" >= ${startDate}
        AND "resultsCount" = 0
        AND LENGTH(query) >= 3
      GROUP BY query
      ORDER BY search_count DESC
      LIMIT 15
    `
  ]);

  return NextResponse.json({
    success: true,
    popularQueries: popularQueries.map(row => ({
      query: row.query,
      searchCount: parseInt(row.search_count),
      avgResults: Math.round(parseFloat(row.avg_results) * 100) / 100,
      uniqueUsers: parseInt(row.unique_users),
      lastSearched: row.last_searched
    })),
    trendingQueries: trendingQueries.map(row => ({
      query: row.query,
      currentCount: parseInt(row.current_count),
      previousCount: parseInt(row.previous_count),
      growthRate: parseFloat(row.growth_rate)
    })),
    zeroResultQueries: zeroResultQueries.map(row => ({
      query: row.query,
      searchCount: parseInt(row.search_count),
      uniqueUsers: parseInt(row.unique_users),
      lastSearched: row.last_searched,
      needsAttention: true
    }))
  });
}

// Get database health analytics
async function getDatabaseHealth() {
  try {
    const health = await databaseOptimizer.analyzeDatabaseHealth();
    
    return NextResponse.json({
      success: true,
      database: {
        tables: health.tableStats.map(table => ({
          name: table.tableName,
          rowCount: table.rowCount,
          sizeMB: table.sizeMB,
          indexSizeMB: table.indexSizeMB,
          lastVacuum: table.vacuumStats.lastVacuum,
          lastAutoVacuum: table.vacuumStats.lastAutoVacuum
        })),
        indexes: health.indexEfficiency.map(index => ({
          table: index.tableName,
          name: index.indexName,
          scans: index.scans,
          efficiency: index.efficiency,
          recommendation: index.recommendation
        })),
        slowQueries: health.slowQueries.map(query => ({
          query: query.query,
          avgDuration: query.avgDuration,
          executionCount: query.executionCount,
          recommendations: query.recommendations,
          indexSuggestions: query.indexSuggestions
        })),
        connectionPool: health.connectionPoolHealth,
        recommendations: health.recommendations
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze database health'
    }, { status: 500 });
  }
}

// Helper function to calculate percentile
function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  
  const sorted = values.sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  
  if (Math.floor(index) === index) {
    return sorted[index];
  } else {
    const lower = sorted[Math.floor(index)];
    const upper = sorted[Math.ceil(index)];
    return lower + (upper - lower) * (index - Math.floor(index));
  }
}

// Generate performance recommendations
function generatePerformanceRecommendations(
  stats: any,
  slowQueries: any[]
): string[] {
  const recommendations: string[] = [];
  
  if (stats.avgDuration > 1500) {
    recommendations.push('Average query duration is high - consider adding indexes for common search patterns');
  }
  
  if (stats.errorRate > 5) {
    recommendations.push(`Error rate is high (${stats.errorRate.toFixed(1)}%) - investigate failing queries`);
  }
  
  if (stats.slowQueries > stats.totalQueries * 0.1) {
    recommendations.push('High percentage of slow queries - review and optimize database indexes');
  }
  
  if (slowQueries.length > 0) {
    const commonSlowPatterns = slowQueries
      .map(q => q.query)
      .filter((q, i, arr) => arr.indexOf(q) === i)
      .slice(0, 3);
    
    recommendations.push(`Most common slow queries: ${commonSlowPatterns.join(', ')} - priority optimization needed`);
  }
  
  if (stats.p99Duration > 5000) {
    recommendations.push('99th percentile duration is very high - investigate worst-case scenarios');
  }
  
  return recommendations;
}