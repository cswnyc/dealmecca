import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { SearchFilters } from './search-utils';

const prisma = new PrismaClient();

export interface RankingSignal {
  name: string;
  weight: number;
  score: number;
  reason: string;
}

export interface RankedResult {
  id: string;
  type: 'company' | 'contact';
  data: any;
  relevanceScore: number;
  rankingSignals: RankingSignal[];
  personalizedScore?: number;
  explanation: string;
}

export interface RankingConfig {
  textMatchWeight: number;
  verificationBonus: number;
  dataQualityBonus: number;
  popularityBonus: number;
  recencyBonus: number;
  userPreferenceBonus: number;
  locationProximityBonus: number;
  industryRelevanceBonus: number;
  seniorityBonus: number;
  companyScaleBonus: number;
}

export interface UserPreferences {
  preferredIndustries: string[];
  preferredLocations: string[];
  preferredCompanyTypes: string[];
  preferredSeniorities: string[];
  searchHistory: Array<{
    query: string;
    clickedResults: string[];
    timeSpent: number;
  }>;
  interactionWeights: Record<string, number>;
}

/**
 * Advanced search result ranking engine with ML-inspired signals
 */
export class SearchRankingEngine {
  private static instance: SearchRankingEngine;
  private rankingConfig: RankingConfig;

  constructor() {
    this.rankingConfig = {
      textMatchWeight: 0.25,
      verificationBonus: 0.15,
      dataQualityBonus: 0.12,
      popularityBonus: 0.10,
      recencyBonus: 0.08,
      userPreferenceBonus: 0.12,
      locationProximityBonus: 0.08,
      industryRelevanceBonus: 0.10,
      seniorityBonus: 0.08,
      companyScaleBonus: 0.07
    };
  }

  static getInstance(): SearchRankingEngine {
    if (!SearchRankingEngine.instance) {
      SearchRankingEngine.instance = new SearchRankingEngine();
    }
    return SearchRankingEngine.instance;
  }

  /**
   * Rank search results using multiple signals
   */
  async rankResults(
    results: any[],
    searchQuery: string,
    searchType: 'company' | 'contact',
    filters: SearchFilters,
    userId?: string,
    userLocation?: { city: string; state: string }
  ): Promise<RankedResult[]> {
    try {
      const startTime = Date.now();

      // Get user preferences if available
      const userPreferences = userId ? await this.getUserPreferences(userId) : null;

      // Calculate ranking signals for each result
      const rankedResults: RankedResult[] = [];

      for (const result of results) {
        const signals = await this.calculateRankingSignals(
          result,
          searchQuery,
          searchType,
          filters,
          userPreferences,
          userLocation
        );

        const relevanceScore = this.combineSignals(signals);
        const personalizedScore = userPreferences ? 
          this.calculatePersonalizedScore(result, userPreferences, signals) : 
          undefined;

        const explanation = this.generateExplanation(signals, personalizedScore);

        rankedResults.push({
          id: result.id,
          type: searchType,
          data: result,
          relevanceScore: Math.round(relevanceScore * 100) / 100,
          rankingSignals: signals,
          personalizedScore: personalizedScore ? Math.round(personalizedScore * 100) / 100 : undefined,
          explanation
        });
      }

      // Sort by final score (personalized if available, otherwise relevance)
      rankedResults.sort((a, b) => {
        const scoreA = a.personalizedScore || a.relevanceScore;
        const scoreB = b.personalizedScore || b.relevanceScore;
        return scoreB - scoreA;
      });

      logger.info('search', 'Search results ranked', {
        totalResults: results.length,
        searchQuery,
        searchType,
        userId: userId || 'anonymous',
        avgRelevanceScore: rankedResults.reduce((sum, r) => sum + r.relevanceScore, 0) / rankedResults.length,
        rankingTime: Date.now() - startTime
      });

      return rankedResults;
    } catch (error) {
      logger.error('search', 'Failed to rank search results', { error });
      // Return original results with basic scoring as fallback
      return results.map((result, index) => ({
        id: result.id,
        type: searchType,
        data: result,
        relevanceScore: 100 - index,
        rankingSignals: [],
        explanation: 'Basic ordering applied due to ranking error'
      }));
    }
  }

