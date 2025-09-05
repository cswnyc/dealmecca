import { PrismaClient, Prisma } from '@prisma/client';
import { getPerformanceMonitor } from './performance-monitor';
import { cachedSearch, generateCacheKey } from './search-cache';

const prisma = new PrismaClient();
const performanceMonitor = getPerformanceMonitor(prisma);

// Full-text search configuration
export interface FullTextSearchOptions {
  query: string;
  searchType: 'companies' | 'contacts' | 'both';
  limit?: number;
  offset?: number;
  filters?: SearchFilters;
  useCache?: boolean;
  userId?: string;
}

export interface SearchFilters {
  companyTypes?: string[];
  industries?: string[];
  locations?: { city?: string; state?: string }[];
  seniorities?: string[];
  departments?: string[];
  verified?: boolean;
  isDecisionMaker?: boolean;
}

export interface FullTextSearchResult {
  companies: CompanySearchResult[];
  contacts: ContactSearchResult[];
  totalCompanies: number;
  totalContacts: number;
  searchStats: SearchStats;
  suggestions: string[];
  facets: SearchFacets;
}

interface CompanySearchResult {
  id: string;
  name: string;
  slug: string;
  description?: string;
  companyType: string;
  industry?: string;
  city?: string;
  state?: string;
  employeeCount?: string;
  verified: boolean;
  contactCount: number;
  searchScore: number;
  highlightedText: string;
}

interface ContactSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  email?: string;
  department?: string;
  seniority: string;
  isDecisionMaker: boolean;
  verified: boolean;
  searchScore: number;
  highlightedText: string;
  company: {
    id: string;
    name: string;
    companyType: string;
    verified: boolean;
  };
}

interface SearchStats {
  totalResults: number;
  executionTimeMs: number;
  cached: boolean;
  queryComplexity: number;
}

interface SearchFacets {
  companyTypes: { value: string; count: number }[];
  industries: { value: string; count: number }[];
  locations: { value: string; count: number }[];
  seniorities: { value: string; count: number }[];
  departments: { value: string; count: number }[];
}

export class FullTextSearchEngine {
  private static instance: FullTextSearchEngine;

  static getInstance(): FullTextSearchEngine {
    if (!FullTextSearchEngine.instance) {
      FullTextSearchEngine.instance = new FullTextSearchEngine();
    }
    return FullTextSearchEngine.instance;
  }

  // Main search function with full-text capabilities
  async search(options: FullTextSearchOptions): Promise<FullTextSearchResult> {
    const startTime = performance.now();
    const { query, searchType, limit = 50, offset = 0, filters = {}, useCache = true, userId } = options;

    // Generate cache key
    const cacheKey = generateCacheKey('fulltext_search', {
      query,
      searchType,
      limit,
      offset,
      filters
    }, userId);

    // Execute cached search
    const { result: searchResult, cached } = await cachedSearch(
      cacheKey,
      async () => {
        const results = await this.executeFullTextSearch(options);
        return results;
      },
      {
        ttl: 1000 * 60 * 10, // 10 minutes for full-text search
        tags: ['fulltext_search', searchType, 'search_results'],
        skipCache: !useCache
      }
    );

    const executionTime = performance.now() - startTime;

    // Add search statistics
    const finalResult = cached ? searchResult.data : searchResult;
    finalResult.searchStats = {
      ...finalResult.searchStats,
      executionTimeMs: Math.round(executionTime * 100) / 100,
      cached
    };

    return finalResult;
  }

  // Execute the actual full-text search
  private async executeFullTextSearch(options: FullTextSearchOptions): Promise<FullTextSearchResult> {
    const { query, searchType, limit, offset, filters } = options;

    // Prepare search terms
    const searchTerms = this.prepareSearchTerms(query);
    const tsQuery = this.buildTsQuery(searchTerms);

    let companies: CompanySearchResult[] = [];
    let contacts: ContactSearchResult[] = [];
    let totalCompanies = 0;
    let totalContacts = 0;

    // Execute company search
    if (searchType === 'companies' || searchType === 'both') {
      const companyResults = await performanceMonitor.trackQuery(
        'fullTextSearchCompanies',
        () => this.searchCompanies(tsQuery, searchTerms, filters, limit, offset),
        { route: '/api/search/fulltext', userId: options.userId }
      );
      
      companies = companyResults.results;
      totalCompanies = companyResults.total;
    }

    // Execute contact search
    if (searchType === 'contacts' || searchType === 'both') {
      const contactResults = await performanceMonitor.trackQuery(
        'fullTextSearchContacts',
        () => this.searchContacts(tsQuery, searchTerms, filters, limit, offset),
        { route: '/api/search/fulltext', userId: options.userId }
      );
      
      contacts = contactResults.results;
      totalContacts = contactResults.total;
    }

    // Generate facets and suggestions
    const [facets, suggestions] = await Promise.all([
      this.generateFacets(query, filters),
      this.generateSuggestions(query, searchTerms)
    ]);

    return {
      companies,
      contacts,
      totalCompanies,
      totalContacts,
      searchStats: {
        totalResults: totalCompanies + totalContacts,
        executionTimeMs: 0, // Will be set by calling function
        cached: false,
        queryComplexity: this.calculateQueryComplexity(query, filters)
      },
      suggestions,
      facets
    };
  }

