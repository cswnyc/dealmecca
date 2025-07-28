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
    const title = searchParams.get('title')
    const department = searchParams.get('department')
    const company = searchParams.get('company')
    const seniority = searchParams.get('seniority')
    const isDecisionMaker = searchParams.get('isDecisionMaker')
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

    console.log('🔍 Building contacts search query...')
    
    // Build where clause with simpler query approach
    let where: any = {}

    // Add text search using simpler Prisma syntax
    if (query && query.length > 0) {
      // Use simpler text search that's more compatible
      where = {
        OR: [
          { firstName: { startsWith: query, mode: 'insensitive' } },
          { lastName: { startsWith: query, mode: 'insensitive' } },
          { fullName: { startsWith: query, mode: 'insensitive' } },
          { title: { startsWith: query, mode: 'insensitive' } },
          { department: { startsWith: query, mode: 'insensitive' } },
        ]
      }
    }

    // Add additional filters
    if (title) {
      where.title = { startsWith: title, mode: 'insensitive' }
    }

    if (department) {
      where.department = { startsWith: department, mode: 'insensitive' }
    }

    if (company) {
      where.company = {
        name: { startsWith: company, mode: 'insensitive' }
      }
    }

    if (seniority) {
      where.seniority = seniority
    }

    if (isDecisionMaker !== undefined) {
      where.isDecisionMaker = isDecisionMaker === 'true'
    }

    console.log('📊 Contacts query where clause:', JSON.stringify(where, null, 2))

    // Get total count with error handling
    let totalCount = 0
    try {
      totalCount = await prisma.contact.count({ where })
      console.log('📊 Total contacts found:', totalCount)
    } catch (countError) {
      console.error('❌ Count query error:', countError)
      // Fallback: try basic count without filters
      try {
        totalCount = await prisma.contact.count()
        console.log('📊 Fallback total count:', totalCount)
      } catch (fallbackError) {
        console.error('❌ Fallback count error:', fallbackError)
        totalCount = 0
      }
    }

    // Get contacts with error handling
    let contacts = []
    try {
      contacts = await prisma.contact.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
              companyType: true
            }
          }
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          firstName: 'asc'
        }
      })
      console.log('✅ Contacts query successful, found:', contacts.length)
    } catch (queryError) {
      console.error('❌ Contacts query error:', queryError)
      
      // Return error with details
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        message: queryError instanceof Error ? queryError.message : 'Unknown query error',
        details: {
          query: where,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 })
    }

    // Record search if query was provided
    if (query) {
      await recordSearch(userId, query, contacts.length, 'contacts')
    }

    return NextResponse.json({
      contacts,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    })

  } catch (error) {
    console.error('❌ Contacts API error:', error)
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      companyId,
      name,
      title,
      email,
      phone,
      linkedinUrl,
      isDecisionMaker,
      department,
      seniority,
    } = body

    const contact = await prisma.contact.create({
      data: {
        companyId,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        fullName: name,
        name, // Keep for backward compatibility
        title,
        email,
        phone,
        linkedinUrl,
        isDecisionMaker,
        department,
        seniority: seniority || 'UNKNOWN',
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Create contact error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 