  /**
   * Calculate all ranking signals for a result
   */
  private async calculateRankingSignals(
    result: any,
    searchQuery: string,
    searchType: 'company' | 'contact',
    filters: SearchFilters,
    userPreferences: UserPreferences | null,
    userLocation?: { city: string; state: string }
  ): Promise<RankingSignal[]> {
    const signals: RankingSignal[] = [];

    // Text match relevance
    const textMatchScore = this.calculateTextMatchScore(result, searchQuery, searchType);
    signals.push({
      name: 'text_match',
      weight: this.rankingConfig.textMatchWeight,
      score: textMatchScore,
      reason: `Query "${searchQuery}" matches ${searchType} data`
    });

    // Verification status
    if (result.verified) {
      signals.push({
        name: 'verification',
        weight: this.rankingConfig.verificationBonus,
        score: 100,
        reason: 'Verified profile with authentic data'
      });
    }

    // Data quality
    const dataQualityScore = this.calculateDataQualityScore(result, searchType);
    signals.push({
      name: 'data_quality',
      weight: this.rankingConfig.dataQualityBonus,
      score: dataQualityScore,
      reason: 'Profile completeness and data richness'
    });

    // Popularity (interaction-based)
    const popularityScore = await this.calculatePopularityScore(result.id, searchType);
    if (popularityScore > 0) {
      signals.push({
        name: 'popularity',
        weight: this.rankingConfig.popularityBonus,
        score: popularityScore,
        reason: 'High user engagement and clicks'
      });
    }

    // Recency
    const recencyScore = this.calculateRecencyScore(result);
    if (recencyScore > 0) {
      signals.push({
        name: 'recency',
        weight: this.rankingConfig.recencyBonus,
        score: recencyScore,
        reason: 'Recently updated profile information'
      });
    }

    // User preferences
    if (userPreferences) {
      const preferenceScore = this.calculatePreferenceScore(result, userPreferences, searchType);
      if (preferenceScore > 0) {
        signals.push({
          name: 'user_preference',
          weight: this.rankingConfig.userPreferenceBonus,
          score: preferenceScore,
          reason: 'Matches your search patterns and preferences'
        });
      }
    }

    // Location proximity
    if (userLocation) {
      const locationScore = this.calculateLocationProximity(result, userLocation, searchType);
      if (locationScore > 0) {
        signals.push({
          name: 'location_proximity',
          weight: this.rankingConfig.locationProximityBonus,
          score: locationScore,
          reason: 'Geographic proximity to your location'
        });
      }
    }

    // Industry relevance
    const industryScore = this.calculateIndustryRelevance(result, filters, searchType);
    if (industryScore > 0) {
      signals.push({
        name: 'industry_relevance',
        weight: this.rankingConfig.industryRelevanceBonus,
        score: industryScore,
        reason: 'Strong industry alignment with search context'
      });
    }

    // Seniority bonus (for contacts)
    if (searchType === 'contact' && result.seniority) {
      const seniorityScore = this.calculateSeniorityScore(result.seniority);
      signals.push({
        name: 'seniority',
        weight: this.rankingConfig.seniorityBonus,
        score: seniorityScore,
        reason: `${result.seniority.replace('_', ' ')} level position`
      });
    }

    // Company scale bonus
    if (searchType === 'company' || result.company) {
      const scaleScore = this.calculateCompanyScaleScore(result, searchType);
      if (scaleScore > 0) {
        signals.push({
          name: 'company_scale',
          weight: this.rankingConfig.companyScaleBonus,
          score: scaleScore,
          reason: 'Company size and market presence'
        });
      }
    }

    return signals;
  }

