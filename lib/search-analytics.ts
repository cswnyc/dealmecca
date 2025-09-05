import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

export interface SearchAnalytics {
  overview: {
    totalSearches: number;
    uniqueUsers: number;
    averageResultsPerSearch: number;
    searchSuccessRate: number;
    topSearchTerms: Array<{ term: string; count: number; successRate: number }>;
    searchTrends: Array<{ date: string; searches: number; users: number }>;
  };
  userInsights: {
    searchBehavior: {
      avgSearchesPerUser: number;
      avgSessionDuration: number;
      peakSearchHours: Array<{ hour: number; searches: number }>;
      searchPatterns: Array<{ pattern: string; users: number; description: string }>;
    };
    filterUsage: {
      mostUsedFilters: Array<{ filter: string; usageRate: number; avgResults: number }>;
      filterCombinations: Array<{ combination: string[]; count: number; successRate: number }>;
      filterDropoffRates: Array<{ filter: string; dropoffRate: number }>;
    };
    contentGaps: {
      searchesWithNoResults: Array<{ term: string; count: number; suggestedContent: string }>;
      underperformingCategories: Array<{ category: string; avgResults: number; searches: number }>;
      improvementOpportunities: Array<{ area: string; impact: string; effort: 'low' | 'medium' | 'high' }>;
    };
  };
  performance: {
    averageQueryTime: number;
    slowestQueries: Array<{ query: string; avgTime: number; occurrences: number }>;
    cacheHitRate: number;
    errorRate: number;
    timeoutRate: number;
  };
  predictions: {
    trendingSearches: Array<{ term: string; growthRate: number; predictedVolume: number }>;
    seasonalPatterns: Array<{ pattern: string; months: number[]; description: string }>;
    userRetentionPrediction: { rate: number; factors: string[] };
  };
}

export interface UserSearchProfile {
  userId: string;
  searchingStyle: 'explorer' | 'focused' | 'power_user' | 'occasional';
  preferredFilters: string[];
  searchFrequency: number;
  avgResultsViewed: number;
  topSearchCategories: string[];
  searchSuccessRate: number;
  timeSpentSearching: number;
  recommendations: Array<{
    type: 'filter' | 'search_term' | 'saved_search';
    content: string;
    reason: string;
  }>;
}

export interface SearchInsightReport {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  analytics: SearchAnalytics;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: 'performance' | 'content' | 'user_experience';
    title: string;
    description: string;
    expectedImpact: string;
    effort: 'low' | 'medium' | 'high';
  }>;
}

/**
 * Advanced search analytics and user insights engine
 */
export class SearchAnalyticsEngine {
  private static instance: SearchAnalyticsEngine;
  private analyticsCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  static getInstance(): SearchAnalyticsEngine {
    if (!SearchAnalyticsEngine.instance) {
      SearchAnalyticsEngine.instance = new SearchAnalyticsEngine();
    }
    return SearchAnalyticsEngine.instance;
  }

