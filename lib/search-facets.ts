import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { SearchFilters } from './search-utils';

const prisma = new PrismaClient();

export interface FacetOption {
  value: string;
  label: string;
  count: number;
  percentage: number;
  selected?: boolean;
}

export interface SearchFacet {
  key: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range' | 'date' | 'location';
  options: FacetOption[];
  hasMore?: boolean;
  expandable?: boolean;
  icon?: string;
  description?: string;
}

export interface FacetedSearchResponse {
  facets: SearchFacet[];
  appliedFilters: Record<string, any>;
  totalResults: number;
  facetQueryTime: number;
  recommendations: {
    suggestedFilters: FacetOption[];
    popularCombinations: Array<{
      filters: Record<string, any>;
      label: string;
      count: number;
    }>;
  };
}

/**
 * Advanced faceted search with real-time data counts
 */
export class SearchFacetEngine {
  private static instance: SearchFacetEngine;
  private facetCache = new Map<string, { data: FacetedSearchResponse; timestamp: number }>();
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes for real-time counts

  static getInstance(): SearchFacetEngine {
    if (!SearchFacetEngine.instance) {
      SearchFacetEngine.instance = new SearchFacetEngine();
    }
    return SearchFacetEngine.instance;
  }

  /**
   * Get faceted search data with real counts
   */
  async getFacetedSearchData(
    searchTerm: string = '',
    appliedFilters: SearchFilters = {},
    searchType: 'company' | 'contact' = 'company'
  ): Promise<FacetedSearchResponse> {
    const startTime = Date.now();
    const cacheKey = `${searchType}_${searchTerm}_${JSON.stringify(appliedFilters)}`;

    // Check cache
    const cached = this.facetCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      logger.info('search', 'Faceted search data served from cache', { cached: true });
      return cached.data;
    }