  /**
   * Calculate text match relevance score
   */
  private calculateTextMatchScore(
    result: any,
    searchQuery: string,
    searchType: 'company' | 'contact'
  ): number {
    const query = searchQuery.toLowerCase();
    let score = 0;
    let maxScore = 100;

    if (searchType === 'company') {
      const name = (result.name || '').toLowerCase();
      const description = (result.description || '').toLowerCase();

      // Exact name match
      if (name === query) {
        score += 100;
      } else if (name.startsWith(query)) {
        score += 80;
      } else if (name.includes(query)) {
        score += 60;
      }

      // Description match
      if (description.includes(query)) {
        score += 20;
      }

      // Keywords in name
      const queryWords = query.split(' ');
      const nameWords = name.split(' ');
      const matchingWords = queryWords.filter(word => 
        nameWords.some(nameWord => nameWord.includes(word))
      );
      score += (matchingWords.length / queryWords.length) * 40;

    } else {
      const firstName = (result.firstName || '').toLowerCase();
      const lastName = (result.lastName || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`;
      const title = (result.title || '').toLowerCase();
      const companyName = (result.company?.name || '').toLowerCase();

      // Name matches
      if (fullName === query || firstName === query || lastName === query) {
        score += 100;
      } else if (fullName.includes(query)) {
        score += 70;
      }

      // Title match
      if (title.includes(query)) {
        score += 40;
      }

      // Company name match
      if (companyName.includes(query)) {
        score += 30;
      }
    }

    return Math.min(score, maxScore);
  }

  /**
   * Calculate data quality score based on completeness
   */
  private calculateDataQualityScore(result: any, searchType: 'company' | 'contact'): number {
    let score = 0;
    let totalFields = 0;
    let filledFields = 0;

    if (searchType === 'company') {
      const fields = [
        'name', 'description', 'website', 'industry', 'companyType',
        'city', 'state', 'employeeCount', 'revenueRange', 'foundedYear'
      ];
      
      fields.forEach(field => {
        totalFields++;
        if (result[field] && result[field] !== '' && result[field] !== null) {
          filledFields++;
        }
      });

      // Bonus for premium data
      if (result.description && result.description.length > 100) score += 10;
      if (result.website) score += 10;
      if (result.logoUrl) score += 5;
      
    } else {
      const fields = [
        'firstName', 'lastName', 'title', 'email', 'phone',
        'department', 'seniority', 'linkedinUrl'
      ];

      fields.forEach(field => {
        totalFields++;
        if (result[field] && result[field] !== '' && result[field] !== null) {
          filledFields++;
        }
      });

      // Bonus for contact-specific data
      if (result.email) score += 15;
      if (result.linkedinUrl) score += 10;
      if (result.phone) score += 5;
    }

    const completenessScore = (filledFields / totalFields) * 80;
    return Math.min(completenessScore + score, 100);
  }

  /**
   * Calculate popularity based on user interactions
   */
  private async calculatePopularityScore(resultId: string, searchType: 'company' | 'contact'): Promise<number> {
    try {
      // Get interaction count for the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const interactions = await prisma.search.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          clickedResults: {
            has: resultId
          }
        }
      });

      // Logarithmic scaling to prevent outliers from dominating
      return Math.min(Math.log(interactions + 1) * 20, 100);
    } catch (error) {
      logger.error('search', 'Failed to calculate popularity score', { resultId, error });
      return 0;
    }
  }

  /**
   * Calculate recency score based on last update
   */
  private calculateRecencyScore(result: any): number {
    if (!result.updatedAt && !result.createdAt) return 0;

    const lastUpdate = new Date(result.updatedAt || result.createdAt);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    // Fresher data gets higher scores
    if (daysSinceUpdate <= 7) return 100;
    if (daysSinceUpdate <= 30) return 80;
    if (daysSinceUpdate <= 90) return 60;
    if (daysSinceUpdate <= 180) return 40;
    if (daysSinceUpdate <= 365) return 20;
    return 0;
  }

  /**
   * Calculate preference score based on user history
   */
  private calculatePreferenceScore(
    result: any,
    userPreferences: UserPreferences,
    searchType: 'company' | 'contact'
  ): number {
    let score = 0;

    if (searchType === 'company') {
      // Industry preference
      if (result.industry && userPreferences.preferredIndustries.includes(result.industry)) {
        score += 30;
      }

      // Location preference
      const resultLocation = `${result.city}, ${result.state}`;
      if (userPreferences.preferredLocations.includes(resultLocation)) {
        score += 25;
      }

      // Company type preference
      if (result.companyType && userPreferences.preferredCompanyTypes.includes(result.companyType)) {
        score += 20;
      }

    } else {
      // Seniority preference
      if (result.seniority && userPreferences.preferredSeniorities.includes(result.seniority)) {
        score += 25;
      }

      // Company industry preference (for contact's company)
      if (result.company?.industry && userPreferences.preferredIndustries.includes(result.company.industry)) {
        score += 20;
      }

      // Company location preference
      if (result.company) {
        const companyLocation = `${result.company.city}, ${result.company.state}`;
        if (userPreferences.preferredLocations.includes(companyLocation)) {
          score += 15;
        }
      }
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate location proximity score
   */
  private calculateLocationProximity(
    result: any,
    userLocation: { city: string; state: string },
    searchType: 'company' | 'contact'
  ): number {
    let resultLocation: { city: string; state: string } | null = null;

    if (searchType === 'company') {
      if (result.city && result.state) {
        resultLocation = { city: result.city, state: result.state };
      }
    } else {
      if (result.company?.city && result.company?.state) {
        resultLocation = { city: result.company.city, state: result.company.state };
      }
    }

    if (!resultLocation) return 0;

    // Same city = 100 points
    if (resultLocation.city.toLowerCase() === userLocation.city.toLowerCase() &&
        resultLocation.state.toLowerCase() === userLocation.state.toLowerCase()) {
      return 100;
    }

    // Same state = 50 points
    if (resultLocation.state.toLowerCase() === userLocation.state.toLowerCase()) {
      return 50;
    }

    // Different state = 0 points (could enhance with actual distance calculation)
    return 0;
  }

  /**
   * Calculate industry relevance score
   */
  private calculateIndustryRelevance(
    result: any,
    filters: SearchFilters,
    searchType: 'company' | 'contact'
  ): number {
    if (!filters.industry || filters.industry.length === 0) return 0;

    let resultIndustry: string | null = null;

    if (searchType === 'company') {
      resultIndustry = result.industry;
    } else {
      resultIndustry = result.company?.industry;
    }

    if (!resultIndustry) return 0;

    // Exact industry match
    if (filters.industry.includes(resultIndustry)) {
      return 100;
    }

    // Related industry logic could be added here
    return 0;
  }

  /**
   * Calculate seniority score
   */
  private calculateSeniorityScore(seniority: string): number {
    const seniorityScores: Record<string, number> = {
      'C_LEVEL': 100,
      'FOUNDER_OWNER': 95,
      'EVP': 90,
      'SVP': 85,
      'VP': 80,
      'SENIOR_DIRECTOR': 75,
      'DIRECTOR': 70,
      'SENIOR_MANAGER': 60,
      'MANAGER': 50,
      'SENIOR_SPECIALIST': 40,
      'SPECIALIST': 30,
      'COORDINATOR': 20,
      'INTERN': 10
    };

    return seniorityScores[seniority] || 0;
  }

  /**
   * Calculate company scale score
   */
  private calculateCompanyScaleScore(result: any, searchType: 'company' | 'contact'): number {
    let employeeCount: string | null = null;
    let revenueRange: string | null = null;

    if (searchType === 'company') {
      employeeCount = result.employeeCount;
      revenueRange = result.revenueRange;
    } else {
      employeeCount = result.company?.employeeCount;
      revenueRange = result.company?.revenueRange;
    }

    let score = 0;

    // Employee count scoring
    if (employeeCount) {
      const employeeScores: Record<string, number> = {
        'MEGA_5000_PLUS': 50,
        'ENTERPRISE_1001_5000': 45,
        'LARGE_201_1000': 40,
        'MEDIUM_51_200': 30,
        'SMALL_11_50': 20,
        'STARTUP_1_10': 15
      };
      score += employeeScores[employeeCount] || 0;
    }

    // Revenue range scoring
    if (revenueRange) {
      const revenueScores: Record<string, number> = {
        'OVER_1B': 50,
        'RANGE_500M_1B': 45,
        'RANGE_100M_500M': 40,
        'RANGE_25M_100M': 30,
        'RANGE_5M_25M': 20,
        'RANGE_1M_5M': 15,
        'UNDER_1M': 10
      };
      score += revenueScores[revenueRange] || 0;
    }

    return Math.min(score, 100);
  }

  /**
   * Combine all signals into final relevance score
   */
  private combineSignals(signals: RankingSignal[]): number {
    let totalScore = 0;
    let totalWeight = 0;

    signals.forEach(signal => {
      totalScore += signal.score * signal.weight;
      totalWeight += signal.weight;
    });

    // Normalize to 0-100 scale
    return totalWeight > 0 ? (totalScore / totalWeight) : 0;
  }

  /**
   * Calculate personalized score with user interaction weights
   */
  private calculatePersonalizedScore(
    result: any,
    userPreferences: UserPreferences,
    signals: RankingSignal[]
  ): number {
    const baseScore = this.combineSignals(signals);

    // Apply user-specific signal weights
    let personalizedScore = baseScore;

    signals.forEach(signal => {
      const userWeight = userPreferences.interactionWeights[signal.name] || 1.0;
      if (userWeight !== 1.0) {
        personalizedScore += (signal.score * signal.weight * (userWeight - 1.0));
      }
    });

    return Math.min(Math.max(personalizedScore, 0), 100);
  }

  /**
   * Generate human-readable explanation for ranking
   */
  private generateExplanation(
    signals: RankingSignal[],
    personalizedScore?: number
  ): string {
    const topSignals = signals
      .filter(s => s.score > 50)
      .sort((a, b) => (b.score * b.weight) - (a.score * a.weight))
      .slice(0, 3);

    if (topSignals.length === 0) {
      return 'Basic relevance match';
    }

    const explanationParts = topSignals.map(signal => signal.reason);
    let explanation = explanationParts.join('; ');

    if (personalizedScore) {
      explanation += '; Personalized based on your search patterns';
    }

    return explanation;
  }

  /**
   * Get user preferences from search history
   */
  private async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      // Get user's recent search history (last 30 days)
      const recentSearches = await prisma.search.findMany({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      if (recentSearches.length === 0) return null;

      // Extract preferences from search patterns
      const industryCount = new Map<string, number>();
      const locationCount = new Map<string, number>();
      const companyTypeCount = new Map<string, number>();
      const seniorityCount = new Map<string, number>();

      recentSearches.forEach(search => {
        if (search.searchFilters) {
          const filters = search.searchFilters as any;
          
          // Count industry filters
          if (filters.industry) {
            filters.industry.forEach((industry: string) => {
              industryCount.set(industry, (industryCount.get(industry) || 0) + 1);
            });
          }

          // Count location filters
          if (filters.location) {
            filters.location.forEach((location: string) => {
              locationCount.set(location, (locationCount.get(location) || 0) + 1);
            });
          }

          // Count company type filters
          if (filters.companyType) {
            filters.companyType.forEach((type: string) => {
              companyTypeCount.set(type, (companyTypeCount.get(type) || 0) + 1);
            });
          }

          // Count seniority filters
          if (filters.seniority) {
            filters.seniority.forEach((seniority: string) => {
              seniorityCount.set(seniority, (seniorityCount.get(seniority) || 0) + 1);
            });
          }
        }
      });

      // Convert to preferences (top 5 in each category)
      const getTopPreferences = (countMap: Map<string, number>) =>
        Array.from(countMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([key]) => key);

      return {
        preferredIndustries: getTopPreferences(industryCount),
        preferredLocations: getTopPreferences(locationCount),
        preferredCompanyTypes: getTopPreferences(companyTypeCount),
        preferredSeniorities: getTopPreferences(seniorityCount),
        searchHistory: recentSearches.map(search => ({
          query: search.query,
          clickedResults: search.clickedResults || [],
          timeSpent: search.timeSpent || 0
        })),
        interactionWeights: {
          // Default weights - could be learned from user behavior
          text_match: 1.2,
          verification: 1.0,
          data_quality: 1.1,
          popularity: 0.8,
          recency: 1.0,
          user_preference: 1.5,
          location_proximity: 1.0,
          industry_relevance: 1.3,
          seniority: 1.0,
          company_scale: 0.9
        }
      };
    } catch (error) {
      logger.error('search', 'Failed to get user preferences', { userId, error });
      return null;
    }
  }

  /**
   * Update ranking configuration
   */
  updateRankingConfig(newConfig: Partial<RankingConfig>): void {
    this.rankingConfig = { ...this.rankingConfig, ...newConfig };
    logger.info('search', 'Ranking configuration updated', { newConfig });
  }

  /**
   * Get current ranking configuration
   */
  getRankingConfig(): RankingConfig {
    return { ...this.rankingConfig };
  }
}

// Export singleton instance
export const searchRankingEngine = SearchRankingEngine.getInstance();