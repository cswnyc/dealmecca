import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recordSearch, canUserSearch } from '@/lib/auth'
import { createAuthError, createSearchLimitError, createInternalError } from '@/lib/api-responses'

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const userTier = request.headers.get('x-user-tier')
    
    if (!userId) {
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

    // Check if user can search
    if (!(await canUserSearch(userId))) {
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

    // Build where clause
    const where: any = {}

    // For SQLite compatibility, use raw SQL for text search
    if (query && query.length > 0) {
      const searchResults = await prisma.$queryRaw`
        SELECT * FROM companies 
        WHERE name LIKE ${`%${query}%`} 
           OR description LIKE ${`%${query}%`}
           OR industry LIKE ${`%${query}%`}
        ORDER BY name ASC
        LIMIT ${limit}
        OFFSET ${(page - 1) * limit}
      ` as any[]
      
      // Count total results
      const countResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM companies 
        WHERE name LIKE ${`%${query}%`} 
           OR description LIKE ${`%${query}%`}
           OR industry LIKE ${`%${query}%`}
      ` as any[]

      const total = countResult[0]?.count || 0

      // Record search
      await recordSearch(userId, query, searchResults.length, 'companies')

      return NextResponse.json({
        companies: searchResults,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      })
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
      where.headquarters = { equals: headquarters }
    }

    if (type) {
      where.type = { equals: type }
    }

    // Execute query with pagination
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
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
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

    // Record search if query was provided
    if (query) {
      await recordSearch(userId, query, companies.length, 'companies')
    }

    return NextResponse.json({
      companies,
      total,
        page,
        limit,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Companies API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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