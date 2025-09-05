import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

export interface SearchShortcut {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'industry' | 'role' | 'location' | 'company_type' | 'trending';
  filters: Record<string, any>;
  count?: number;
  trending?: boolean;
  popularity: number;
}

export interface DynamicFilter {
  key: string;
  name: string;
  type: 'select' | 'multiselect' | 'range' | 'toggle';
  options: Array<{
    value: string;
    label: string;
    count: number;
    percentage: number;
  }>;
  defaultValue?: any;
  group?: string;
}

/**
 * Advanced search shortcuts and dynamic filters
 */
export class SearchShortcutEngine {
  private static instance: SearchShortcutEngine;
  private shortcutsCache = new Map<string, { data: SearchShortcut[]; timestamp: number }>();
  private filtersCache = new Map<string, { data: DynamicFilter[]; timestamp: number }>();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  static getInstance(): SearchShortcutEngine {
    if (!SearchShortcutEngine.instance) {
      SearchShortcutEngine.instance = new SearchShortcutEngine();
    }
    return SearchShortcutEngine.instance;
  }

  /**
   * Get industry-specific search shortcuts
   */
  async getIndustryShortcuts(): Promise<SearchShortcut[]> {
    const cacheKey = 'industry_shortcuts';
    const cached = this.shortcutsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const shortcuts = await this.generateIndustryShortcuts();
      this.shortcutsCache.set(cacheKey, { data: shortcuts, timestamp: Date.now() });
      return shortcuts;
    } catch (error) {
      logger.error('search', 'Failed to get industry shortcuts', { error });
      return this.getDefaultIndustryShortcuts();
    }
  }

  /**
   * Get recently searched filters for quick access
   */
  async getRecentlySearchedFilters(userId: string): Promise<SearchShortcut[]> {
    try {
      const recentSearches = await prisma.search.findMany({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        select: { searchFilters: true, query: true, resultCount: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      // Extract and count filter combinations
      const filterCombinations = new Map<string, {
        filters: Record<string, any>;
        count: number;
        avgResults: number;
        lastUsed: Date;
      }>();

      recentSearches.forEach(search => {
        if (search.searchFilters) {
          const filterKey = JSON.stringify(search.searchFilters);
          const existing = filterCombinations.get(filterKey);
          
          if (existing) {
            existing.count++;
            existing.avgResults = (existing.avgResults + (search.resultCount || 0)) / 2;
            if (search.createdAt > existing.lastUsed) {
              existing.lastUsed = search.createdAt;
            }
          } else {
            filterCombinations.set(filterKey, {
              filters: search.searchFilters as any,
              count: 1,
              avgResults: search.resultCount || 0,
              lastUsed: search.createdAt
            });
          }
        }
      });

      // Convert to shortcuts
      const shortcuts: SearchShortcut[] = [];
      let shortcutId = 1;

      for (const [filterKey, data] of filterCombinations.entries()) {
        if (data.count > 1) { // Only include filters used more than once
          const shortcut: SearchShortcut = {
            id: `recent_${shortcutId++}`,
            name: this.generateShortcutName(data.filters),
            description: `Used ${data.count} times, avg ${data.avgResults} results`,
            icon: '🕒',
            category: 'trending',
            filters: data.filters,
            count: data.avgResults,
            trending: data.count > 3,
            popularity: data.count * 10 + (Date.now() - data.lastUsed.getTime()) / (1000 * 60 * 60) // Recency bonus
          };
          shortcuts.push(shortcut);
        }
      }

      return shortcuts.sort((a, b) => b.popularity - a.popularity).slice(0, 8);
    } catch (error) {
      logger.error('search', 'Failed to get recent filters', { userId, error });
      return [];
    }
  }

  /**
   * Get dynamic filters based on actual data
   */
  async getDynamicFilters(searchQuery?: string, appliedFilters: Record<string, any> = {}): Promise<DynamicFilter[]> {
    const cacheKey = `dynamic_filters_${searchQuery || 'all'}_${JSON.stringify(appliedFilters)}`;
    const cached = this.filtersCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const filters = await this.generateDynamicFilters(searchQuery, appliedFilters);
      this.filtersCache.set(cacheKey, { data: filters, timestamp: Date.now() });
      return filters;
    } catch (error) {
      logger.error('search', 'Failed to get dynamic filters', { error });
      return [];
    }
  }

  /**
   * Get location-based filtering improvements
   */
  async getLocationBasedFilters(userLocation?: { city: string; state: string }): Promise<SearchShortcut[]> {
    try {
      const shortcuts: SearchShortcut[] = [];

      if (userLocation) {
        // Same city
        const sameCityCount = await prisma.company.count({
          where: { 
            city: userLocation.city, 
            state: userLocation.state,
            isActive: true
          }
        });

        if (sameCityCount > 0) {
          shortcuts.push({
            id: 'same_city',
            name: `${userLocation.city} Companies`,
            description: `${sameCityCount} companies in your city`,
            icon: '🏢',
            category: 'location',
            filters: { city: [userLocation.city] },
            count: sameCityCount,
            popularity: 100
          });
        }

        // Same state
        const sameStateCount = await prisma.company.count({
          where: { 
            state: userLocation.state,
            city: { not: userLocation.city },
            isActive: true
          }
        });

        if (sameStateCount > 0) {
          shortcuts.push({
            id: 'same_state',
            name: `${userLocation.state} (Other Cities)`,
            description: `${sameStateCount} companies in ${userLocation.state}`,
            icon: '🗺️',
            category: 'location',
            filters: { 
              state: [userLocation.state],
              city: { not: userLocation.city }
            },
            count: sameStateCount,
            popularity: 80
          });
        }
      }

      // Top business hubs
      const businessHubs = [
        { city: 'New York', state: 'NY', icon: '🏙️' },
        { city: 'San Francisco', state: 'CA', icon: '🌉' },
        { city: 'Los Angeles', state: 'CA', icon: '🌴' },
        { city: 'Chicago', state: 'IL', icon: '🌆' },
        { city: 'Austin', state: 'TX', icon: '🎸' }
      ];

      for (const hub of businessHubs) {
        if (userLocation?.city === hub.city) continue; // Skip user's current city

        const count = await prisma.company.count({
          where: { city: hub.city, state: hub.state, isActive: true }
        });

        if (count > 0) {
          shortcuts.push({
            id: `hub_${hub.city.toLowerCase()}`,
            name: `${hub.city} Hub`,
            description: `${count} companies in ${hub.city}`,
            icon: hub.icon,
            category: 'location',
            filters: { city: [hub.city] },
            count,
            popularity: 60
          });
        }
      }

      return shortcuts.sort((a, b) => b.popularity - a.popularity);
    } catch (error) {
      logger.error('search', 'Failed to get location-based filters', { error });
      return [];
    }
  }

  /**
   * Private helper methods
   */
  private async generateIndustryShortcuts(): Promise<SearchShortcut[]> {
    // Get industry counts
    const industries = await prisma.company.groupBy({
      by: ['industry'],
      where: { isActive: true },
      _count: { industry: true },
      orderBy: { _count: { industry: 'desc' } },
      take: 20
    });

    const shortcuts: SearchShortcut[] = [];

    const industryIcons: Record<string, string> = {
      'TECHNOLOGY': '💻',
      'FINANCIAL_SERVICES': '💰',
      'HEALTHCARE_PHARMA': '🏥',
      'RETAIL_ECOMMERCE': '🛍️',
      'ENTERTAINMENT_MEDIA': '🎬',
      'AUTOMOTIVE': '🚗',
      'TELECOM': '📱',
      'ENERGY': '⚡',
      'REAL_ESTATE': '🏠',
      'FASHION_BEAUTY': '👗'
    };

    industries.forEach((industry, index) => {
      if (industry.industry) {
        shortcuts.push({
          id: `industry_${industry.industry.toLowerCase()}`,
          name: this.formatIndustryName(industry.industry),
          description: `${industry._count.industry} companies in ${this.formatIndustryName(industry.industry)}`,
          icon: industryIcons[industry.industry] || '🏢',
          category: 'industry',
          filters: { industry: [industry.industry] },
          count: industry._count.industry,
          popularity: 100 - index * 2
        });
      }
    });

    // Add specialized industry shortcuts
    const specializedShortcuts: SearchShortcut[] = [
      {
        id: 'tech_startups',
        name: 'Tech Startups',
        description: 'Early-stage technology companies',
        icon: '🚀',
        category: 'industry',
        filters: { 
          industry: ['TECHNOLOGY'], 
          employeeCount: ['STARTUP_1_10', 'SMALL_11_50'] 
        },
        popularity: 95
      },
      {
        id: 'saas_companies',
        name: 'SaaS Companies',
        description: 'Software as a Service businesses',
        icon: '☁️',
        category: 'industry',
        filters: { 
          industry: ['TECHNOLOGY'],
          companyType: ['TECH_VENDOR']
        },
        popularity: 90
      },
      {
        id: 'media_agencies',
        name: 'Media Agencies',
        description: 'Advertising and media agencies',
        icon: '📺',
        category: 'industry',
        filters: { 
          companyType: ['AGENCY', 'INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY']
        },
        popularity: 85
      }
    ];

    return [...shortcuts, ...specializedShortcuts]
      .sort((a, b) => b.popularity - a.popularity);
  }

  private async generateDynamicFilters(
    searchQuery?: string, 
    appliedFilters: Record<string, any> = {}
  ): Promise<DynamicFilter[]> {
    // Base where clause considering applied filters
    const baseWhere = this.buildBaseWhere(searchQuery, appliedFilters);
    
    const filters: DynamicFilter[] = [];

    // Industry filter
    if (!appliedFilters.industry) {
      const industries = await prisma.company.groupBy({
        by: ['industry'],
        where: { ...baseWhere, industry: { not: null } },
        _count: { industry: true },
        orderBy: { _count: { industry: 'desc' } },
        take: 15
      });

      const totalCompanies = industries.reduce((sum, i) => sum + i._count.industry, 0);

      filters.push({
        key: 'industry',
        name: 'Industry',
        type: 'multiselect',
        group: 'Company Info',
        options: industries.map(i => ({
          value: i.industry!,
          label: this.formatIndustryName(i.industry!),
          count: i._count.industry,
          percentage: Math.round((i._count.industry / totalCompanies) * 100)
        }))
      });
    }

    // Company type filter
    if (!appliedFilters.companyType) {
      const companyTypes = await prisma.company.groupBy({
        by: ['companyType'],
        where: { ...baseWhere, companyType: { not: null } },
        _count: { companyType: true },
        orderBy: { _count: { companyType: 'desc' } }
      });

      const totalTypes = companyTypes.reduce((sum, ct) => sum + ct._count.companyType, 0);

      filters.push({
        key: 'companyType',
        name: 'Company Type',
        type: 'multiselect',
        group: 'Company Info',
        options: companyTypes.map(ct => ({
          value: ct.companyType!,
          label: this.formatCompanyType(ct.companyType!),
          count: ct._count.companyType,
          percentage: Math.round((ct._count.companyType / totalTypes) * 100)
        }))
      });
    }

    // Location filter (top 20 locations)
    if (!appliedFilters.location) {
      const locations = await prisma.company.groupBy({
        by: ['city', 'state'],
        where: { 
          ...baseWhere, 
          city: { not: null }, 
          state: { not: null } 
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20
      });

      const totalLocations = locations.reduce((sum, l) => sum + l._count.id, 0);

      filters.push({
        key: 'location',
        name: 'Location',
        type: 'multiselect',
        group: 'Geographic',
        options: locations.map(l => ({
          value: `${l.city}, ${l.state}`,
          label: `${l.city}, ${l.state}`,
          count: l._count.id,
          percentage: Math.round((l._count.id / totalLocations) * 100)
        }))
      });
    }

    // Employee count filter
    if (!appliedFilters.employeeCount) {
      const employeeCounts = await prisma.company.groupBy({
        by: ['employeeCount'],
        where: { ...baseWhere, employeeCount: { not: null } },
        _count: { employeeCount: true },
        orderBy: { _count: { employeeCount: 'desc' } }
      });

      const totalEmployeeCounts = employeeCounts.reduce((sum, ec) => sum + ec._count.employeeCount, 0);

      const employeeOrder = [
        'STARTUP_1_10', 'SMALL_11_50', 'MEDIUM_51_200', 'LARGE_201_1000',
        'ENTERPRISE_1001_5000', 'MEGA_5000_PLUS'
      ];

      filters.push({
        key: 'employeeCount',
        name: 'Company Size',
        type: 'multiselect',
        group: 'Company Info',
        options: employeeCounts
          .sort((a, b) => {
            const aIndex = employeeOrder.indexOf(a.employeeCount!);
            const bIndex = employeeOrder.indexOf(b.employeeCount!);
            return aIndex - bIndex;
          })
          .map(ec => ({
            value: ec.employeeCount!,
            label: this.formatEmployeeCount(ec.employeeCount!),
            count: ec._count.employeeCount,
            percentage: Math.round((ec._count.employeeCount / totalEmployeeCounts) * 100)
          }))
      });
    }

    // Verification filter
    filters.push({
      key: 'verified',
      name: 'Verification Status',
      type: 'toggle',
      group: 'Data Quality',
      options: [
        { value: 'true', label: 'Verified Only', count: 0, percentage: 0 }
      ]
    });

    return filters;
  }

  private buildBaseWhere(searchQuery?: string, appliedFilters: Record<string, any> = {}): any {
    const where: any = { AND: [{ isActive: true }] };

    if (searchQuery && searchQuery.length >= 2) {
      where.AND.push({
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } }
        ]
      });
    }

    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value && Array.isArray(value) && value.length > 0) {
        where.AND.push({ [key]: { in: value } });
      } else if (typeof value === 'boolean') {
        where.AND.push({ [key]: value });
      }
    });

    return where;
  }

  private generateShortcutName(filters: Record<string, any>): string {
    const parts: string[] = [];
    
    if (filters.industry) {
      parts.push(filters.industry.map((i: string) => this.formatIndustryName(i)).join(' + '));
    }
    
    if (filters.city) {
      parts.push(Array.isArray(filters.city) ? filters.city.join(', ') : filters.city);
    }
    
    if (filters.companyType) {
      parts.push(filters.companyType.map((ct: string) => this.formatCompanyType(ct)).join(' + '));
    }
    
    return parts.join(' in ') || 'Custom Filter';
  }

  private formatIndustryName(industry: string): string {
    return industry.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private formatCompanyType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private formatEmployeeCount(count: string): string {
    const map: Record<string, string> = {
      'STARTUP_1_10': '1-10 employees',
      'SMALL_11_50': '11-50 employees',
      'MEDIUM_51_200': '51-200 employees',
      'LARGE_201_1000': '201-1,000 employees',
      'ENTERPRISE_1001_5000': '1,001-5,000 employees',
      'MEGA_5000_PLUS': '5,000+ employees'
    };
    return map[count] || count;
  }

  private getDefaultIndustryShortcuts(): SearchShortcut[] {
    return [
      {
        id: 'tech',
        name: 'Technology',
        description: 'Software, hardware, and tech services',
        icon: '💻',
        category: 'industry',
        filters: { industry: ['TECHNOLOGY'] },
        popularity: 100
      },
      {
        id: 'healthcare',
        name: 'Healthcare',
        description: 'Medical, pharmaceutical, and health services',
        icon: '🏥',
        category: 'industry',
        filters: { industry: ['HEALTHCARE_PHARMA'] },
        popularity: 90
      },
      {
        id: 'finance',
        name: 'Financial Services',
        description: 'Banking, insurance, and financial technology',
        icon: '💰',
        category: 'industry',
        filters: { industry: ['FINANCIAL_SERVICES'] },
        popularity: 85
      }
    ];
  }

  /**
   * Clear caches
   */
  clearCaches(): void {
    this.shortcutsCache.clear();
    this.filtersCache.clear();
    logger.info('search', 'Search shortcuts caches cleared');
  }
}

// Export singleton instance
export const searchShortcutEngine = SearchShortcutEngine.getInstance();