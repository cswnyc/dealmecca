import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recordSearch, canUserSearch } from '@/lib/auth'
import { createAuthError, createSearchLimitError, createInternalError } from '@/lib/api-responses'

export async function GET(request: NextRequest) {
  console.log('🔍 Companies API called - Start')
  
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id') || undefined
    const userRole = request.headers.get('x-user-role')
    const userTier = request.headers.get('x-user-tier')
    
    console.log('👤 User info from headers:', { userId, userRole, userTier })
    
    // TEMPORARY: Allow requests without user ID for debugging
    if (!userId) {
      console.log('⚠️ No user ID found in headers - proceeding without authentication (DEBUG MODE)')
    }

    /*
    if (!userId) {
      console.log('❌ No user ID found in headers')
      return createAuthError({
        message: 'No user authentication found',
        helpText: 'Please sign in to access search features'
      })
    }
    */

    // Parse search parameters
    let searchParams
    try {
      searchParams = new URL(request.url).searchParams
    } catch (error) {
      console.error('❌ Error parsing URL:', error)
      return NextResponse.json({
        success: false,
        error: 'Invalid request URL',
        message: error instanceof Error ? error.message : 'URL parsing failed'
      }, { status: 400 })
    }

    const query = searchParams.get('q') || ''
    const type = searchParams.get('type')
    const industry = searchParams.get('industry')
    const minEmployees = searchParams.get('minEmployees')
    const maxEmployees = searchParams.get('maxEmployees')
    const headquarters = searchParams.get('headquarters')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('📊 Search params parsed:', { query, type, industry, page, limit })

    // Check if user can search
    console.log('🔒 Checking search permissions for user:', userId)
    let canSearch = true // TEMPORARY: Skip search permission check for debugging
    
    /*
    if (userId) {
      try {
        canSearch = await canUserSearch(userId)
        console.log('🔒 Can search result:', canSearch)
      } catch (error) {
        console.error('❌ Error checking search permissions:', error)
        return NextResponse.json({
          success: false,
          error: 'Authentication check failed',
          message: error instanceof Error ? error.message : 'Unknown auth error',
          details: error instanceof Error ? error.stack : null
        }, { status: 500 })
      }
    } else {
      console.log('🔒 No userId - allowing search for debugging')
      canSearch = true
    }
    */
    
    if (!canSearch) {
      console.log('❌ Search limit exceeded for user:', userId)
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { searchesUsed: true, subscriptionTier: true, searchesResetAt: true }
        })
        
        const searchLimit = user?.subscriptionTier === 'FREE' ? 10 : 100
        const resetDate = user?.searchesResetAt ? new Date(user.searchesResetAt).toLocaleDateString() : undefined
        
        return createSearchLimitError({
          currentUsage: user?.searchesUsed || 0,
          limit: searchLimit,
          tier: userTier || 'FREE',
          resetDate
        })
      } catch (error) {
        console.error('❌ Error getting user search limits:', error)
        return NextResponse.json({
          success: false,
          error: 'Failed to check search limits',
          message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    console.log('🔍 Building search query...')
    
    // Build where clause with error handling
    let where: any = {}
    try {
      if (query && query.length > 0) {
        where = {
          OR: [
            { name: { startsWith: query, mode: 'insensitive' } },
            { name: { endsWith: query, mode: 'insensitive' } },
            { description: { startsWith: query, mode: 'insensitive' } },
          ]
        }
      }

      // Add additional filters
      if (industry) {
        where.industry = industry
      }

      if (minEmployees) {
        where.employeeCount = {
          gte: parseInt(minEmployees)
        }
      }

      if (maxEmployees) {
        where.employeeCount = {
          ...where.employeeCount,
          lte: parseInt(maxEmployees)
        }
      }

      if (headquarters) {
        where.OR = [
          ...(where.OR || []),
          { city: { startsWith: headquarters, mode: 'insensitive' } },
          { state: { startsWith: headquarters, mode: 'insensitive' } },
          { country: { startsWith: headquarters, mode: 'insensitive' } }
        ]
      }

      console.log('📊 Query where clause built:', JSON.stringify(where, null, 2))
    } catch (error) {
      console.error('❌ Error building query where clause:', error)
      return NextResponse.json({
        success: false,
        error: 'Query building failed',
        message: error instanceof Error ? error.message : 'Unknown query error'
      }, { status: 500 })
    }

    // Get total count with error handling
    let totalCount = 0
    try {
      totalCount = await prisma.company.count({ where })
      console.log('📊 Total companies found:', totalCount)
    } catch (countError) {
      console.error('❌ Count query error:', countError)
      try {
        totalCount = await prisma.company.count()
        console.log('📊 Fallback total count:', totalCount)
      } catch (fallbackError) {
        console.error('❌ Fallback count error:', fallbackError)
        return NextResponse.json({
          success: false,
          error: 'Database count query failed',
          message: fallbackError instanceof Error ? fallbackError.message : 'Count query error'
        }, { status: 500 })
      }
    }

    // Get companies with error handling
    let companies = []
    try {
      companies = await prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          website: true,
          logoUrl: true,
          industry: true,
          employeeCount: true,
          city: true,
          state: true,
          country: true,
          companyType: true,
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          name: 'asc'
        }
      })
      console.log('✅ Companies query successful, found:', companies.length)
    } catch (queryError) {
      console.error('❌ Companies query error:', queryError)
      
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        message: queryError instanceof Error ? queryError.message : 'Unknown query error',
        details: {
          query: where,
          stack: queryError instanceof Error ? queryError.stack : null,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 })
    }

    // Record search if query was provided
    if (query && userId) {
      /*
      try {
        await recordSearch(userId, query, companies.length, 'companies')
        console.log('✅ Search recorded successfully')
      } catch (error) {
        console.error('⚠️ Failed to record search (non-critical):', error)
        // Don't fail the request if search recording fails
      }
      */
      console.log('📝 Search recording temporarily disabled for debugging')
    }

    console.log('✅ Companies API request completed successfully')
    return NextResponse.json({
      companies,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    })

  } catch (error) {
    console.error('❌ Unhandled error in companies API:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : null
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    
    if (!userId || userRole !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Admin access required',
        message: 'Only administrators can create new companies'
      }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      type,
      industry,
      description,
      website,
      employeeCount,
      headquarters,
      revenue,
      parentCompany,
    } = body

    const company = await prisma.company.create({
      data: {
        name,
        slug: `${(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`,
        companyType: type,
        industry,
        description,
        website,
        employeeCount,
        headquarters,
        revenue,
        parentCompany,
      } as any,
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Create company error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 