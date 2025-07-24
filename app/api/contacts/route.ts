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

    // Build where clause
    const where: any = {}

    // For SQLite compatibility, use raw SQL for text search
    if (query && query.length > 0) {
      const searchResults = await prisma.$queryRaw`
        SELECT c.*, comp.name as companyName FROM contacts c
        LEFT JOIN companies comp ON c.companyId = comp.id
        WHERE c.name LIKE ${`%${query}%`} 
           OR c.title LIKE ${`%${query}%`}
           OR c.department LIKE ${`%${query}%`}
           OR comp.name LIKE ${`%${query}%`}
        ORDER BY c.name ASC
        LIMIT ${limit}
        OFFSET ${(page - 1) * limit}
      ` as any[]
      
      // Count total results
      const countResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM contacts c
        LEFT JOIN companies comp ON c.companyId = comp.id
        WHERE c.name LIKE ${`%${query}%`} 
           OR c.title LIKE ${`%${query}%`}
           OR c.department LIKE ${`%${query}%`}
           OR comp.name LIKE ${`%${query}%`}
      ` as any[]

      const total = countResult[0]?.count || 0

      // Record search
      await recordSearch(userId, query, searchResults.length, 'contacts')

      return NextResponse.json({
        contacts: searchResults,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      })
    }

    if (title) {
      where.title = { equals: title }
    }

    if (department) {
      where.department = { equals: department }
    }

    if (isDecisionMaker !== null) {
      where.isDecisionMaker = isDecisionMaker === 'true'
    }

    // Execute query with pagination
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.contact.count({ where })
    ])

    // Record search if query was provided
    if (query) {
      await recordSearch(userId, query, contacts.length, 'contacts')
    }

    return NextResponse.json({
      contacts,
      total,
        page,
        limit,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Contacts API error:', error)
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