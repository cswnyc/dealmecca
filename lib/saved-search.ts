import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { SearchFilters } from './search-utils';

const prisma = new PrismaClient();

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  description?: string;
  query: string;
  searchType: 'company' | 'contact';
  filters: SearchFilters;
  alertEnabled: boolean;
  alertFrequency: 'instant' | 'daily' | 'weekly' | 'monthly';
  lastResultCount: number;
  lastRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  tags: string[];
  isPublic: boolean;
  shareCode?: string;
}

export interface SearchAlert {
  id: string;
  savedSearchId: string;
  userId: string;
  triggerType: 'new_results' | 'count_change' | 'schedule';
  newResults: number;
  totalResults: number;
  previousResults: number;
  changePercentage: number;
  alertData: any;
  sentAt: Date;
}

export interface SavedSearchStats {
  totalSavedSearches: number;
  activeAlerts: number;
  avgResultsPerSearch: number;
  topCategories: Array<{ category: string; count: number }>;
  recentActivity: Array<{
    searchId: string;
    searchName: string;
    action: string;
    timestamp: Date;
  }>;
}

/**
 * Advanced saved search functionality with alerts and analytics
 */
export class SavedSearchManager {
  private static instance: SavedSearchManager;

  static getInstance(): SavedSearchManager {
    if (!SavedSearchManager.instance) {
      SavedSearchManager.instance = new SavedSearchManager();
    }
    return SavedSearchManager.instance;
  }

