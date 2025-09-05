import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

export interface SearchSuggestion {
  id: string;
  query: string;
  type: 'company' | 'contact' | 'location' | 'industry' | 'title' | 'trend' | 'recent';
  display: string;
  description?: string;
  count?: number;
  popularity: number;
  category: string;
  metadata?: Record<string, any>;
}

export interface AutoCompleteResponse {
  suggestions: SearchSuggestion[];
  categories: {
    companies: SearchSuggestion[];
    contacts: SearchSuggestion[];
    locations: SearchSuggestion[];
    industries: SearchSuggestion[];
    recent: SearchSuggestion[];
    trending: SearchSuggestion[];
  };
  totalResults: number;
  queryTime: number;
}

/**
 * Advanced search suggestions with real data insights
 */
export class SearchSuggestionEngine {
  private static instance: SearchSuggestionEngine;
  private suggestionCache = new Map<string, { data: AutoCompleteResponse; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): SearchSuggestionEngine {
    if (!SearchSuggestionEngine.instance) {
      SearchSuggestionEngine.instance = new SearchSuggestionEngine();
    }
    return SearchSuggestionEngine.instance;
  }

  /**
   * Get comprehensive auto-complete suggestions
   */
  async getAutoCompleteSuggestions(
    query: string,
    userId?: string,
    limit: number = 10
  ): Promise<AutoCompleteResponse> {
    const startTime = Date.now();
    const cacheKey = `${query.toLowerCase()}_${userId || 'anonymous'}_${limit}`;
    
    // Check cache first
    const cached = this.suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      logger.info('search', 'Auto-complete suggestions served from cache', { query, cached: true });
      return cached.data;
    }

