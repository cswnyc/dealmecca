import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recordSearch, canUserSearch } from '@/lib/auth'
import { createAuthError, createSearchLimitError, createInternalError } from '@/lib/api-responses'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Companies API called')
    
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const userTier = request.headers.get('x-user-tier')
    
    console.log('👤 User info:', { userId, userRole, userTier })
    
    if (!userId) {
      console.log('❌ No user ID found')
      return createAuthError()
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type')
    const industry = searchParams.get('industry')
    const minEmployees = searchParams.get('minEmployees')
    const maxEmployees = searchParams.get('maxEmployees')
    const headquarters = searchParams.get('headquarters')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('📊 Search params:', { query, type, industry, page, limit })

    // Check if user can search
    console.log('🔒 Checking search permissions...')
    const canSearch = await canUserSearch(userId)
    console.log('🔒 Can search:', canSearch)
    
    if (!canSearch) {
      console.log('❌ Search limit exceeded')
      // Get user details for limit error
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
    }

    console.log('🔍 Building search query...')
    
    // Build where clause
    const where: any = {}

    // Add text search using Prisma (PostgreSQL compatible)
    if (query && query.length > 0) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { industry: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (industry) {
      where.industry = { equals: industry }
    }

    if (minEmployees) {
      where.employeeCount = {
        gte: parseInt(minEmployees)
      }
    }

    if (maxEmployees) {
      where.employeeCount = {
        lte: parseInt(maxEmployees)
      }
    }

    if (headquarters) {
      where.headquarters = { contains: headquarters, mode: 'insensitive' }
    }

    if (type) {
      where.companyType = { equals: type }
    }

    console.log('🔍 Search where clause:', JSON.stringify(where, null, 2))
    console.log('📊 Executing database query...')

    // Execute query with pagination using Prisma
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: { contacts: true }
          },
          contacts: {
            where: { isDecisionMaker: true },
            take: 3,
            orderBy: { firstName: 'asc' },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              fullName: true,
              title: true,
              email: true,
              isDecisionMaker: true,
              department: true,
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.company.count({ where })
    ])

    console.log('✅ Query successful:', { companiesFound: companies.length, total })

    // Record search if query was provided
    if (query) {
      console.log('📝 Recording search...')
      await recordSearch(userId, query, companies.length, 'companies')
      console.log('✅ Search recorded')
    }

    console.log('🎉 Returning response')
    return NextResponse.json({
      companies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('❌ Companies API error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Return detailed error information for debugging
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No details available',
      timestamp: new Date().toISOString()
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