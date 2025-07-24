import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CompanySearchParams {
  q?: string;                    // Text search
  companyType?: string[];        // Company type filter
  agencyType?: string[];         // Agency type filter  
  industry?: string[];           // Industry filter
  city?: string[];              // City filter
  state?: string[];             // State filter
  region?: string[];            // Region filter
  employeeCount?: string[];     // Size filter
  verified?: boolean;           // Verification filter
  hasContacts?: boolean;        // Has contacts filter
  sortBy?: string;              // Sort method
  limit?: number;               // Results limit
  offset?: number;              // Pagination offset
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  let params: CompanySearchParams | undefined;
  
  console.log(`🔵 [${requestId}] Companies API - Request started`);
  
  try {
    // 1. Authentication check
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userTier = request.headers.get('x-user-tier');
    
    if (!userId) {
      console.log(`🔒 [${requestId}] Authentication failed - no user ID`);
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    console.log(`✅ [${requestId}] User authenticated: ${userId}`);

    // 2. Parse and validate request parameters
    const { searchParams } = new URL(request.url);
    
    // Input validation
    const rawPage = searchParams.get('page');
    const rawLimit = searchParams.get('limit');
    const rawOffset = searchParams.get('offset');
    
    let page = 1;
    let limit = 25;
    let offset = 0;

    // Validate pagination parameters
    if (rawPage) {
      const parsedPage = parseInt(rawPage);
      if (isNaN(parsedPage) || parsedPage < 1) {
        console.log(`❌ [${requestId}] Invalid page parameter: ${rawPage}`);
        return NextResponse.json({
          success: false,
          error: 'Invalid page parameter. Must be a positive integer.',
          code: 'INVALID_PAGINATION'
        }, { status: 400 });
      }
      page = parsedPage;
    }

    if (rawLimit) {
      const parsedLimit = parseInt(rawLimit);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        console.log(`❌ [${requestId}] Invalid limit parameter: ${rawLimit}`);
        return NextResponse.json({
          success: false,
          error: 'Invalid limit parameter. Must be between 1 and 100.',
          code: 'INVALID_PAGINATION'
        }, { status: 400 });
      }
      limit = parsedLimit;
    }

    if (rawOffset) {
      const parsedOffset = parseInt(rawOffset);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        console.log(`❌ [${requestId}] Invalid offset parameter: ${rawOffset}`);
        return NextResponse.json({
          success: false,
          error: 'Invalid offset parameter. Must be a non-negative integer.',
          code: 'INVALID_PAGINATION'
        }, { status: 400 });
      }
      offset = parsedOffset;
    } else {
      // Calculate offset from page if offset not provided
      offset = (page - 1) * limit;
    }

    // Validate search query length
    const query = searchParams.get('q');
    if (query && query.length > 200) {
      console.log(`❌ [${requestId}] Search query too long: ${query.length} characters`);
      return NextResponse.json({
        success: false,
        error: 'Search query too long. Maximum 200 characters allowed.',
        code: 'INVALID_QUERY'
      }, { status: 400 });
    }

    // Parse all search parameters with validation
    params = {
      q: query || undefined,
      companyType: searchParams.getAll('companyType').filter(Boolean),
      agencyType: searchParams.getAll('agencyType').filter(Boolean),
      industry: searchParams.getAll('industry').filter(Boolean),
      city: searchParams.getAll('city').filter(Boolean),
      state: searchParams.getAll('state').filter(Boolean),
      region: searchParams.getAll('region').filter(Boolean),
      employeeCount: searchParams.getAll('employeeCount').filter(Boolean),
      verified: searchParams.get('verified') === 'true',
      hasContacts: searchParams.get('hasContacts') === 'true',
      sortBy: searchParams.get('sortBy') || 'relevance',
      limit: limit,
      offset: offset
    };

    console.log(`📊 [${requestId}] Search parameters:`, {
      query: params.q,
      companyType: params.companyType,
      page,
      limit,
      offset,
      sortBy: params.sortBy
    });

    // 3. Database connection check
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`💾 [${requestId}] Database connection verified`);
    } catch (dbError) {
      console.error(`❌ [${requestId}] Database connection failed:`, dbError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed. Please try again later.',
        code: 'DATABASE_ERROR'
      }, { status: 503 });
    }
    // Build dynamic where clause
    const where: { AND: Array<Record<string, unknown>> } = { AND: [] };

    // Text search across multiple fields
    if (params.q && typeof params.q === 'string') {
      if (params.q.length >= 2) {
        const searchTerm = params.q.toLowerCase();
        where.AND.push({
          OR: [
            { name: { startsWith: searchTerm } },
            { name: { endsWith: searchTerm } },
            { description: { startsWith: searchTerm } },
            { description: { endsWith: searchTerm } },
            { city: { startsWith: searchTerm } },
            { city: { endsWith: searchTerm } },
            { state: { startsWith: searchTerm } },
            { state: { endsWith: searchTerm } }
          ]
        });
      } else if (params.q.length > 0) {
        // If query is too short but not empty, return no results
        where.AND.push({ id: { equals: null } });
      }
    }

    // Company type filter
    if (params.companyType?.length) {
      where.AND.push({
        companyType: { in: params.companyType }
      });
    }

    // Agency type filter
    if (params.agencyType?.length) {
      where.AND.push({
        agencyType: { in: params.agencyType }
      });
    }

    // Industry filter
    if (params.industry?.length) {
      where.AND.push({
        industry: { in: params.industry }
      });
    }

    // Location filters
    if (params.city?.length) {
      where.AND.push({
        city: { in: params.city }
      });
    }

    if (params.state?.length) {
      where.AND.push({
        state: { in: params.state }
      });
    }

    if (params.region?.length) {
      where.AND.push({
        region: { in: params.region }
      });
    }

    // Employee count filter
    if (params.employeeCount?.length) {
      where.AND.push({
        employeeCount: { in: params.employeeCount }
      });
    }

    // Verification filter
    if (params.verified !== undefined) {
      where.AND.push({
        verified: params.verified
      });
    }

    // Has contacts filter
    if (params.hasContacts) {
      where.AND.push({
        contacts: {
          some: {}
        }
      });
    }

    // Build order by clause
    let orderBy: any = [];
    switch (params.sortBy) {
      case 'name':
        orderBy = [{ name: 'asc' }];
        break;
      case 'location':
        orderBy = [{ state: 'asc' }, { city: 'asc' }, { name: 'asc' }];
        break;
      case 'size':
        orderBy = [{ employeeCount: 'desc' }, { name: 'asc' }];
        break;
      case 'verified':
        orderBy = [{ verified: 'desc' }, { name: 'asc' }];
        break;
      case 'recent':
        orderBy = [{ updatedAt: 'desc' }];
        break;
      default: // relevance
        orderBy = [
          { verified: 'desc' },
          { dataQuality: 'desc' },
          { name: 'asc' }
        ];
    }

    // Execute search with includes
    const [companies, totalCount] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: {
              contacts: {
                where: { isActive: true }
              },
              subsidiaries: true
            }
          },
          parentCompany: {
            select: {
              id: true,
              name: true,
              companyType: true
            }
          }
        },
        orderBy,
        take: params.limit,
        skip: params.offset
      }),
      prisma.company.count({ where })
    ]);

    // 5. Generate search facets for filtering UI
    let facets = {};
    try {
      console.log(`🔍 [${requestId}] Generating search facets...`);
      facets = await generateSearchFacets(where);
      console.log(`✅ [${requestId}] Facets generated successfully`);
    } catch (facetError) {
      console.error(`⚠️ [${requestId}] Failed to generate facets (non-critical):`, facetError);
      // Continue without facets - this is non-critical
    }

    // 6. Track search analytics (non-blocking)
    try {
      await trackSearchAnalytics(userId, params, totalCount);
      console.log(`📈 [${requestId}] Search analytics tracked`);
    } catch (analyticsError) {
      console.error(`⚠️ [${requestId}] Failed to track analytics (non-critical):`, analyticsError);
      // Continue without analytics - this is non-critical
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Search completed successfully in ${duration}ms - Found ${totalCount} companies`);

    return NextResponse.json({
      success: true,
      companies,
      totalCount,
      facets,
      pagination: {
        page: Math.floor(params.offset! / params.limit!) + 1,
        limit: params.limit,
        offset: params.offset,
        total: totalCount,
        totalPages: Math.ceil(totalCount / params.limit!),
        hasMore: totalCount > (params.offset! + params.limit!),
        hasNextPage: totalCount > (params.offset! + params.limit!),
        hasPrevPage: params.offset! > 0
      },
      searchParams: params,
      metadata: {
        requestId,
        duration,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorInfo = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : {
      message: String(error),
      stack: undefined,
      name: 'UnknownError'
    };

    console.error(`❌ [${requestId}] Companies search failed after ${duration}ms:`, {
      error: errorInfo,
      params: {
        query: params?.q,
        companyType: params?.companyType,
        limit: params?.limit,
        offset: params?.offset
      }
    });

    // Determine appropriate error response based on error type
    let statusCode = 500;
    let errorMessage = 'Internal server error occurred';
    let errorCode = 'INTERNAL_ERROR';

    if (errorInfo.message.includes('P2002')) {
      // Prisma unique constraint error
      statusCode = 409;
      errorMessage = 'Duplicate data conflict';
      errorCode = 'DUPLICATE_ERROR';
    } else if (errorInfo.message.includes('P2025')) {
      // Prisma record not found
      statusCode = 404;
      errorMessage = 'Requested data not found';
      errorCode = 'NOT_FOUND';
    } else if (errorInfo.message.includes('P1001') || errorInfo.message.includes('ECONNREFUSED')) {
      // Database connection error
      statusCode = 503;
      errorMessage = 'Database temporarily unavailable';
      errorCode = 'DATABASE_UNAVAILABLE';
    } else if (errorInfo.message.includes('timeout') || errorInfo.message.includes('ETIMEDOUT')) {
      // Timeout error
      statusCode = 504;
      errorMessage = 'Request timeout - please try again';
      errorCode = 'TIMEOUT';
    } else if (errorInfo.message.includes('Invalid') || errorInfo.message.includes('validation')) {
      // Validation error
      statusCode = 400;
      errorMessage = 'Invalid request parameters';
      errorCode = 'VALIDATION_ERROR';
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      code: errorCode,
      metadata: {
        requestId,
        duration,
        timestamp: new Date().toISOString()
      }
    }, { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`🔵 [${requestId}] Companies API POST - Request started`);
  
  try {
    // Authentication check
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userTier = request.headers.get('x-user-tier');
    
    if (!userId) {
      console.log(`🔒 [${requestId}] Authentication failed - no user ID`);
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error(`❌ [${requestId}] Invalid JSON body:`, parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON'
      }, { status: 400 });
    }

    console.log(`📊 [${requestId}] POST search parameters:`, body);

    // For now, return method not allowed - implement if needed
    return NextResponse.json({
      success: false,
      error: 'POST method not implemented yet. Use GET method for searches.',
      code: 'METHOD_NOT_IMPLEMENTED',
      metadata: {
        requestId,
        timestamp: new Date().toISOString()
      }
    }, { status: 501 });

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorInfo = error instanceof Error ? {
      message: error.message,
      name: error.name
    } : {
      message: String(error),
      name: 'UnknownError'
    };

    console.error(`❌ [${requestId}] Companies POST search failed after ${duration}ms:`, errorInfo);

    return NextResponse.json({
      success: false,
      error: 'Failed to process search request',
      code: 'INTERNAL_ERROR',
      metadata: {
        requestId,
        duration,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

// Generate facets for dynamic filtering
async function generateSearchFacets(baseWhere: Record<string, unknown>) {
  try {
    // Use aggregation queries to get facets
    const [companyTypes, industries, sizes, locations] = await Promise.all([
      // Company types with counts
      prisma.company.findMany({
        where: baseWhere,
        select: { companyType: true },
        distinct: ['companyType']
      }),
      
      // Industries with counts
      prisma.company.findMany({
        where: { ...baseWhere, industry: { not: null } },
        select: { industry: true },
        distinct: ['industry']
      }),
      
      // Employee counts with counts
      prisma.company.findMany({
        where: { ...baseWhere, employeeCount: { not: null } },
        select: { employeeCount: true },
        distinct: ['employeeCount']
      }),
      
      // Locations with counts
      prisma.company.findMany({
        where: { ...baseWhere, city: { not: null }, state: { not: null } },
        select: { city: true, state: true },
        distinct: ['city', 'state'],
        take: 20
      })
    ]);

    return {
      companyTypes: companyTypes.map(ct => ({
        type: ct.companyType,
        label: ct.companyType.replace(/_/g, ' '),
        count: 1 // We'd need separate count queries for exact counts
      })),
      locations: locations.map(loc => ({
        location: `${loc.city}, ${loc.state}`,
        city: loc.city,
        state: loc.state,
        count: 1
      })),
      industries: industries.map(ind => ({
        industry: ind.industry,
        label: ind.industry?.replace(/_/g, ' ') || 'Other',
        count: 1
      })),
      sizes: sizes.map(size => ({
        size: size.employeeCount,
        label: size.employeeCount?.replace(/_/g, ' ') || 'Unknown',
        count: 1
      }))
    };
  } catch (error) {
    console.error('Error generating facets:', error);
    return {
      companyTypes: [],
      locations: [],
      industries: [],
      sizes: []
    };
  }
}

// Track search analytics
async function trackSearchAnalytics(userId: string, params: CompanySearchParams, resultCount: number) {
  try {
    await prisma.search.create({
      data: {
        userId,
        query: params.q || '',
        resultsCount: resultCount,
        searchType: 'company'
      }
    });
  } catch (error) {
    console.error('Error tracking search analytics:', error);
  }
} 