    try {
      const [
        companySuggestions,
        contactSuggestions,
        locationSuggestions,
        industrySuggestions,
        recentSearches,
        trendingSuggestions
      ] = await Promise.all([
        this.getCompanySuggestions(query, limit),
        this.getContactSuggestions(query, limit),
        this.getLocationSuggestions(query, limit),
        this.getIndustrySuggestions(query, limit),
        this.getRecentSearches(query, userId, Math.min(limit, 3)),
        this.getTrendingSuggestions(query, limit)
      ]);

      // Combine and rank all suggestions
      const allSuggestions = [
        ...companySuggestions,
        ...contactSuggestions,
        ...locationSuggestions,
        ...industrySuggestions,
        ...recentSearches,
        ...trendingSuggestions
      ];

      // Sort by relevance and popularity
      const rankedSuggestions = allSuggestions
        .sort((a, b) => {
          // Prioritize exact matches
          const aExact = a.display.toLowerCase().startsWith(query.toLowerCase()) ? 100 : 0;
          const bExact = b.display.toLowerCase().startsWith(query.toLowerCase()) ? 100 : 0;
          
          // Combine with popularity score
          const aScore = aExact + a.popularity;
          const bScore = bExact + b.popularity;
          
          return bScore - aScore;
        })
        .slice(0, limit);

      const response: AutoCompleteResponse = {
        suggestions: rankedSuggestions,
        categories: {
          companies: companySuggestions.slice(0, 5),
          contacts: contactSuggestions.slice(0, 5),
          locations: locationSuggestions.slice(0, 5),
          industries: industrySuggestions.slice(0, 5),
          recent: recentSearches,
          trending: trendingSuggestions.slice(0, 5)
        },
        totalResults: allSuggestions.length,
        queryTime: Date.now() - startTime
      };

      // Cache the response
      this.suggestionCache.set(cacheKey, { data: response, timestamp: Date.now() });

      logger.info('search', 'Auto-complete suggestions generated', {
        query,
        totalResults: response.totalResults,
        queryTime: response.queryTime,
        userId
      });

      return response;
    } catch (error) {
      logger.error('search', 'Failed to generate auto-complete suggestions', { query, error });
      throw error;
    }
  }

  /**
   * Get company name suggestions
   */
  private async getCompanySuggestions(query: string, limit: number): Promise<SearchSuggestion[]> {
    try {
      const companies = await prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ],
          isActive: true
        },
        select: {
          id: true,
          name: true,
          companyType: true,
          industry: true,
          city: true,
          state: true,
          country: true,
          verified: true,
          _count: {
            select: { contacts: true }
          }
        },
        orderBy: [
          { verified: 'desc' },
          { _relevance: { fields: ['name'], search: query, sort: 'desc' } }
        ],
        take: limit
      });

      return companies.map((company, index) => ({
        id: `company_${company.id}`,
        query: company.name,
        type: 'company' as const,
        display: company.name,
        description: `${company.companyType || 'Company'} in ${company.city}, ${company.state}`,
        count: company._count.contacts,
        popularity: this.calculateCompanyPopularity(company, index),
        category: 'Companies',
        metadata: {
          companyType: company.companyType,
          industry: company.industry,
          location: `${company.city}, ${company.state}`,
          verified: company.verified,
          contactCount: company._count.contacts
        }
      }));
    } catch (error) {
      logger.error('search', 'Failed to get company suggestions', { query, error });
      return [];
    }
  }

  /**
   * Get contact suggestions (by name, title, company)
   */
  private async getContactSuggestions(query: string, limit: number): Promise<SearchSuggestion[]> {
    try {
      const contacts = await prisma.contact.findMany({
        where: {
          AND: [
            {
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { title: { contains: query, mode: 'insensitive' } },
                { company: { name: { contains: query, mode: 'insensitive' } } }
              ]
            },
            { isActive: true }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          title: true,
          seniority: true,
          department: true,
          verified: true,
          company: {
            select: {
              name: true,
              city: true,
              state: true
            }
          }
        },
        orderBy: [
          { verified: 'desc' },
          { _relevance: { fields: ['firstName', 'lastName', 'title'], search: query, sort: 'desc' } }
        ],
        take: limit
      });

      return contacts.map((contact, index) => ({
        id: `contact_${contact.id}`,
        query: `${contact.firstName} ${contact.lastName}`,
        type: 'contact' as const,
        display: `${contact.firstName} ${contact.lastName}`,
        description: `${contact.title} at ${contact.company.name}`,
        popularity: this.calculateContactPopularity(contact, index),
        category: 'People',
        metadata: {
          title: contact.title,
          company: contact.company.name,
          location: `${contact.company.city}, ${contact.company.state}`,
          seniority: contact.seniority,
          department: contact.department,
          verified: contact.verified
        }
      }));
    } catch (error) {
      logger.error('search', 'Failed to get contact suggestions', { query, error });
      return [];
    }
  }

  /**
   * Get location-based suggestions
   */
  private async getLocationSuggestions(query: string, limit: number): Promise<SearchSuggestion[]> {
    try {
      // Get unique locations from companies
      const locations = await prisma.company.groupBy({
        by: ['city', 'state', 'country'],
        where: {
          OR: [
            { city: { contains: query, mode: 'insensitive' } },
            { state: { contains: query, mode: 'insensitive' } }
          ],
          isActive: true
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: { id: 'desc' }
        },
        take: limit
      });

      return locations.map((location, index) => ({
        id: `location_${location.city}_${location.state}`,
        query: `${location.city}, ${location.state}`,
        type: 'location' as const,
        display: `${location.city}, ${location.state}`,
        description: `${location._count.id} companies`,
        count: location._count.id,
        popularity: 90 - index * 5, // Decrease by position
        category: 'Locations',
        metadata: {
          city: location.city,
          state: location.state,
          country: location.country,
          companyCount: location._count.id
        }
      }));
    } catch (error) {
      logger.error('search', 'Failed to get location suggestions', { query, error });
      return [];
    }
  }

  /**
   * Get industry suggestions
   */
  private async getIndustrySuggestions(query: string, limit: number): Promise<SearchSuggestion[]> {
    try {
      const industries = await prisma.company.groupBy({
        by: ['industry'],
        where: {
          industry: { contains: query, mode: 'insensitive' },
          isActive: true
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: { id: 'desc' }
        },
        take: limit
      });

      return industries.map((industry, index) => ({
        id: `industry_${industry.industry}`,
        query: industry.industry || 'Unknown',
        type: 'industry' as const,
        display: industry.industry || 'Unknown',
        description: `${industry._count.id} companies`,
        count: industry._count.id,
        popularity: 85 - index * 3,
        category: 'Industries',
        metadata: {
          industry: industry.industry,
          companyCount: industry._count.id
        }
      }));
    } catch (error) {
      logger.error('search', 'Failed to get industry suggestions', { query, error });
      return [];
    }
  }

  /**
   * Get recent searches for user
   */
  private async getRecentSearches(
    query: string, 
    userId?: string, 
    limit: number = 3
  ): Promise<SearchSuggestion[]> {
    if (!userId) return [];

    try {
      const recentSearches = await prisma.search.findMany({
        where: {
          userId,
          query: { contains: query, mode: 'insensitive' },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: {
          query: true,
          resultCount: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        distinct: ['query']
      });

      return recentSearches.map((search, index) => ({
        id: `recent_${search.query}_${index}`,
        query: search.query,
        type: 'recent' as const,
        display: search.query,
        description: `${search.resultCount || 0} results • Recent search`,
        count: search.resultCount || 0,
        popularity: 95 - index, // High priority for recent searches
        category: 'Recent Searches',
        metadata: {
          lastSearched: search.createdAt,
          resultCount: search.resultCount
        }
      }));
    } catch (error) {
      logger.error('search', 'Failed to get recent searches', { query, userId, error });
      return [];
    }
  }

  /**
   * Get trending search suggestions
   */
  private async getTrendingSuggestions(query: string, limit: number): Promise<SearchSuggestion[]> {
    try {
      // Get trending searches from the last 24 hours
      const trending = await prisma.search.groupBy({
        by: ['query'],
        where: {
          query: { contains: query, mode: 'insensitive' },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: { id: 'desc' }
        },
        take: limit
      });

      return trending.map((trend, index) => ({
        id: `trending_${trend.query}`,
        query: trend.query,
        type: 'trend' as const,
        display: trend.query,
        description: `${trend._count.id} searches today`,
        count: trend._count.id,
        popularity: 80 - index * 2,
        category: 'Trending',
        metadata: {
          searchCount: trend._count.id,
          trendingPeriod: '24h'
        }
      }));
    } catch (error) {
      logger.error('search', 'Failed to get trending suggestions', { query, error });
      return [];
    }
  }

  /**
   * Calculate company popularity score
   */
  private calculateCompanyPopularity(company: any, position: number): number {
    let score = 100 - position * 2; // Base score decreases by position

    // Verification bonus
    if (company.verified) score += 15;

    // Contact count bonus
    if (company._count?.contacts) {
      score += Math.min(company._count.contacts * 0.5, 20);
    }

    // Industry bonus for popular industries
    const popularIndustries = ['TECHNOLOGY', 'FINANCIAL_SERVICES', 'HEALTHCARE_PHARMA'];
    if (company.industry && popularIndustries.includes(company.industry)) {
      score += 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate contact popularity score
   */
  private calculateContactPopularity(contact: any, position: number): number {
    let score = 95 - position * 3; // Base score decreases by position

    // Verification bonus
    if (contact.verified) score += 15;

    // Seniority bonus
    const seniorityScores = {
      'C_LEVEL': 20,
      'SVP': 15,
      'VP': 12,
      'SENIOR_DIRECTOR': 10,
      'DIRECTOR': 8,
      'SENIOR_MANAGER': 6,
      'MANAGER': 4
    };

    if (contact.seniority && seniorityScores[contact.seniority as keyof typeof seniorityScores]) {
      score += seniorityScores[contact.seniority as keyof typeof seniorityScores];
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Clear suggestion cache
   */
  clearCache(): void {
    this.suggestionCache.clear();
    logger.info('search', 'Search suggestion cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.suggestionCache.size,
      keys: Array.from(this.suggestionCache.keys())
    };
  }
}

// Export singleton instance
export const searchSuggestionEngine = SearchSuggestionEngine.getInstance();

// Export utility functions
export const getAutoCompleteSuggestions = (query: string, userId?: string, limit?: number) =>
  searchSuggestionEngine.getAutoCompleteSuggestions(query, userId, limit);