  // Search companies using full-text search
  private async searchCompanies(
    tsQuery: string,
    searchTerms: string[],
    filters: SearchFilters,
    limit?: number,
    offset?: number
  ): Promise<{ results: CompanySearchResult[]; total: number }> {
    
    // Build WHERE clause with filters
    const whereConditions = [`companies.name IS NOT NULL`];
    const params: any[] = [];
    let paramIndex = 1;

    // Add full-text search condition
    if (tsQuery) {
      whereConditions.push(`to_tsvector('english', companies.name || ' ' || COALESCE(companies.description, '')) @@ to_tsquery('english', $${paramIndex})`);
      params.push(tsQuery);
      paramIndex++;
    }

    // Add filters
    if (filters.companyTypes?.length) {
      whereConditions.push(`companies."companyType" = ANY($${paramIndex})`);
      params.push(filters.companyTypes);
      paramIndex++;
    }

    if (filters.industries?.length) {
      whereConditions.push(`companies.industry = ANY($${paramIndex})`);
      params.push(filters.industries);
      paramIndex++;
    }

    if (filters.locations?.length) {
      const locationConditions = filters.locations.map(loc => {
        const conditions = [];
        if (loc.city) conditions.push(`companies.city ILIKE '%${loc.city}%'`);
        if (loc.state) conditions.push(`companies.state = '${loc.state}'`);
        return conditions.length > 0 ? `(${conditions.join(' AND ')})` : '';
      }).filter(Boolean);
      
      if (locationConditions.length > 0) {
        whereConditions.push(`(${locationConditions.join(' OR ')})`);
      }
    }

    if (filters.verified !== undefined) {
      whereConditions.push(`companies.verified = $${paramIndex}`);
      params.push(filters.verified);
      paramIndex++;
    }

    // Build the main query
    const searchQuery = `
      SELECT 
        companies.id,
        companies.name,
        companies.slug,
        companies.description,
        companies."companyType",
        companies.industry,
        companies.city,
        companies.state,
        companies."employeeCount",
        companies.verified,
        COALESCE(contact_count.count, 0) as contact_count,
        ${tsQuery ? `ts_rank(to_tsvector('english', companies.name || ' ' || COALESCE(companies.description, '')), to_tsquery('english', $1))` : '1'} as search_score,
        ${tsQuery ? `ts_headline('english', companies.name || ' ' || COALESCE(companies.description, ''), to_tsquery('english', $1), 'MaxWords=10, MinWords=1, ShortWord=3, HighlightAll=true')` : 'companies.name'} as highlighted_text
      FROM companies
      LEFT JOIN (
        SELECT 
          "companyId",
          COUNT(*) as count
        FROM contacts 
        WHERE "isActive" = true
        GROUP BY "companyId"
      ) contact_count ON companies.id = contact_count."companyId"
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY search_score DESC, companies.verified DESC, companies.name ASC
      ${limit ? `LIMIT $${paramIndex}` : ''}
      ${offset && limit ? `OFFSET $${paramIndex + 1}` : offset && !limit ? `OFFSET $${paramIndex}` : ''}
    `;

    if (limit) {
      params.push(limit);
      if (offset) params.push(offset);
    } else if (offset) {
      params.push(offset);
    }

    // Execute search query
    const results = await prisma.$queryRawUnsafe(searchQuery, ...params) as any[];

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM companies
      WHERE ${whereConditions.join(' AND ')}
    `;
    
    const countResult = await prisma.$queryRawUnsafe(countQuery, ...params.slice(0, params.length - (limit ? (offset ? 2 : 1) : (offset ? 1 : 0)))) as any[];
    const total = parseInt(countResult[0]?.total || '0');

    // Transform results
    const companies: CompanySearchResult[] = results.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      companyType: row.companyType,
      industry: row.industry,
      city: row.city,
      state: row.state,
      employeeCount: row.employeeCount,
      verified: row.verified,
      contactCount: parseInt(row.contact_count) || 0,
      searchScore: parseFloat(row.search_score) || 0,
      highlightedText: row.highlighted_text || row.name
    }));

    return { results: companies, total };
  }

  // Search contacts using full-text search
  private async searchContacts(
    tsQuery: string,
    searchTerms: string[],
    filters: SearchFilters,
    limit?: number,
    offset?: number
  ): Promise<{ results: ContactSearchResult[]; total: number }> {
    
    // Build WHERE clause with filters
    const whereConditions = [`contacts."isActive" = true`];
    const params: any[] = [];
    let paramIndex = 1;

    // Add full-text search condition
    if (tsQuery) {
      whereConditions.push(`to_tsvector('english', contacts."firstName" || ' ' || contacts."lastName" || ' ' || contacts.title || ' ' || COALESCE(contacts."fullName", '')) @@ to_tsquery('english', $${paramIndex})`);
      params.push(tsQuery);
      paramIndex++;
    }

    // Add contact-specific filters
    if (filters.seniorities?.length) {
      whereConditions.push(`contacts.seniority = ANY($${paramIndex})`);
      params.push(filters.seniorities);
      paramIndex++;
    }

    if (filters.departments?.length) {
      whereConditions.push(`contacts.department = ANY($${paramIndex})`);
      params.push(filters.departments);
      paramIndex++;
    }

    if (filters.isDecisionMaker !== undefined) {
      whereConditions.push(`contacts."isDecisionMaker" = $${paramIndex}`);
      params.push(filters.isDecisionMaker);
      paramIndex++;
    }

    if (filters.verified !== undefined) {
      whereConditions.push(`contacts.verified = $${paramIndex}`);
      params.push(filters.verified);
      paramIndex++;
    }

    // Company filters
    const companyFilters = [];
    if (filters.companyTypes?.length) {
      companyFilters.push(`companies."companyType" = ANY($${paramIndex})`);
      params.push(filters.companyTypes);
      paramIndex++;
    }

    if (filters.industries?.length) {
      companyFilters.push(`companies.industry = ANY($${paramIndex})`);
      params.push(filters.industries);
      paramIndex++;
    }

    // Build the main query
    const searchQuery = `
      SELECT 
        contacts.id,
        contacts."firstName",
        contacts."lastName",
        contacts."fullName",
        contacts.title,
        contacts.email,
        contacts.department,
        contacts.seniority,
        contacts."isDecisionMaker",
        contacts.verified,
        ${tsQuery ? `ts_rank(to_tsvector('english', contacts."firstName" || ' ' || contacts."lastName" || ' ' || contacts.title || ' ' || COALESCE(contacts."fullName", '')), to_tsquery('english', $1))` : '1'} as search_score,
        ${tsQuery ? `ts_headline('english', contacts."firstName" || ' ' || contacts."lastName" || ' ' || contacts.title, to_tsquery('english', $1), 'MaxWords=10, MinWords=1, ShortWord=3, HighlightAll=true')` : `contacts."firstName" || ' ' || contacts."lastName"`} as highlighted_text,
        companies.id as company_id,
        companies.name as company_name,
        companies."companyType" as company_type,
        companies.verified as company_verified
      FROM contacts
      INNER JOIN companies ON contacts."companyId" = companies.id
      WHERE ${whereConditions.join(' AND ')}
      ${companyFilters.length > 0 ? ` AND ${companyFilters.join(' AND ')}` : ''}
      ORDER BY search_score DESC, contacts.verified DESC, contacts."firstName" ASC
      ${limit ? `LIMIT $${paramIndex}` : ''}
      ${offset && limit ? `OFFSET $${paramIndex + 1}` : offset && !limit ? `OFFSET $${paramIndex}` : ''}
    `;

    if (limit) {
      params.push(limit);
      if (offset) params.push(offset);
    } else if (offset) {
      params.push(offset);
    }

    // Execute search query
    const results = await prisma.$queryRawUnsafe(searchQuery, ...params) as any[];

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM contacts
      INNER JOIN companies ON contacts."companyId" = companies.id
      WHERE ${whereConditions.join(' AND ')}
      ${companyFilters.length > 0 ? ` AND ${companyFilters.join(' AND ')}` : ''}
    `;
    
    const countResult = await prisma.$queryRawUnsafe(countQuery, ...params.slice(0, params.length - (limit ? (offset ? 2 : 1) : (offset ? 1 : 0)))) as any[];
    const total = parseInt(countResult[0]?.total || '0');

    // Transform results
    const contacts: ContactSearchResult[] = results.map(row => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      fullName: row.fullName,
      title: row.title,
      email: row.email,
      department: row.department,
      seniority: row.seniority,
      isDecisionMaker: row.isDecisionMaker,
      verified: row.verified,
      searchScore: parseFloat(row.search_score) || 0,
      highlightedText: row.highlighted_text || `${row.firstName} ${row.lastName}`,
      company: {
        id: row.company_id,
        name: row.company_name,
        companyType: row.company_type,
        verified: row.company_verified
      }
    }));

    return { results: contacts, total };
  }

  // Prepare search terms for full-text search
  private prepareSearchTerms(query: string): string[] {
    if (!query) return [];
    
    // Remove special characters and split by whitespace
    const terms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2) // Filter out short terms
      .slice(0, 10); // Limit to 10 terms max

    return terms;
  }

  // Build PostgreSQL tsquery from search terms
  private buildTsQuery(terms: string[]): string {
    if (terms.length === 0) return '';
    
    // Create OR query for flexibility, with prefix matching
    return terms.map(term => `${term}:*`).join(' | ');
  }

  // Generate search facets for filtering
  private async generateFacets(query: string, filters: SearchFilters): Promise<SearchFacets> {
    // This is a simplified version - in production you'd want to calculate actual counts
    // based on the current search results
    
    const [companyTypes, industries, locations, seniorities, departments] = await Promise.all([
      this.getFacetCounts('companies', 'companyType'),
      this.getFacetCounts('companies', 'industry'),
      this.getLocationFacets(),
      this.getFacetCounts('contacts', 'seniority'),
      this.getFacetCounts('contacts', 'department')
    ]);

    return {
      companyTypes,
      industries, 
      locations,
      seniorities,
      departments
    };
  }

  // Get facet counts for a specific field
  private async getFacetCounts(table: string, field: string): Promise<{ value: string; count: number }[]> {
    try {
      const results = await prisma.$queryRawUnsafe(`
        SELECT ${field} as value, COUNT(*) as count
        FROM ${table === 'contacts' ? 'contacts WHERE "isActive" = true' : table}
        WHERE ${field} IS NOT NULL
        GROUP BY ${field}
        ORDER BY count DESC
        LIMIT 20
      `) as any[];

      return results.map(row => ({
        value: row.value,
        count: parseInt(row.count)
      }));
    } catch (error) {
      console.error(`Failed to get facet counts for ${table}.${field}:`, error);
      return [];
    }
  }

  // Get location-based facets
  private async getLocationFacets(): Promise<{ value: string; count: number }[]> {
    try {
      const results = await prisma.$queryRaw<any[]>`
        SELECT 
          CASE 
            WHEN city IS NOT NULL AND state IS NOT NULL THEN city || ', ' || state
            WHEN city IS NOT NULL THEN city
            WHEN state IS NOT NULL THEN state
            ELSE 'Unknown'
          END as value,
          COUNT(*) as count
        FROM companies
        WHERE city IS NOT NULL OR state IS NOT NULL
        GROUP BY value
        ORDER BY count DESC
        LIMIT 20
      `;

      return results.map(row => ({
        value: row.value,
        count: parseInt(row.count)
      }));
    } catch (error) {
      console.error('Failed to get location facets:', error);
      return [];
    }
  }

  // Generate search suggestions based on query
  private async generateSuggestions(query: string, terms: string[]): Promise<string[]> {
    if (terms.length === 0) return [];

    try {
      // Get suggestions from company names and contact titles
      const suggestions = await prisma.$queryRaw<any[]>`
        (SELECT DISTINCT name as suggestion FROM companies 
         WHERE name ILIKE '%' || $1 || '%' 
         ORDER BY name LIMIT 5)
        UNION
        (SELECT DISTINCT title as suggestion FROM contacts 
         WHERE title ILIKE '%' || $1 || '%' 
         AND "isActive" = true
         ORDER BY title LIMIT 5)
      `;

      return suggestions.map(row => row.suggestion).filter(Boolean);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return [];
    }
  }

  // Calculate query complexity score
  private calculateQueryComplexity(query: string, filters: SearchFilters): number {
    let complexity = 0;
    
    // Base complexity for text search
    if (query) {
      complexity += query.split(' ').length * 2;
    }
    
    // Add complexity for each filter
    if (filters.companyTypes?.length) complexity += filters.companyTypes.length;
    if (filters.industries?.length) complexity += filters.industries.length;
    if (filters.locations?.length) complexity += filters.locations.length * 2;
    if (filters.seniorities?.length) complexity += filters.seniorities.length;
    if (filters.departments?.length) complexity += filters.departments.length;
    if (filters.verified !== undefined) complexity += 1;
    if (filters.isDecisionMaker !== undefined) complexity += 1;
    
    return Math.min(complexity, 100); // Cap at 100
  }
}

// Export singleton instance
export const fullTextSearch = FullTextSearchEngine.getInstance();