import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recordSearch, canUserSearch } from '@/lib/auth'
import { createAuthError, createSearchLimitError, createInternalError } from '@/lib/api-responses'

export async function GET(request: NextRequest) {
  console.log('🚀 === COMPANIES API START ===')
  console.log('🚀 Request URL:', request.url)
  console.log('🚀 Request method:', request.method)
  
  // STEP 1: Test simple response first
  const testMode = request.nextUrl.searchParams.get('test')
  if (testMode === 'simple') {
    console.log('🧪 Simple test mode - returning basic response')
    return NextResponse.json({ success: true, message: 'Simple test works', timestamp: new Date().toISOString() })
  }
  
  try {
    console.log('🚀 Step 1: Extracting headers')
    
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id') || undefined
    const userRole = request.headers.get('x-user-role')
    const userTier = request.headers.get('x-user-tier')
    
    console.log('👤 User info from headers:', { userId, userRole, userTier })
    
    // TEMPORARY: Allow requests without user ID for debugging
    if (!userId) {
      console.log('⚠️ No user ID found in headers - proceeding without authentication (DEBUG MODE)')
    }

    console.log('🚀 Step 2: Parsing URL parameters')
    
    // Parse search parameters
    let searchParams
    try {
      searchParams = new URL(request.url).searchParams
      console.log('✅ URL parsing successful')
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

    console.log('🚀 Step 3: Database connection test')
    
    // Test basic database connection before anything else
    try {
      const healthCheck = await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ Database connection successful:', healthCheck)
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        message: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }

    console.log('🚀 Step 4: Building query (simplified)')
    
    // Build where clause with error handling
    let where: any = {}
    try {
      if (query && query.length > 0) {
        where = {
          name: {
            startsWith: query,
            mode: 'insensitive'
          }
        }
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

    console.log('🚀 Step 5: Executing count query')
    
    // Get total count with error handling
    let totalCount = 0
    try {
      totalCount = await prisma.company.count({ where })
      console.log('📊 Total companies found:', totalCount)
    } catch (countError) {
      console.error('❌ Count query error:', countError)
      return NextResponse.json({
        success: false,
        error: 'Database count query failed',
        message: countError instanceof Error ? countError.message : 'Count query error',
        stack: countError instanceof Error ? countError.stack : null
      }, { status: 500 })
    }

    console.log('🚀 Step 6: Executing main query')
    
    // Get companies with error handling
    let companies = []
    try {
      companies = await prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          industry: true,
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
      console.error('❌ Query error stack:', queryError instanceof Error ? queryError.stack : 'No stack')
      
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        message: queryError instanceof Error ? queryError.message : 'Unknown query error',
        stack: queryError instanceof Error ? queryError.stack : null,
        details: {
          query: where,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 })
    }

    console.log('🚀 Step 7: Preparing response')
    
    const response = {
      companies,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      debug: {
        userId: userId || 'none',
        queryLength: query.length,
        timestamp: new Date().toISOString()
      }
    }

    console.log('✅ Companies API request completed successfully')
    console.log('🚀 === COMPANIES API END ===')
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ === UNHANDLED ERROR IN COMPANIES API ===')
    console.error('❌ Error:', error)
    console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown')
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('❌ Error constructor:', error instanceof Error ? error.constructor.name : 'Unknown')
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : null,
      details: {
        timestamp: new Date().toISOString(),
        constructor: error instanceof Error ? error.constructor.name : 'Unknown'
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