import { NextRequest } from 'next/server';

// Pagination configuration and utilities for all endpoints
export interface PaginationConfig {
  defaultLimit: number;
  maxLimit: number;
  defaultOffset: number;
}

export interface PaginationParams {
  limit: number;
  offset: number;
  page?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage?: number;
    prevPage?: number;
    offset: number;
    limit: number;
  };
}

export interface CursorPaginationParams {
  limit: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
}

export interface CursorPaginationResult<T> {
  data: T[];
  pagination: {
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
    limit: number;
  };
}

// Default pagination configurations for different endpoints
export const PAGINATION_CONFIGS: Record<string, PaginationConfig> = {
  // Search endpoints - balance between performance and user experience
  search: {
    defaultLimit: 25,
    maxLimit: 100,
    defaultOffset: 0
  },
  
  // Company listings - moderate page size for browsing
  companies: {
    defaultLimit: 50,
    maxLimit: 200,
    defaultOffset: 0
  },
  
  // Contact listings - smaller pages for detailed info
  contacts: {
    defaultLimit: 30,
    maxLimit: 100,
    defaultOffset: 0
  },
  
  // Forum posts - standard social media pagination
  forum: {
    defaultLimit: 20,
    maxLimit: 50,
    defaultOffset: 0
  },
  
  // Analytics and reports - larger pages for data analysis
  analytics: {
    defaultLimit: 100,
    maxLimit: 500,
    defaultOffset: 0
  },
  
  // Notifications - smaller pages for real-time updates
  notifications: {
    defaultLimit: 15,
    maxLimit: 50,
    defaultOffset: 0
  },
  
  // Admin operations - larger pages for bulk operations
  admin: {
    defaultLimit: 100,
    maxLimit: 1000,
    defaultOffset: 0
  }
};

export class PaginationHelper {
  private static instance: PaginationHelper;

  static getInstance(): PaginationHelper {
    if (!PaginationHelper.instance) {
      PaginationHelper.instance = new PaginationHelper();
    }
    return PaginationHelper.instance;
  }

  // Extract pagination parameters from request
  getPaginationParams(
    request: NextRequest,
    configKey: keyof typeof PAGINATION_CONFIGS = 'search'
  ): PaginationParams {
    const { searchParams } = new URL(request.url);
    const config = PAGINATION_CONFIGS[configKey];
    
    // Support both page-based and offset-based pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || config.defaultLimit.toString()),
      config.maxLimit
    );
    
    let offset: number;
    
