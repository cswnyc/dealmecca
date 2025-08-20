import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recordSearch, canUserSearch } from '@/lib/auth'
import { createAuthError, createSearchLimitError, createInternalError } from '@/lib/api-responses'
import type { Prisma } from '@prisma/client'

// Enum mapping functions (same as admin contacts API)
function mapDepartmentValue(inputDepartment?: string): string | undefined {
  if (!inputDepartment) return undefined;
  
  const departmentMappings: Record<string, string> = {
    'media planning': 'MEDIA_PLANNING',
    'media buying': 'MEDIA_BUYING', 
    'digital marketing': 'DIGITAL_MARKETING',
    'programmatic': 'PROGRAMMATIC',
    'social media': 'SOCIAL_MEDIA',
    'search marketing': 'SEARCH_MARKETING',
    'strategy planning': 'STRATEGY_PLANNING',
    'strategy': 'STRATEGY_PLANNING',
    'analytics insights': 'ANALYTICS_INSIGHTS',
    'analytics': 'ANALYTICS_INSIGHTS',
    'creative services': 'CREATIVE_SERVICES',
    'creative': 'CREATIVE_SERVICES',
    'account management': 'ACCOUNT_MANAGEMENT',
    'account': 'ACCOUNT_MANAGEMENT',
    'business development': 'BUSINESS_DEVELOPMENT',
    'operations': 'OPERATIONS',
    'technology': 'TECHNOLOGY',
    'tech': 'TECHNOLOGY',
    'finance': 'FINANCE',
    'leadership': 'LEADERSHIP',
    'marketing': 'DIGITAL_MARKETING'
  };
  
  const normalized = inputDepartment.toLowerCase().trim();
  return departmentMappings[normalized] || undefined;
}

function mapSeniorityValue(inputSeniority?: string): string | undefined {
  if (!inputSeniority) return undefined;
  
  const seniorityMappings: Record<string, string> = {
    'intern': 'INTERN',
    'coordinator': 'COORDINATOR',
    'specialist': 'SPECIALIST',
    'senior specialist': 'SENIOR_SPECIALIST',
    'manager': 'MANAGER',
    'senior manager': 'SENIOR_MANAGER',
    'director': 'DIRECTOR',
    'senior director': 'SENIOR_DIRECTOR',
    'vp': 'VP',
    'vice president': 'VP',
    'svp': 'SVP',
    'evp': 'EVP',
    'c level': 'C_LEVEL',
    'c-level': 'C_LEVEL',
    'ceo': 'C_LEVEL',
    'cmo': 'C_LEVEL',
    'cfo': 'C_LEVEL',
    'founder owner': 'FOUNDER_OWNER',
    'founder': 'FOUNDER_OWNER',
    'owner': 'FOUNDER_OWNER',
    'unknown': 'SPECIALIST' // Default fallback
  };
  
  const normalized = inputSeniority.toLowerCase().trim();
  return seniorityMappings[normalized] || 'SPECIALIST'; // Always provide a fallback
}

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

    // Add text search - copy exact pattern from working admin route
    if (query && query.trim().length > 0) {
      where.OR = [
        { fullName: { contains: query, mode: 'insensitive' as const } },
        { firstName: { contains: query, mode: 'insensitive' as const } },
        { lastName: { contains: query, mode: 'insensitive' as const } },
        { title: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
      ]
    }

    // Add additional filters
    if (title) {
      where.title = { contains: title, mode: 'insensitive' as const }
    }

    if (department) {
      where.department = { contains: department, mode: 'insensitive' as const }
    }

    if (company) {
      where.company = {
        name: { contains: company, mode: 'insensitive' as const }
      }
    }

    if (seniority) {
      where.seniority = seniority
    }

    if (isDecisionMaker) {
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
        department: mapDepartmentValue(department) as any,
        seniority: (mapSeniorityValue(seniority) || 'SPECIALIST') as any, // Use valid enum value
        dataQuality: 'BASIC', // Set default data quality
        isActive: true, // Set default active status
        verified: false // Set default verification status
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error: any) {
    console.error('Create contact error:', error)
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('email')) {
        return NextResponse.json(
          { error: 'A contact with this email already exists' },
          { status: 409 }
        )
      } else if (target?.includes('firstName') && target?.includes('lastName') && target?.includes('companyId')) {
        return NextResponse.json(
          { error: 'A contact with this name already exists at this company' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'This contact already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 