    try {
      const [facets, totalResults, recommendations] = await Promise.all([
        this.buildFacets(searchTerm, appliedFilters, searchType),
        this.getTotalResultCount(searchTerm, appliedFilters, searchType),
        this.generateRecommendations(searchTerm, appliedFilters, searchType)
      ]);

      const response: FacetedSearchResponse = {
        facets,
        appliedFilters,
        totalResults,
        facetQueryTime: Date.now() - startTime,
        recommendations
      };

      // Cache response
      this.facetCache.set(cacheKey, { data: response, timestamp: Date.now() });

      logger.info('search', 'Faceted search data generated', {
        searchType,
        searchTerm: searchTerm || '(empty)',
        totalResults,
        facetCount: facets.length,
        queryTime: response.facetQueryTime
      });

      return response;
    } catch (error) {
      logger.error('search', 'Failed to generate faceted search data', { error });
      throw error;
    }
  }

  /**
   * Build all facets based on search type
   */
  private async buildFacets(
    searchTerm: string,
    appliedFilters: SearchFilters,
    searchType: 'company' | 'contact'
  ): Promise<SearchFacet[]> {
    if (searchType === 'company') {
      return Promise.all([
        this.buildCompanyTypeFacet(searchTerm, appliedFilters),
        this.buildIndustryFacet(searchTerm, appliedFilters),
        this.buildLocationFacet(searchTerm, appliedFilters, 'company'),
        this.buildEmployeeCountFacet(searchTerm, appliedFilters),
        this.buildRevenueRangeFacet(searchTerm, appliedFilters),
        this.buildVerificationFacet(searchTerm, appliedFilters, 'company'),
        this.buildFoundedYearFacet(searchTerm, appliedFilters),
        this.buildActivityFacet(searchTerm, appliedFilters)
      ]);
    } else {
      return Promise.all([
        this.buildSeniorityFacet(searchTerm, appliedFilters),
        this.buildDepartmentFacet(searchTerm, appliedFilters),
        this.buildLocationFacet(searchTerm, appliedFilters, 'contact'),
        this.buildCompanyTypeFacet(searchTerm, appliedFilters, true), // For contacts' companies
        this.buildVerificationFacet(searchTerm, appliedFilters, 'contact'),
        this.buildTitleFacet(searchTerm, appliedFilters)
      ]);
    }
  }

  /**
   * Build company type facet
   */
  private async buildCompanyTypeFacet(
    searchTerm: string,
    appliedFilters: SearchFilters,
    forContacts: boolean = false
  ): Promise<SearchFacet> {
    try {
      const baseWhere = this.buildBaseWhereClause(searchTerm, appliedFilters, forContacts ? 'contact' : 'company');
      
      const companyTypes = await prisma.company.groupBy({
        by: ['companyType'],
        where: forContacts ? {
          contacts: { some: baseWhere }
        } : baseWhere,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      });

      const totalCompanies = companyTypes.reduce((sum, type) => sum + type._count.id, 0);

      const options: FacetOption[] = companyTypes
        .filter(type => type.companyType) // Filter out null values
        .map(type => ({
          value: type.companyType!,
          label: this.formatCompanyType(type.companyType!),
          count: type._count.id,
          percentage: Math.round((type._count.id / totalCompanies) * 100),
          selected: appliedFilters.companyType?.includes(type.companyType!)
        }));

      return {
        key: 'companyType',
        name: 'Company Type',
        type: 'checkbox',
        options: options.slice(0, 15), // Limit to top 15
        hasMore: options.length > 15,
        expandable: true,
        icon: 'building',
        description: 'Filter by type of organization'
      };
    } catch (error) {
      logger.error('search', 'Failed to build company type facet', { error });
      return this.getEmptyFacet('companyType', 'Company Type');
    }
  }

  /**
   * Build industry facet
   */
  private async buildIndustryFacet(
    searchTerm: string,
    appliedFilters: SearchFilters
  ): Promise<SearchFacet> {
    try {
      const baseWhere = this.buildBaseWhereClause(searchTerm, appliedFilters, 'company');
      
      const industries = await prisma.company.groupBy({
        by: ['industry'],
        where: baseWhere,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      });

      const totalCompanies = industries.reduce((sum, industry) => sum + industry._count.id, 0);

      const options: FacetOption[] = industries
        .filter(industry => industry.industry)
        .map(industry => ({
          value: industry.industry!,
          label: this.formatIndustry(industry.industry!),
          count: industry._count.id,
          percentage: Math.round((industry._count.id / totalCompanies) * 100),
          selected: appliedFilters.industry?.includes(industry.industry!)
        }));

      return {
        key: 'industry',
        name: 'Industry',
        type: 'checkbox',
        options: options.slice(0, 20),
        hasMore: options.length > 20,
        expandable: true,
        icon: 'briefcase',
        description: 'Filter by industry sector'
      };
    } catch (error) {
      logger.error('search', 'Failed to build industry facet', { error });
      return this.getEmptyFacet('industry', 'Industry');
    }
  }

  /**
   * Build location facet
   */
  private async buildLocationFacet(
    searchTerm: string,
    appliedFilters: SearchFilters,
    searchType: 'company' | 'contact'
  ): Promise<SearchFacet> {
    try {
      let locations;
      
      if (searchType === 'company') {
        const baseWhere = this.buildBaseWhereClause(searchTerm, appliedFilters, 'company');
        
        locations = await prisma.company.groupBy({
          by: ['city', 'state'],
          where: baseWhere,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } }
        });
      } else {
        const baseWhere = this.buildBaseWhereClause(searchTerm, appliedFilters, 'contact');
        
        locations = await prisma.$queryRaw`
          SELECT c.city, c.state, COUNT(DISTINCT ct.id) as count
          FROM "Company" c
          JOIN "Contact" ct ON ct."companyId" = c.id
          WHERE ${this.buildRawWhereClause(baseWhere)}
          GROUP BY c.city, c.state
          ORDER BY count DESC
          LIMIT 30
        ` as Array<{ city: string; state: string; count: bigint }>;
      }

      const totalCount = searchType === 'company' 
        ? (locations as any[]).reduce((sum: number, loc: any) => sum + loc._count.id, 0)
        : (locations as any[]).reduce((sum: number, loc: any) => sum + Number(loc.count), 0);

      const options: FacetOption[] = (locations as any[])
        .filter((loc: any) => loc.city && loc.state)
        .map((loc: any) => {
          const count = searchType === 'company' ? loc._count.id : Number(loc.count);
          const locationKey = `${loc.city}, ${loc.state}`;
          
          return {
            value: locationKey,
            label: locationKey,
            count,
            percentage: Math.round((count / totalCount) * 100),
            selected: appliedFilters.location?.includes(locationKey)
          };
        });

      return {
        key: 'location',
        name: 'Location',
        type: 'checkbox',
        options: options.slice(0, 25),
        hasMore: options.length > 25,
        expandable: true,
        icon: 'map-pin',
        description: 'Filter by geographic location'
      };
    } catch (error) {
      logger.error('search', 'Failed to build location facet', { error });
      return this.getEmptyFacet('location', 'Location');
    }
  }

  /**
   * Build seniority facet for contacts
   */
  private async buildSeniorityFacet(
    searchTerm: string,
    appliedFilters: SearchFilters
  ): Promise<SearchFacet> {
    try {
      const baseWhere = this.buildBaseWhereClause(searchTerm, appliedFilters, 'contact');
      
      const seniorities = await prisma.contact.groupBy({
        by: ['seniority'],
        where: baseWhere,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      });

      const totalContacts = seniorities.reduce((sum, sen) => sum + sen._count.id, 0);

      const seniorityOrder = [
        'C_LEVEL', 'FOUNDER_OWNER', 'EVP', 'SVP', 'VP', 'SENIOR_DIRECTOR', 
        'DIRECTOR', 'SENIOR_MANAGER', 'MANAGER', 'SENIOR_SPECIALIST', 
        'SPECIALIST', 'COORDINATOR', 'INTERN'
      ];

      const options: FacetOption[] = seniorities
        .filter(sen => sen.seniority)
        .sort((a, b) => {
          const aIndex = seniorityOrder.indexOf(a.seniority!);
          const bIndex = seniorityOrder.indexOf(b.seniority!);
          return aIndex - bIndex;
        })
        .map(sen => ({
          value: sen.seniority!,
          label: this.formatSeniority(sen.seniority!),
          count: sen._count.id,
          percentage: Math.round((sen._count.id / totalContacts) * 100),
          selected: appliedFilters.seniority?.includes(sen.seniority!)
        }));

      return {
        key: 'seniority',
        name: 'Seniority Level',
        type: 'checkbox',
        options,
        expandable: false,
        icon: 'trending-up',
        description: 'Filter by job seniority level'
      };
    } catch (error) {
      logger.error('search', 'Failed to build seniority facet', { error });
      return this.getEmptyFacet('seniority', 'Seniority Level');
    }
  }

  /**
   * Build department facet for contacts
   */
  private async buildDepartmentFacet(
    searchTerm: string,
    appliedFilters: SearchFilters
  ): Promise<SearchFacet> {
    try {
      const baseWhere = this.buildBaseWhereClause(searchTerm, appliedFilters, 'contact');
      
      const departments = await prisma.contact.groupBy({
        by: ['department'],
        where: baseWhere,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      });

      const totalContacts = departments.reduce((sum, dept) => sum + dept._count.id, 0);

      const options: FacetOption[] = departments
        .filter(dept => dept.department)
        .map(dept => ({
          value: dept.department!,
          label: this.formatDepartment(dept.department!),
          count: dept._count.id,
          percentage: Math.round((dept._count.id / totalContacts) * 100),
          selected: appliedFilters.department?.includes(dept.department!)
        }));

      return {
        key: 'department',
        name: 'Department',
        type: 'checkbox',
        options: options.slice(0, 15),
        hasMore: options.length > 15,
        expandable: true,
        icon: 'users',
        description: 'Filter by department or function'
      };
    } catch (error) {
      logger.error('search', 'Failed to build department facet', { error });
      return this.getEmptyFacet('department', 'Department');
    }
  }

  /**
   * Build employee count facet
   */
  private async buildEmployeeCountFacet(
    searchTerm: string,
    appliedFilters: SearchFilters
  ): Promise<SearchFacet> {
    try {
      const baseWhere = this.buildBaseWhereClause(searchTerm, appliedFilters, 'company');
      
      const employeeCounts = await prisma.company.groupBy({
        by: ['employeeCount'],
        where: baseWhere,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      });

      const totalCompanies = employeeCounts.reduce((sum, emp) => sum + emp._count.id, 0);

      const employeeOrder = [
        'STARTUP_1_10', 'SMALL_11_50', 'MEDIUM_51_200', 'LARGE_201_1000',
        'ENTERPRISE_1001_5000', 'MEGA_5000_PLUS'
      ];

      const options: FacetOption[] = employeeCounts
        .filter(emp => emp.employeeCount)
        .sort((a, b) => {
          const aIndex = employeeOrder.indexOf(a.employeeCount!);
          const bIndex = employeeOrder.indexOf(b.employeeCount!);
          return aIndex - bIndex;
        })
        .map(emp => ({
          value: emp.employeeCount!,
          label: this.formatEmployeeCount(emp.employeeCount!),
          count: emp._count.id,
          percentage: Math.round((emp._count.id / totalCompanies) * 100),
          selected: appliedFilters.employeeCount?.includes?.(emp.employeeCount!)
        }));

      return {
        key: 'employeeCount',
        name: 'Company Size',
        type: 'checkbox',
        options,
        expandable: false,
        icon: 'users',
        description: 'Filter by number of employees'
      };
    } catch (error) {
      logger.error('search', 'Failed to build employee count facet', { error });
      return this.getEmptyFacet('employeeCount', 'Company Size');
    }
  }

  /**
   * Build revenue range facet
   */
  private async buildRevenueRangeFacet(
    searchTerm: string,
    appliedFilters: SearchFilters
  ): Promise<SearchFacet> {
    try {
      const baseWhere = this.buildBaseWhereClause(searchTerm, appliedFilters, 'company');
      
      const revenueRanges = await prisma.company.groupBy({
        by: ['revenueRange'],
        where: baseWhere,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      });

      const totalCompanies = revenueRanges.reduce((sum, rev) => sum + rev._count.id, 0);

      const revenueOrder = [
        'UNDER_1M', 'RANGE_1M_5M', 'RANGE_5M_25M', 'RANGE_25M_100M',
        'RANGE_100M_500M', 'RANGE_500M_1B', 'OVER_1B', 'UNDISCLOSED'
      ];

      const options: FacetOption[] = revenueRanges
        .filter(rev => rev.revenueRange)
        .sort((a, b) => {
          const aIndex = revenueOrder.indexOf(a.revenueRange!);
          const bIndex = revenueOrder.indexOf(b.revenueRange!);
          return aIndex - bIndex;
        })
        .map(rev => ({
          value: rev.revenueRange!,
          label: this.formatRevenueRange(rev.revenueRange!),
          count: rev._count.id,
          percentage: Math.round((rev._count.id / totalCompanies) * 100),
          selected: appliedFilters.revenueRange?.includes?.(rev.revenueRange!)
        }));

      return {
        key: 'revenueRange',
        name: 'Revenue Range',
        type: 'checkbox',
        options,
        expandable: false,
        icon: 'dollar-sign',
        description: 'Filter by annual revenue'
      };
    } catch (error) {
      logger.error('search', 'Failed to build revenue range facet', { error });
      return this.getEmptyFacet('revenueRange', 'Revenue Range');
    }
  }

  /**
   * Build verification facet
   */
  private async buildVerificationFacet(
    searchTerm: string,
    appliedFilters: SearchFilters,
    searchType: 'company' | 'contact'
  ): Promise<SearchFacet> {
    try {
      const baseWhere = this.buildBaseWhereClause(searchTerm, appliedFilters, searchType);
      
      const tableName = searchType === 'company' ? 'company' : 'contact';
      const verificationStats = await (searchType === 'company' ? prisma.company : prisma.contact).groupBy({
        by: ['verified'],
        where: baseWhere,
        _count: { id: true }
      } as any);

      const totalRecords = verificationStats.reduce((sum: number, stat: any) => sum + stat._count.id, 0);

      const options: FacetOption[] = verificationStats.map((stat: any) => ({
        value: stat.verified.toString(),
        label: stat.verified ? 'Verified' : 'Not Verified',
        count: stat._count.id,
        percentage: Math.round((stat._count.id / totalRecords) * 100),
        selected: appliedFilters.verified === stat.verified
      }));

      return {
        key: 'verified',
        name: 'Verification Status',
        type: 'radio',
        options,
        expandable: false,
        icon: 'check-circle',
        description: 'Filter by verification status'
      };
    } catch (error) {
      logger.error('search', 'Failed to build verification facet', { error });
      return this.getEmptyFacet('verified', 'Verification Status');
    }
  }

  /**
   * Build founded year facet
   */
  private async buildFoundedYearFacet(
    searchTerm: string,
    appliedFilters: SearchFilters
  ): Promise<SearchFacet> {
    try {
      const baseWhere = this.buildBaseWhereClause(searchTerm, appliedFilters, 'company');
      
      const currentYear = new Date().getFullYear();
      const yearRanges = [
        { label: 'Last 2 years', min: currentYear - 2, max: currentYear },
        { label: 'Last 5 years', min: currentYear - 5, max: currentYear - 3 },
        { label: 'Last 10 years', min: currentYear - 10, max: currentYear - 6 },
        { label: '2000s', min: 2000, max: 2009 },
        { label: '1990s', min: 1990, max: 1999 },
        { label: 'Before 1990', min: 1800, max: 1989 }
      ];

      const options: FacetOption[] = [];

      for (const range of yearRanges) {
        const count = await prisma.company.count({
          where: {
            ...baseWhere,
            foundedYear: {
              gte: range.min,
              lte: range.max
            }
          }
        });

        if (count > 0) {
          options.push({
            value: `${range.min}-${range.max}`,
            label: range.label,
            count,
            percentage: 0 // Will calculate after all counts
          });
        }
      }

      const totalCompanies = options.reduce((sum, opt) => sum + opt.count, 0);
      options.forEach(opt => {
        opt.percentage = Math.round((opt.count / totalCompanies) * 100);
      });

      return {
        key: 'foundedYear',
        name: 'Founded',
        type: 'checkbox',
        options,
        expandable: false,
        icon: 'calendar',
        description: 'Filter by founding year'
      };
    } catch (error) {
      logger.error('search', 'Failed to build founded year facet', { error });
      return this.getEmptyFacet('foundedYear', 'Founded');
    }
  }

  /**
   * Build activity facet (recent updates, new companies, etc.)
   */
  private async buildActivityFacet(
    searchTerm: string,
    appliedFilters: SearchFilters
  ): Promise<SearchFacet> {
    try {
      const baseWhere = this.buildBaseWhereClause(searchTerm, appliedFilters, 'company');
      const now = new Date();
      
      const activityOptions = [
        {
          label: 'Added in last 30 days',
          value: 'new_30d',
          timeFilter: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          label: 'Updated recently',
          value: 'updated_7d',
          timeFilter: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      ];

      const options: FacetOption[] = [];

      for (const activity of activityOptions) {
        let count: number;
        
        if (activity.value === 'new_30d') {
          count = await prisma.company.count({
            where: {
              ...baseWhere,
              createdAt: { gte: activity.timeFilter }
            }
          });
        } else {
          count = await prisma.company.count({
            where: {
              ...baseWhere,
              updatedAt: { gte: activity.timeFilter }
            }
          });
        }

        if (count > 0) {
          options.push({
            value: activity.value,
            label: activity.label,
            count,
            percentage: 0 // Will calculate after total
          });
        }
      }

      const totalCount = options.reduce((sum, opt) => sum + opt.count, 0);
      options.forEach(opt => {
        opt.percentage = Math.round((opt.count / totalCount) * 100);
      });

      return {
        key: 'activity',
        name: 'Recent Activity',
        type: 'checkbox',
        options,
        expandable: false,
        icon: 'activity',
        description: 'Filter by recent activity'
      };
    } catch (error) {
      logger.error('search', 'Failed to build activity facet', { error });
      return this.getEmptyFacet('activity', 'Recent Activity');
    }
  }

  /**
   * Build title facet for contacts
   */
  private async buildTitleFacet(
    searchTerm: string,
    appliedFilters: SearchFilters
  ): Promise<SearchFacet> {
    try {
      const baseWhere = this.buildBaseWhereClause(searchTerm, appliedFilters, 'contact');
      
      // Get common title patterns
      const titlePatterns = [
        { pattern: '%CEO%', label: 'CEO' },
        { pattern: '%CTO%', label: 'CTO' },
        { pattern: '%CMO%', label: 'CMO' },
        { pattern: '%CFO%', label: 'CFO' },
        { pattern: '%VP%', label: 'VP' },
        { pattern: '%Director%', label: 'Director' },
        { pattern: '%Manager%', label: 'Manager' },
        { pattern: '%President%', label: 'President' },
        { pattern: '%Head of%', label: 'Head of' },
        { pattern: '%Lead%', label: 'Lead' }
      ];

      const options: FacetOption[] = [];

      for (const pattern of titlePatterns) {
        const count = await prisma.contact.count({
          where: {
            ...baseWhere,
            title: { contains: pattern.pattern.replace(/%/g, ''), mode: 'insensitive' }
          }
        });

        if (count > 0) {
          options.push({
            value: pattern.pattern,
            label: `${pattern.label} (${count})`,
            count,
            percentage: 0
          });
        }
      }

      const totalCount = options.reduce((sum, opt) => sum + opt.count, 0);
      options.forEach(opt => {
        opt.percentage = Math.round((opt.count / totalCount) * 100);
      });

      return {
        key: 'titlePattern',
        name: 'Job Title',
        type: 'checkbox',
        options: options.slice(0, 10),
        hasMore: options.length > 10,
        expandable: true,
        icon: 'briefcase',
        description: 'Filter by job title patterns'
      };
    } catch (error) {
      logger.error('search', 'Failed to build title facet', { error });
      return this.getEmptyFacet('titlePattern', 'Job Title');
    }
  }

  /**
   * Get total result count for current search
   */
  private async getTotalResultCount(
    searchTerm: string,
    appliedFilters: SearchFilters,
    searchType: 'company' | 'contact'
  ): Promise<number> {
    try {
      const baseWhere = this.buildBaseWhereClause(searchTerm, appliedFilters, searchType);
      
      if (searchType === 'company') {
        return await prisma.company.count({ where: baseWhere });
      } else {
        return await prisma.contact.count({ where: baseWhere });
      }
    } catch (error) {
      logger.error('search', 'Failed to get total result count', { error });
      return 0;
    }
  }

  /**
   * Generate recommendations for popular filter combinations
   */
  private async generateRecommendations(
    searchTerm: string,
    appliedFilters: SearchFilters,
    searchType: 'company' | 'contact'
  ): Promise<FacetedSearchResponse['recommendations']> {
    const suggestedFilters: FacetOption[] = [];
    const popularCombinations: Array<{
      filters: Record<string, any>;
      label: string;
      count: number;
    }> = [];

    // Add logic for generating smart recommendations
    // This is a simplified version - in production, you'd analyze user behavior
    
    if (searchType === 'company' && !appliedFilters.verified) {
      suggestedFilters.push({
        value: 'true',
        label: 'Show only verified companies',
        count: 0,
        percentage: 0
      });
    }

    return { suggestedFilters, popularCombinations };
  }

  /**
   * Helper methods for building where clauses and formatting
   */
  private buildBaseWhereClause(
    searchTerm: string,
    appliedFilters: SearchFilters,
    searchType: 'company' | 'contact'
  ): any {
    const where: any = { AND: [] };

    // Add text search
    if (searchTerm && searchTerm.length >= 2) {
      if (searchType === 'company') {
        where.AND.push({
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        });
      } else {
        where.AND.push({
          OR: [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { title: { contains: searchTerm, mode: 'insensitive' } }
          ]
        });
      }
    }

    // Add active filter
    where.AND.push({ isActive: true });

    // Add applied filters
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value && Array.isArray(value) && value.length > 0) {
        where.AND.push({ [key]: { in: value } });
      } else if (typeof value === 'boolean') {
        where.AND.push({ [key]: value });
      }
    });

    return where;
  }

  private buildRawWhereClause(where: any): string {
    // This is a simplified version - implement proper SQL generation
    return '1=1'; // Placeholder
  }

  private formatCompanyType(type: string): string {
    return type.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  private formatIndustry(industry: string): string {
    return industry.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  private formatSeniority(seniority: string): string {
    return seniority.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  private formatDepartment(department: string): string {
    return department.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
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

  private formatRevenueRange(range: string): string {
    const map: Record<string, string> = {
      'UNDER_1M': 'Under $1M',
      'RANGE_1M_5M': '$1M - $5M',
      'RANGE_5M_25M': '$5M - $25M',
      'RANGE_25M_100M': '$25M - $100M',
      'RANGE_100M_500M': '$100M - $500M',
      'RANGE_500M_1B': '$500M - $1B',
      'OVER_1B': 'Over $1B',
      'UNDISCLOSED': 'Undisclosed'
    };
    return map[range] || range;
  }

  private getEmptyFacet(key: string, name: string): SearchFacet {
    return {
      key,
      name,
      type: 'checkbox',
      options: [],
      expandable: false
    };
  }

  /**
   * Clear facet cache
   */
  clearCache(): void {
    this.facetCache.clear();
    logger.info('search', 'Search facet cache cleared');
  }
}

// Export singleton instance
export const searchFacetEngine = SearchFacetEngine.getInstance();