    if (searchParams.has('offset')) {
      // Direct offset parameter
      offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));
    } else {
      // Calculate offset from page number
      offset = Math.max(0, (page - 1) * limit);
    }

    return {
      limit,
      offset,
      page
    };
  }

  // Extract cursor-based pagination parameters
  getCursorPaginationParams(
    request: NextRequest,
    configKey: keyof typeof PAGINATION_CONFIGS = 'search'
  ): CursorPaginationParams {
    const { searchParams } = new URL(request.url);
    const config = PAGINATION_CONFIGS[configKey];
    
    const limit = Math.min(
      parseInt(searchParams.get('limit') || config.defaultLimit.toString()),
      config.maxLimit
    );
    
    const cursor = searchParams.get('cursor') || undefined;
    const direction = (searchParams.get('direction') as 'forward' | 'backward') || 'forward';

    return {
      limit,
      cursor,
      direction
    };
  }

  // Create pagination result with metadata
  createPaginationResult<T>(
    data: T[],
    totalItems: number,
    params: PaginationParams
  ): PaginationResult<T> {
    const { limit, offset, page = Math.floor(offset / limit) + 1 } = params;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.max(1, page);
    
    return {
      data,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        nextPage: currentPage < totalPages ? currentPage + 1 : undefined,
        prevPage: currentPage > 1 ? currentPage - 1 : undefined,
        offset,
        limit
      }
    };
  }

  // Create cursor-based pagination result
  createCursorPaginationResult<T>(
    data: T[],
    params: CursorPaginationParams,
    getCursor: (item: T) => string
  ): CursorPaginationResult<T> {
    const { limit } = params;
    
    // Determine if there are more items
    const hasNext = data.length === limit;
    const hasPrev = params.cursor !== undefined;
    
    // Get cursors from first and last items
    const nextCursor = hasNext && data.length > 0 ? getCursor(data[data.length - 1]) : undefined;
    const prevCursor = hasPrev && data.length > 0 ? getCursor(data[0]) : undefined;

    return {
      data,
      pagination: {
        hasNext,
        hasPrev,
        nextCursor,
        prevCursor,
        limit
      }
    };
  }

  // Optimize pagination queries with smart indexing
  optimizeQuery<T>(
    baseQuery: any,
    params: PaginationParams,
    sortField: string = 'id',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): any {
    const { limit, offset } = params;
    
    // Add ordering for consistent pagination
    let query = {
      ...baseQuery,
      orderBy: {
        [sortField]: sortDirection
      },
      take: limit,
      skip: offset
    };

    // Add additional optimizations for large offsets
    if (offset > 1000) {
      // For large offsets, cursor-based pagination would be better
      console.warn(`Large offset detected (${offset}). Consider using cursor-based pagination for better performance.`);
    }

    return query;
  }

  // Generate pagination URLs for API responses
  generatePaginationUrls(
    baseUrl: string,
    currentParams: PaginationParams,
    totalItems: number,
    searchParams?: URLSearchParams
  ): {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  } {
    const { limit } = currentParams;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(currentParams.offset / limit) + 1;
    
    const buildUrl = (page: number) => {
      const params = new URLSearchParams(searchParams || {});
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      return `${baseUrl}?${params.toString()}`;
    };

    const urls: any = {};
    
    // First page
    if (currentPage > 1) {
      urls.first = buildUrl(1);
    }
    
    // Previous page
    if (currentPage > 1) {
      urls.prev = buildUrl(currentPage - 1);
    }
    
    // Next page
    if (currentPage < totalPages) {
      urls.next = buildUrl(currentPage + 1);
    }
    
    // Last page
    if (currentPage < totalPages) {
      urls.last = buildUrl(totalPages);
    }

    return urls;
  }

  // Performance monitoring for pagination
  async monitorPaginationPerformance<T>(
    operation: string,
    params: PaginationParams,
    queryFn: () => Promise<{ data: T[]; total: number }>,
    performanceThresholds = {
      slowQueryMs: 1000,
      largeOffsetWarning: 1000,
      largeLimitWarning: 200
    }
  ): Promise<{ data: T[]; total: number; performance: PaginationPerformance }> {
    const startTime = performance.now();
    const { offset, limit } = params;
    
    // Pre-execution warnings
    const warnings: string[] = [];
    if (offset > performanceThresholds.largeOffsetWarning) {
      warnings.push(`Large offset (${offset}) may cause performance issues`);
    }
    if (limit > performanceThresholds.largeLimitWarning) {
      warnings.push(`Large limit (${limit}) may impact response time`);
    }

    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      
      // Post-execution analysis
      if (duration > performanceThresholds.slowQueryMs) {
        warnings.push(`Slow pagination query (${Math.round(duration)}ms)`);
      }

      const performance: PaginationPerformance = {
        operation,
        duration: Math.round(duration * 100) / 100,
        offset,
        limit,
        resultCount: result.data.length,
        totalCount: result.total,
        warnings,
        recommendations: this.generatePerformanceRecommendations(params, duration, result.total)
      };

      console.log(`📊 Pagination Performance [${operation}]:`, {
        duration: `${performance.duration}ms`,
        params: `offset=${offset}, limit=${limit}`,
        results: `${result.data.length}/${result.total}`,
        warnings: warnings.length > 0 ? warnings : 'none'
      });

      return { ...result, performance };
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ Pagination Error [${operation}]:`, {
        duration: `${Math.round(duration)}ms`,
        params: `offset=${offset}, limit=${limit}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Generate performance recommendations
  private generatePerformanceRecommendations(
    params: PaginationParams,
    duration: number,
    totalItems: number
  ): string[] {
    const recommendations: string[] = [];
    const { offset, limit } = params;
    
    if (offset > 1000) {
      recommendations.push('Consider using cursor-based pagination for large offsets');
    }
    
    if (duration > 2000) {
      recommendations.push('Query is slow - review indexes and query optimization');
    }
    
    if (limit > 100 && totalItems > 10000) {
      recommendations.push('Large page size with many total items - consider smaller pages');
    }
    
    if (offset / limit > 100) {
      recommendations.push('Deep pagination detected - implement virtual scrolling or search refinement');
    }
    
    return recommendations;
  }

  // Get pagination statistics for monitoring
  getPaginationStats(results: any[]): PaginationStats {
    const durations = results.map(r => r.performance?.duration || 0);
    const offsets = results.map(r => r.performance?.offset || 0);
    const limits = results.map(r => r.performance?.limit || 0);
    
    return {
      totalRequests: results.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      avgOffset: offsets.reduce((a, b) => a + b, 0) / offsets.length,
      maxOffset: Math.max(...offsets),
      avgLimit: limits.reduce((a, b) => a + b, 0) / limits.length,
      maxLimit: Math.max(...limits),
      slowRequestCount: durations.filter(d => d > 1000).length
    };
  }
}

// Performance tracking interfaces
interface PaginationPerformance {
  operation: string;
  duration: number;
  offset: number;
  limit: number;
  resultCount: number;
  totalCount: number;
  warnings: string[];
  recommendations: string[];
}

interface PaginationStats {
  totalRequests: number;
  avgDuration: number;
  maxDuration: number;
  avgOffset: number;
  maxOffset: number;
  avgLimit: number;
  maxLimit: number;
  slowRequestCount: number;
}

// Export singleton instance
export const paginationHelper = PaginationHelper.getInstance();

// Utility functions for common pagination patterns
export function createSearchPagination<T>(
  data: T[],
  total: number,
  request: NextRequest
): PaginationResult<T> {
  const params = paginationHelper.getPaginationParams(request, 'search');
  return paginationHelper.createPaginationResult(data, total, params);
}

export function createCursorPagination<T>(
  data: T[],
  request: NextRequest,
  getCursor: (item: T) => string,
  configKey: keyof typeof PAGINATION_CONFIGS = 'search'
): CursorPaginationResult<T> {
  const params = paginationHelper.getCursorPaginationParams(request, configKey);
  return paginationHelper.createCursorPaginationResult(data, params, getCursor);
}