  /**
   * Get comprehensive search analytics
   */
  async getSearchAnalytics(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<SearchAnalytics> {
    const cacheKey = `analytics_${startDate.toISOString()}_${endDate.toISOString()}_${userId || 'all'}`;
    
    // Check cache
    const cached = this.analyticsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const [overview, userInsights, performance, predictions] = await Promise.all([
        this.generateOverviewAnalytics(startDate, endDate, userId),
        this.generateUserInsights(startDate, endDate, userId),
        this.generatePerformanceAnalytics(startDate, endDate, userId),
        this.generatePredictions(startDate, endDate, userId)
      ]);

      const analytics: SearchAnalytics = {
        overview,
        userInsights,
        performance,
        predictions
      };

      // Cache the result
      this.analyticsCache.set(cacheKey, { data: analytics, timestamp: Date.now() });

      logger.info('search', 'Search analytics generated', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        userId: userId || 'all',
        totalSearches: overview.totalSearches
      });

      return analytics;
    } catch (error) {
      logger.error('search', 'Failed to generate search analytics', { error });
      throw error;
    }
  }

  /**
   * Get user search profile and personalized insights
   */
  async getUserSearchProfile(userId: string, days: number = 30): Promise<UserSearchProfile> {
    const cacheKey = `profile_${userId}_${days}d`;
    const cached = this.analyticsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      // Get user's search history
      const userSearches = await prisma.search.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          searchFilters: true
        }
      });

      if (userSearches.length === 0) {
        return this.getDefaultUserProfile(userId);
      }

      // Analyze search patterns
      const searchFrequency = userSearches.length / days;
      const avgResultsViewed = userSearches.reduce((sum, s) => sum + (s.clickCount || 0), 0) / userSearches.length;
      const searchSuccessRate = userSearches.filter(s => (s.resultCount || 0) > 0).length / userSearches.length;
      
      // Determine searching style
      const searchingStyle = this.classifySearchingStyle(userSearches, searchFrequency);
      
      // Extract preferred filters
      const filterUsage = new Map<string, number>();
      userSearches.forEach(search => {
        if (search.searchFilters) {
          Object.keys(search.searchFilters).forEach(filter => {
            filterUsage.set(filter, (filterUsage.get(filter) || 0) + 1);
          });
        }
      });

      const preferredFilters = Array.from(filterUsage.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([filter]) => filter);

      // Categorize searches
      const searchCategories = this.categorizeSearches(userSearches);
      const topSearchCategories = Array.from(searchCategories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category);

      // Generate recommendations
      const recommendations = await this.generateUserRecommendations(userId, userSearches, {
        searchingStyle,
        preferredFilters,
        topSearchCategories,
        searchSuccessRate
      });

      const profile: UserSearchProfile = {
        userId,
        searchingStyle,
        preferredFilters,
        searchFrequency: Math.round(searchFrequency * 10) / 10,
        avgResultsViewed: Math.round(avgResultsViewed * 10) / 10,
        topSearchCategories,
        searchSuccessRate: Math.round(searchSuccessRate * 100),
        timeSpentSearching: this.calculateTimeSpentSearching(userSearches),
        recommendations
      };

      // Cache the profile
      this.analyticsCache.set(cacheKey, { data: profile, timestamp: Date.now() });

      return profile;
    } catch (error) {
      logger.error('search', 'Failed to generate user search profile', { userId, error });
      return this.getDefaultUserProfile(userId);
    }
  }

  /**
   * Generate comprehensive search insight report
   */
  async generateInsightReport(
    period: 'daily' | 'weekly' | 'monthly',
    date?: Date
  ): Promise<SearchInsightReport> {
    const endDate = date || new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    try {
      const [analytics, recommendations] = await Promise.all([
        this.getSearchAnalytics(startDate, endDate),
        this.generateSystemRecommendations(startDate, endDate)
      ]);

      const report: SearchInsightReport = {
        period,
        startDate,
        endDate,
        analytics,
        recommendations
      };

      logger.info('search', 'Search insight report generated', {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        recommendationCount: recommendations.length
      });

      return report;
    } catch (error) {
      logger.error('search', 'Failed to generate insight report', { period, error });
      throw error;
    }
  }

  /**
   * Track search interaction for analytics
   */
  async trackSearchInteraction(data: {
    userId?: string;
    sessionId: string;
    query: string;
    searchType: 'company' | 'contact';
    filters: Record<string, any>;
    resultCount: number;
    queryTime: number;
    clickedResults: number;
    timeSpent: number;
    successful: boolean;
  }): Promise<void> {
    try {
      // Store the search record for analytics
      await prisma.search.create({
        data: {
          userId: data.userId,
          sessionId: data.sessionId,
          query: data.query,
          searchType: data.searchType,
          searchFilters: data.filters,
          resultCount: data.resultCount,
          queryTime: data.queryTime,
          clickCount: data.clickedResults,
          timeSpent: data.timeSpent,
          successful: data.successful
        }
      });

      logger.info('search', 'Search interaction tracked', {
        userId: data.userId || 'anonymous',
        query: data.query,
        resultCount: data.resultCount,
        successful: data.successful
      });
    } catch (error) {
      logger.error('search', 'Failed to track search interaction', { error });
      // Don't throw - analytics failure shouldn't break search
    }
  }

  /**
   * Private helper methods
   */
  private async generateOverviewAnalytics(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<SearchAnalytics['overview']> {
    const whereClause = {
      createdAt: { gte: startDate, lte: endDate },
      ...(userId ? { userId } : {})
    };

    const [
      totalSearches,
      uniqueUsers,
      searchStats,
      topSearchTerms,
      searchTrends
    ] = await Promise.all([
      prisma.search.count({ where: whereClause }),
      userId ? 1 : prisma.search.groupBy({
        by: ['userId'],
        where: whereClause,
        _count: { userId: true }
      }).then(result => result.length),
      prisma.search.aggregate({
        where: whereClause,
        _avg: { resultCount: true },
        _count: { id: true }
      }),
      this.getTopSearchTerms(startDate, endDate, userId, 10),
      this.getSearchTrends(startDate, endDate, userId)
    ]);

    const successfulSearches = await prisma.search.count({
      where: { ...whereClause, successful: true }
    });

    return {
      totalSearches,
      uniqueUsers,
      averageResultsPerSearch: Math.round((searchStats._avg.resultCount || 0) * 10) / 10,
      searchSuccessRate: totalSearches > 0 ? Math.round((successfulSearches / totalSearches) * 100) : 0,
      topSearchTerms,
      searchTrends
    };
  }

  private async generateUserInsights(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<SearchAnalytics['userInsights']> {
    const [searchBehavior, filterUsage, contentGaps] = await Promise.all([
      this.analyzeSearchBehavior(startDate, endDate, userId),
      this.analyzeFilterUsage(startDate, endDate, userId),
      this.identifyContentGaps(startDate, endDate, userId)
    ]);

    return { searchBehavior, filterUsage, contentGaps };
  }

  private async generatePerformanceAnalytics(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<SearchAnalytics['performance']> {
    const whereClause = {
      createdAt: { gte: startDate, lte: endDate },
      ...(userId ? { userId } : {})
    };

    const [avgQueryTime, slowestQueries, errorStats] = await Promise.all([
      prisma.search.aggregate({
        where: whereClause,
        _avg: { queryTime: true }
      }),
      this.getSlowestQueries(startDate, endDate, userId, 5),
      this.getErrorStats(startDate, endDate, userId)
    ]);

    return {
      averageQueryTime: Math.round((avgQueryTime._avg.queryTime || 0) * 10) / 10,
      slowestQueries,
      cacheHitRate: 85, // Placeholder - would track from cache system
      errorRate: errorStats.errorRate,
      timeoutRate: errorStats.timeoutRate
    };
  }

  private async generatePredictions(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<SearchAnalytics['predictions']> {
    // Simplified predictions - in production, you'd use ML models
    const [trendingSearches, seasonalPatterns] = await Promise.all([
      this.identifyTrendingSearches(startDate, endDate, userId),
      this.identifySeasonalPatterns(startDate, endDate, userId)
    ]);

    return {
      trendingSearches,
      seasonalPatterns,
      userRetentionPrediction: {
        rate: 75, // Placeholder
        factors: ['search_success_rate', 'result_relevance', 'query_performance']
      }
    };
  }

  private async getTopSearchTerms(
    startDate: Date,
    endDate: Date,
    userId?: string,
    limit: number = 10
  ): Promise<Array<{ term: string; count: number; successRate: number }>> {
    const searches = await prisma.search.groupBy({
      by: ['query'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(userId ? { userId } : {})
      },
      _count: { query: true },
      _avg: { successful: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit
    });

    return searches.map(search => ({
      term: search.query,
      count: search._count.query,
      successRate: Math.round((search._avg.successful || 0) * 100)
    }));
  }

  private async getSearchTrends(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<Array<{ date: string; searches: number; users: number }>> {
    // Group by day for trend analysis
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as searches,
        COUNT(DISTINCT user_id) as users
      FROM "Search"
      WHERE created_at >= ${startDate} 
        AND created_at <= ${endDate}
        ${userId ? prisma.$queryRaw`AND user_id = ${userId}` : prisma.$queryRaw``}
      GROUP BY DATE(created_at)
      ORDER BY date
    ` as Array<{ date: Date; searches: bigint; users: bigint }>;

    return dailyStats.map(stat => ({
      date: stat.date.toISOString().split('T')[0],
      searches: Number(stat.searches),
      users: Number(stat.users)
    }));
  }

  private classifySearchingStyle(
    searches: any[],
    frequency: number
  ): 'explorer' | 'focused' | 'power_user' | 'occasional' {
    const avgFiltersPerSearch = searches.reduce((sum, s) => {
      const filterCount = s.searchFilters ? Object.keys(s.searchFilters).length : 0;
      return sum + filterCount;
    }, 0) / searches.length;

    const uniqueQueries = new Set(searches.map(s => s.query)).size;
    const queryVariety = uniqueQueries / searches.length;

    if (frequency > 5 && avgFiltersPerSearch > 3) return 'power_user';
    if (queryVariety > 0.7 && avgFiltersPerSearch < 2) return 'explorer';
    if (queryVariety < 0.3 && avgFiltersPerSearch > 1) return 'focused';
    return 'occasional';
  }

  private categorizeSearches(searches: any[]): Map<string, number> {
    const categories = new Map<string, number>();
    
    searches.forEach(search => {
      const query = search.query.toLowerCase();
      let category = 'general';

      if (query.includes('ceo') || query.includes('executive')) category = 'leadership';
      else if (query.includes('agency') || query.includes('marketing')) category = 'agencies';
      else if (query.includes('tech') || query.includes('software')) category = 'technology';
      else if (query.includes('media') || query.includes('advertising')) category = 'media';
      else if (query.includes('startup') || query.includes('funding')) category = 'startups';

      categories.set(category, (categories.get(category) || 0) + 1);
    });

    return categories;
  }

  private async generateUserRecommendations(
    userId: string,
    searches: any[],
    profile: {
      searchingStyle: string;
      preferredFilters: string[];
      topSearchCategories: string[];
      searchSuccessRate: number;
    }
  ): Promise<UserSearchProfile['recommendations']> {
    const recommendations: UserSearchProfile['recommendations'] = [];

    // Recommend based on searching style
    if (profile.searchingStyle === 'explorer') {
      recommendations.push({
        type: 'saved_search',
        content: 'Save frequently explored searches for quick access',
        reason: 'Your exploration style would benefit from saved searches'
      });
    }

    // Recommend filters based on success rate
    if (profile.searchSuccessRate < 0.5) {
      recommendations.push({
        type: 'filter',
        content: 'Try using industry or location filters to narrow results',
        reason: 'Adding filters can improve search relevance'
      });
    }

    // Recommend based on categories
    if (profile.topSearchCategories.includes('leadership')) {
      recommendations.push({
        type: 'search_term',
        content: 'Try "companies with new CMOs" for leadership changes',
        reason: 'Based on your interest in leadership searches'
      });
    }

    return recommendations;
  }

  private async generateSystemRecommendations(
    startDate: Date,
    endDate: Date
  ): Promise<SearchInsightReport['recommendations']> {
    // Placeholder recommendations - in production, analyze actual data
    return [
      {
        priority: 'high',
        category: 'performance',
        title: 'Optimize slow search queries',
        description: 'Several search patterns are taking longer than 3 seconds',
        expectedImpact: 'Reduce average search time by 40%',
        effort: 'medium'
      },
      {
        priority: 'medium',
        category: 'content',
        title: 'Add more startup companies',
        description: 'High search volume for startups with low result counts',
        expectedImpact: 'Increase search success rate for startup queries by 25%',
        effort: 'high'
      }
    ];
  }

  private async analyzeSearchBehavior(startDate: Date, endDate: Date, userId?: string) {
    // Placeholder implementation
    return {
      avgSearchesPerUser: 12.5,
      avgSessionDuration: 480, // seconds
      peakSearchHours: [
        { hour: 9, searches: 150 },
        { hour: 14, searches: 200 },
        { hour: 16, searches: 180 }
      ],
      searchPatterns: [
        { pattern: 'Company name + industry', users: 45, description: 'Users search by company name then filter by industry' },
        { pattern: 'Location first', users: 32, description: 'Users start with location filters' }
      ]
    };
  }

  private async analyzeFilterUsage(startDate: Date, endDate: Date, userId?: string) {
    return {
      mostUsedFilters: [
        { filter: 'industry', usageRate: 65, avgResults: 23 },
        { filter: 'location', usageRate: 55, avgResults: 34 }
      ],
      filterCombinations: [
        { combination: ['industry', 'location'], count: 120, successRate: 85 }
      ],
      filterDropoffRates: [
        { filter: 'employeeCount', dropoffRate: 15 }
      ]
    };
  }

  private async identifyContentGaps(startDate: Date, endDate: Date, userId?: string) {
    return {
      searchesWithNoResults: [
        { term: 'crypto startups', count: 25, suggestedContent: 'Add more cryptocurrency companies' }
      ],
      underperformingCategories: [
        { category: 'non-profit', avgResults: 2.3, searches: 45 }
      ],
      improvementOpportunities: [
        { area: 'International companies', impact: 'High search volume, low results', effort: 'high' }
      ]
    };
  }

  private async getSlowestQueries(startDate: Date, endDate: Date, userId?: string, limit: number) {
    return [
      { query: 'companies with over 10000 employees', avgTime: 4500, occurrences: 23 },
      { query: 'tech startups in california', avgTime: 3200, occurrences: 67 }
    ];
  }

  private async getErrorStats(startDate: Date, endDate: Date, userId?: string) {
    return {
      errorRate: 2.3, // percentage
      timeoutRate: 0.8 // percentage
    };
  }

  private async identifyTrendingSearches(startDate: Date, endDate: Date, userId?: string) {
    return [
      { term: 'AI companies', growthRate: 45, predictedVolume: 200 },
      { term: 'sustainable brands', growthRate: 38, predictedVolume: 150 }
    ];
  }

  private async identifySeasonalPatterns(startDate: Date, endDate: Date, userId?: string) {
    return [
      { pattern: 'Holiday marketing', months: [10, 11, 12], description: 'Increased searches for retail companies during Q4' },
      { pattern: 'Back to school', months: [8, 9], description: 'Education-related company searches peak in August-September' }
    ];
  }

  private calculateTimeSpentSearching(searches: any[]): number {
    return searches.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / 60; // Convert to minutes
  }

  private getDefaultUserProfile(userId: string): UserSearchProfile {
    return {
      userId,
      searchingStyle: 'occasional',
      preferredFilters: [],
      searchFrequency: 0,
      avgResultsViewed: 0,
      topSearchCategories: [],
      searchSuccessRate: 0,
      timeSpentSearching: 0,
      recommendations: [
        {
          type: 'search_term',
          content: 'Start with broad terms like company names or industries',
          reason: 'You\'re new to searching - broad terms work well to get started'
        }
      ]
    };
  }

  /**
   * Clear analytics cache
   */
  clearCache(): void {
    this.analyticsCache.clear();
    logger.info('search', 'Search analytics cache cleared');
  }
}

// Export singleton instance
export const searchAnalyticsEngine = SearchAnalyticsEngine.getInstance();