  /**
   * Create a new saved search
   */
  async createSavedSearch(data: {
    userId: string;
    name: string;
    description?: string;
    query: string;
    searchType: 'company' | 'contact';
    filters: SearchFilters;
    alertEnabled?: boolean;
    alertFrequency?: 'instant' | 'daily' | 'weekly' | 'monthly';
    tags?: string[];
    isPublic?: boolean;
  }): Promise<SavedSearch> {
    try {
      // Check if user has reached their saved search limit
      const userTier = await this.getUserTier(data.userId);
      const existingCount = await prisma.savedSearch.count({
        where: { userId: data.userId, isActive: true }
      });

      const limits = {
        FREE: 5,
        PRO: 25,
        ENTERPRISE: 100
      };

      if (existingCount >= limits[userTier as keyof typeof limits]) {
        throw new Error(`Saved search limit reached for ${userTier} tier`);
      }

      // Get initial result count
      const initialCount = await this.getSearchResultCount(
        data.query,
        data.filters,
        data.searchType
      );

      // Generate share code if public
      const shareCode = data.isPublic ? this.generateShareCode() : undefined;

      const savedSearch = await prisma.savedSearch.create({
        data: {
          userId: data.userId,
          name: data.name,
          description: data.description,
          query: data.query,
          searchType: data.searchType,
          filters: JSON.stringify(data.filters),
          alertEnabled: data.alertEnabled || false,
          alertFrequency: data.alertFrequency || 'weekly',
          lastResultCount: initialCount,
          lastRunAt: new Date(),
          isActive: true,
          tags: data.tags || [],
          isPublic: data.isPublic || false,
          shareCode
        }
      });

      logger.info('search', 'Saved search created', {
        userId: data.userId,
        searchId: savedSearch.id,
        searchName: data.name,
        initialCount,
        alertEnabled: data.alertEnabled
      });

      return this.formatSavedSearch(savedSearch);
    } catch (error) {
      logger.error('search', 'Failed to create saved search', { 
        userId: data.userId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Get user's saved searches
   */
  async getUserSavedSearches(
    userId: string,
    options: {
      includeInactive?: boolean;
      limit?: number;
      offset?: number;
      sortBy?: 'name' | 'createdAt' | 'lastRunAt' | 'resultCount';
      sortOrder?: 'asc' | 'desc';
      tags?: string[];
    } = {}
  ): Promise<{ searches: SavedSearch[]; total: number }> {
    try {
      const {
        includeInactive = false,
        limit = 50,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        tags
      } = options;

      const where: any = {
        userId,
        ...(includeInactive ? {} : { isActive: true }),
        ...(tags?.length ? { tags: { hasSome: tags } } : {})
      };

      const [searches, total] = await Promise.all([
        prisma.savedSearch.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          take: limit,
          skip: offset
        }),
        prisma.savedSearch.count({ where })
      ]);

      const formattedSearches = searches.map(search => this.formatSavedSearch(search));

      logger.info('search', 'Retrieved user saved searches', {
        userId,
        count: searches.length,
        total,
        includeInactive
      });

      return { searches: formattedSearches, total };
    } catch (error) {
      logger.error('search', 'Failed to get user saved searches', { userId, error });
      throw error;
    }
  }

  /**
   * Update saved search
   */
  async updateSavedSearch(
    searchId: string,
    userId: string,
    updates: Partial<{
      name: string;
      description: string;
      query: string;
      filters: SearchFilters;
      alertEnabled: boolean;
      alertFrequency: 'instant' | 'daily' | 'weekly' | 'monthly';
      tags: string[];
      isPublic: boolean;
    }>
  ): Promise<SavedSearch> {
    try {
      // Verify ownership
      const existingSearch = await prisma.savedSearch.findFirst({
        where: { id: searchId, userId }
      });

      if (!existingSearch) {
        throw new Error('Saved search not found or access denied');
      }

      // Prepare update data
      const updateData: any = {
        ...updates,
        updatedAt: new Date()
      };

      if (updates.filters) {
        updateData.filters = JSON.stringify(updates.filters);
      }

      // If query or filters changed, update result count
      if (updates.query || updates.filters) {
        const newCount = await this.getSearchResultCount(
          updates.query || existingSearch.query,
          updates.filters || JSON.parse(existingSearch.filters),
          existingSearch.searchType
        );
        updateData.lastResultCount = newCount;
        updateData.lastRunAt = new Date();
      }

      // Generate/remove share code based on public status
      if (updates.isPublic !== undefined) {
        updateData.shareCode = updates.isPublic ? 
          (existingSearch.shareCode || this.generateShareCode()) : 
          null;
      }

      const updatedSearch = await prisma.savedSearch.update({
        where: { id: searchId },
        data: updateData
      });

      logger.info('search', 'Saved search updated', {
        userId,
        searchId,
        updatedFields: Object.keys(updates)
      });

      return this.formatSavedSearch(updatedSearch);
    } catch (error) {
      logger.error('search', 'Failed to update saved search', { 
        searchId, 
        userId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(searchId: string, userId: string): Promise<void> {
    try {
      const result = await prisma.savedSearch.updateMany({
        where: { id: searchId, userId },
        data: { isActive: false, updatedAt: new Date() }
      });

      if (result.count === 0) {
        throw new Error('Saved search not found or access denied');
      }

      logger.info('search', 'Saved search deleted', { userId, searchId });
    } catch (error) {
      logger.error('search', 'Failed to delete saved search', { 
        searchId, 
        userId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Run saved search and check for alerts
   */
  async runSavedSearch(searchId: string): Promise<{
    results: any[];
    newResultCount: number;
    alertTriggered: boolean;
    changePercentage: number;
  }> {
    try {
      const savedSearch = await prisma.savedSearch.findUnique({
        where: { id: searchId }
      });

      if (!savedSearch || !savedSearch.isActive) {
        throw new Error('Saved search not found or inactive');
      }

      const filters = JSON.parse(savedSearch.filters);
      const currentCount = await this.getSearchResultCount(
        savedSearch.query,
        filters,
        savedSearch.searchType
      );

      const previousCount = savedSearch.lastResultCount;
      const changePercentage = previousCount > 0 
        ? Math.round(((currentCount - previousCount) / previousCount) * 100)
        : 100;

      // Update the saved search with new data
      await prisma.savedSearch.update({
        where: { id: searchId },
        data: {
          lastResultCount: currentCount,
          lastRunAt: new Date()
        }
      });

      // Check if alert should be triggered
      let alertTriggered = false;
      if (savedSearch.alertEnabled && this.shouldTriggerAlert(savedSearch, currentCount, previousCount)) {
        await this.createAlert(savedSearch, currentCount, previousCount, changePercentage);
        alertTriggered = true;
      }

      // Get actual results (limited for performance)
      const results = await this.getSearchResults(
        savedSearch.query,
        filters,
        savedSearch.searchType,
        20 // Limit to 20 for preview
      );

      logger.info('search', 'Saved search executed', {
        searchId,
        currentCount,
        previousCount,
        changePercentage,
        alertTriggered
      });

      return {
        results,
        newResultCount: currentCount,
        alertTriggered,
        changePercentage
      };
    } catch (error) {
      logger.error('search', 'Failed to run saved search', { searchId, error });
      throw error;
    }
  }

  /**
   * Get public saved search by share code
   */
  async getPublicSavedSearch(shareCode: string): Promise<SavedSearch | null> {
    try {
      const savedSearch = await prisma.savedSearch.findFirst({
        where: { shareCode, isPublic: true, isActive: true }
      });

      if (!savedSearch) {
        return null;
      }

      return this.formatSavedSearch(savedSearch);
    } catch (error) {
      logger.error('search', 'Failed to get public saved search', { shareCode, error });
      throw error;
    }
  }

  /**
   * Get saved search statistics for user
   */
  async getUserSavedSearchStats(userId: string): Promise<SavedSearchStats> {
    try {
      const [
        totalSavedSearches,
        activeAlerts,
        searches,
        recentAlerts
      ] = await Promise.all([
        prisma.savedSearch.count({
          where: { userId, isActive: true }
        }),
        prisma.savedSearch.count({
          where: { userId, isActive: true, alertEnabled: true }
        }),
        prisma.savedSearch.findMany({
          where: { userId, isActive: true },
          select: { 
            id: true, 
            name: true, 
            lastResultCount: true, 
            searchType: true,
            tags: true,
            lastRunAt: true
          }
        }),
        prisma.searchAlert.findMany({
          where: { 
            userId,
            sentAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          },
          orderBy: { sentAt: 'desc' },
          take: 10
        })
      ]);

      const avgResultsPerSearch = searches.length > 0
        ? Math.round(searches.reduce((sum, s) => sum + s.lastResultCount, 0) / searches.length)
        : 0;

      // Calculate top categories (based on tags and search types)
      const categoryCount = new Map<string, number>();
      searches.forEach(search => {
        // Count search types
        const currentCount = categoryCount.get(search.searchType) || 0;
        categoryCount.set(search.searchType, currentCount + 1);
        
        // Count tags
        search.tags.forEach(tag => {
          const tagCount = categoryCount.get(tag) || 0;
          categoryCount.set(tag, tagCount + 1);
        });
      });

      const topCategories = Array.from(categoryCount.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Format recent activity
      const recentActivity = searches
        .filter(s => s.lastRunAt)
        .sort((a, b) => b.lastRunAt!.getTime() - a.lastRunAt!.getTime())
        .slice(0, 10)
        .map(search => ({
          searchId: search.id,
          searchName: search.name,
          action: 'executed',
          timestamp: search.lastRunAt!
        }));

      return {
        totalSavedSearches,
        activeAlerts,
        avgResultsPerSearch,
        topCategories,
        recentActivity
      };
    } catch (error) {
      logger.error('search', 'Failed to get saved search stats', { userId, error });
      throw error;
    }
  }

  /**
   * Process scheduled alerts (called by cron job)
   */
  async processScheduledAlerts(frequency: 'daily' | 'weekly' | 'monthly'): Promise<number> {
    try {
      const savedSearches = await prisma.savedSearch.findMany({
        where: {
          isActive: true,
          alertEnabled: true,
          alertFrequency: frequency
        }
      });

      let alertsProcessed = 0;

      for (const savedSearch of savedSearches) {
        try {
          await this.runSavedSearch(savedSearch.id);
          alertsProcessed++;
        } catch (error) {
          logger.error('search', 'Failed to process scheduled alert', {
            searchId: savedSearch.id,
            error
          });
        }
      }

      logger.info('search', 'Scheduled alerts processed', {
        frequency,
        totalSearches: savedSearches.length,
        alertsProcessed
      });

      return alertsProcessed;
    } catch (error) {
      logger.error('search', 'Failed to process scheduled alerts', { frequency, error });
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private async getUserTier(userId: string): Promise<string> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true }
      });
      return user?.tier || 'FREE';
    } catch {
      return 'FREE';
    }
  }

  private async getSearchResultCount(
    query: string,
    filters: SearchFilters,
    searchType: 'company' | 'contact'
  ): Promise<number> {
    try {
      const where = this.buildSearchWhere(query, filters, searchType);
      
      if (searchType === 'company') {
        return await prisma.company.count({ where });
      } else {
        return await prisma.contact.count({ where });
      }
    } catch (error) {
      logger.error('search', 'Failed to get search result count', { error });
      return 0;
    }
  }

  private async getSearchResults(
    query: string,
    filters: SearchFilters,
    searchType: 'company' | 'contact',
    limit: number = 20
  ): Promise<any[]> {
    try {
      const where = this.buildSearchWhere(query, filters, searchType);
      
      if (searchType === 'company') {
        return await prisma.company.findMany({
          where,
          select: {
            id: true,
            name: true,
            companyType: true,
            city: true,
            state: true,
            verified: true
          },
          take: limit
        });
      } else {
        return await prisma.contact.findMany({
          where,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            seniority: true,
            verified: true,
            company: {
              select: { name: true }
            }
          },
          take: limit
        });
      }
    } catch (error) {
      logger.error('search', 'Failed to get search results', { error });
      return [];
    }
  }

  private buildSearchWhere(
    query: string,
    filters: SearchFilters,
    searchType: 'company' | 'contact'
  ): any {
    const where: any = { AND: [] };

    // Add text search
    if (query && query.length >= 2) {
      if (searchType === 'company') {
        where.AND.push({
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        });
      } else {
        where.AND.push({
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { title: { contains: query, mode: 'insensitive' } }
          ]
        });
      }
    }

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && Array.isArray(value) && value.length > 0) {
        where.AND.push({ [key]: { in: value } });
      } else if (typeof value === 'boolean') {
        where.AND.push({ [key]: value });
      }
    });

    // Add active filter
    where.AND.push({ isActive: true });

    return where;
  }

  private shouldTriggerAlert(
    savedSearch: any,
    currentCount: number,
    previousCount: number
  ): boolean {
    // Only trigger alerts for significant changes
    const changePercentage = previousCount > 0 
      ? Math.abs((currentCount - previousCount) / previousCount) * 100
      : 100;

    // Trigger if:
    // 1. Results increased by more than 20%
    // 2. Results decreased by more than 50%
    // 3. New results found when there were none before
    return changePercentage > 20 || (previousCount === 0 && currentCount > 0);
  }

  private async createAlert(
    savedSearch: any,
    currentCount: number,
    previousCount: number,
    changePercentage: number
  ): Promise<void> {
    try {
      await prisma.searchAlert.create({
        data: {
          savedSearchId: savedSearch.id,
          userId: savedSearch.userId,
          triggerType: currentCount > previousCount ? 'new_results' : 'count_change',
          newResults: Math.max(0, currentCount - previousCount),
          totalResults: currentCount,
          previousResults: previousCount,
          changePercentage,
          alertData: {
            searchName: savedSearch.name,
            searchQuery: savedSearch.query,
            searchType: savedSearch.searchType
          },
          sentAt: new Date()
        }
      });

      logger.info('search', 'Search alert created', {
        searchId: savedSearch.id,
        userId: savedSearch.userId,
        changePercentage
      });
    } catch (error) {
      logger.error('search', 'Failed to create search alert', { error });
    }
  }

  private formatSavedSearch(dbSearch: any): SavedSearch {
    return {
      id: dbSearch.id,
      userId: dbSearch.userId,
      name: dbSearch.name,
      description: dbSearch.description,
      query: dbSearch.query,
      searchType: dbSearch.searchType,
      filters: JSON.parse(dbSearch.filters),
      alertEnabled: dbSearch.alertEnabled,
      alertFrequency: dbSearch.alertFrequency,
      lastResultCount: dbSearch.lastResultCount,
      lastRunAt: dbSearch.lastRunAt,
      createdAt: dbSearch.createdAt,
      updatedAt: dbSearch.updatedAt,
      isActive: dbSearch.isActive,
      tags: dbSearch.tags || [],
      isPublic: dbSearch.isPublic,
      shareCode: dbSearch.shareCode
    };
  }

  private generateShareCode(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

// Export singleton instance
export const savedSearchManager = SavedSearchManager.getInstance();