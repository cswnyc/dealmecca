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

    // Add text search using Prisma (PostgreSQL compatible)
    if (query && query.length > 0) {
      where.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { title: { contains: query, mode: 'insensitive' } },
        { department: { contains: query, mode: 'insensitive' } },
        { company: { name: { contains: query, mode: 'insensitive' } } }
      ]
    }

    if (title) {
      where.title = { contains: title, mode: 'insensitive' }
    }

    if (department) {
      where.department = { equals: department }
    }

    if (isDecisionMaker !== null) {
      where.isDecisionMaker = isDecisionMaker === 'true'
    }

    // Execute query with pagination using Prisma
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
        orderBy: { firstName: 'asc' }
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