/**
 * Enhanced API Endpoint with Production Logging
 * 
 * Example of how to add comprehensive error monitoring to API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../lib/error-logger';

// Example: Enhanced Companies API with logging
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // Extract request information
  const url = request.url;
  const method = request.method;
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const userId = request.headers.get('x-user-id') || undefined;
  const userTier = request.headers.get('x-user-tier') || 'Unknown';
  
  // Log incoming request
  logger.apiRequest(method, url, userId, userAgent);
  
  try {
    // Parse query parameters with validation
    const { searchParams } = new URL(url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    
    logger.info('api-companies', `Search request: "${query}" (page ${page}, limit ${limit})`, {
      requestId,
      userId,
      userTier,
      query,
      page,
      limit
    });

    // Validate inputs
    if (query.length > 200) {
      const error = new Error('Search query too long');
      logger.apiError(method, url, error, userId, 400);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Search query too long. Maximum 200 characters allowed.',
          code: 'INVALID_QUERY',
          requestId 
        },
        { status: 400 }
      );
    }

    // Authentication check with logging
    if (!userId) {
      logger.warn('api-companies', 'Unauthorized access attempt', {
        requestId,
        userAgent,
        url
      });
      
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        requestId
      }, { status: 401 });
    }

    // Database query with timing
    const dbStartTime = Date.now();
    
    // Simulate database query (replace with actual Prisma call)
    const companies = await performDatabaseSearch(query, page, limit, userId);
    
    const dbDuration = Date.now() - dbStartTime;
    logger.dbQuery(`companies search: ${query}`, dbDuration, userId);

    // Log search activity
    logger.searchQuery(query, companies.length, dbDuration, userId);

    // Prepare response
    const totalDuration = Date.now() - startTime;
    const response = {
      success: true,
      companies,
      pagination: {
        page,
        limit,
        total: companies.length,
        hasMore: companies.length === limit
      },
      searchInfo: {
        query,
        userTier,
        duration: totalDuration
      },
      requestId
    };

    // Log successful response
    logger.apiResponse(method, url, 200, totalDuration, userId, {
      resultsCount: companies.length,
      searchQuery: query
    });

    return NextResponse.json(response);

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Log the error with full details
    logger.apiError(method, url, error, userId, 500);
    
    // Also log additional context
    logger.error('api-companies', 'Unexpected error in companies search', {
      requestId,
      userId,
      userAgent,
      duration,
      errorName: error.name,
      errorMessage: error.message
    }, error.stack);

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      requestId,
      ...(process.env.NODE_ENV === 'development' && {
        debugInfo: {
          message: error.message,
          stack: error.stack
        }
      })
    }, { status: 500 });
  }
}

// Mock database function with error handling
async function performDatabaseSearch(query: string, page: number, limit: number, userId: string) {
  try {
    // Simulate database connection issues
    if (Math.random() < 0.05) { // 5% chance of simulated error
      throw new Error('Database connection timeout');
    }

    // Mock search results
    const mockCompanies = [
      { id: '1', name: 'WPP Group', industry: 'Advertising', verified: true },
      { id: '2', name: 'Omnicom Group', industry: 'Advertising', verified: true },
      { id: '3', name: 'Publicis Groupe', industry: 'Advertising', verified: true },
    ].filter(company => 
      !query || company.name.toLowerCase().includes(query.toLowerCase())
    );

    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200));

    return mockCompanies;
    
  } catch (error: any) {
    logger.dbError(`companies search: ${query}`, error, userId);
    throw error;
  }
}

// Example middleware for request logging
export function withRequestLogging(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      logger.info('middleware', `Request started: ${request.method} ${request.url}`, {
        requestId,
        userAgent: request.headers.get('user-agent'),
        userId: request.headers.get('x-user-id')
      });

      const response = await handler(request, ...args);
      
      const duration = Date.now() - startTime;
      logger.info('middleware', `Request completed in ${duration}ms`, {
        requestId,
        duration,
        status: response?.status || 'unknown'
      });

      return response;
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('middleware', `Request failed after ${duration}ms`, {
        requestId,
        duration,
        error: error.message
      }, error.stack);
      
      throw error;
    }
  };
}

/* 
To use this enhanced logging in your existing API routes:

1. Import the logger:
   import { logger } from '@/lib/error-logger';

2. Add request logging at the start:
   logger.apiRequest(request.method, request.url, userId, userAgent);

3. Add error logging in catch blocks:
   logger.apiError(request.method, request.url, error, userId);

4. Add success logging:
   logger.apiResponse(request.method, request.url, 200, duration, userId);

5. Add search/database logging:
   logger.searchQuery(query, results.length, duration, userId);
   logger.dbQuery('SELECT * FROM companies', duration, userId);

Example integration in existing route:

```typescript
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const userId = request.headers.get('x-user-id');
  
  // Log request
  logger.apiRequest(request.method, request.url, userId);
  
  try {
    // Your existing logic here
    const results = await prisma.company.findMany(...);
    
    // Log success
    const duration = Date.now() - startTime;
    logger.apiResponse(request.method, request.url, 200, duration, userId);
    
    return NextResponse.json(results);
    
  } catch (error: any) {
    // Log error
    logger.apiError(request.method, request.url, error, userId);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```
*/ 