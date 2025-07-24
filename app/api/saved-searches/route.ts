import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createAuthError, createInternalError } from '@/lib/api-responses'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id')
    const userTier = request.headers.get('x-user-tier')
    
    if (!userId) {
      return createAuthError()
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // TODO: Enable when schema is updated
    // const [savedSearches, total] = await Promise.all([
    //   prisma.savedSearch.findMany({
    //     where: { userId },
    //     orderBy: { lastRun: 'desc' },
    //     skip: offset,
    //     take: limit
    //   }),
    //   prisma.savedSearch.count({ where: { userId } })
    // ])

    // Mock saved searches for now
    const mockSavedSearches = [
      {
        id: '1',
        name: 'Fortune 500 Advertisers',
        query: 'large advertisers',
        filters: JSON.stringify({
          companyType: ['ADVERTISER'],
          employeeCount: { min: 1000, max: 100000 },
          revenueRange: { min: 100000000, max: 10000000000 }
        }),
        alertEnabled: true,
        lastRun: new Date().toISOString(),
        resultCount: 247,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Digital Agencies - NYC',
        query: 'digital agencies New York',
        filters: JSON.stringify({
          companyType: ['AGENCY'],
          industry: ['Digital Advertising'],
          headquarters: ['New York']
        }),
        alertEnabled: false,
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        resultCount: 89,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({
      savedSearches: mockSavedSearches,
      pagination: {
        page,
        limit,
        total: mockSavedSearches.length,
        totalPages: Math.ceil(mockSavedSearches.length / limit)
      }
    })
  } catch (error) {
    console.error('Saved searches API error:', error)
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
    const userTier = request.headers.get('x-user-tier')
    
    if (!userId) {
      return createAuthError()
    }

    const body = await request.json()
    const { name, query, filters, alertEnabled = false } = body

    // Validate required fields
    if (!name || !query) {
      return NextResponse.json(
        { error: 'Name and query are required' },
        { status: 400 }
      )
    }

    // Check if user has reached saved search limit for their tier
    const maxSavedSearches = userTier === 'FREE' ? 3 : userTier === 'PRO' ? 25 : 100
    
    // TODO: Enable when schema is updated
    // const existingCount = await prisma.savedSearch.count({
    //   where: { userId }
    // })
    
    // if (existingCount >= maxSavedSearches) {
    //   return NextResponse.json(
    //     { 
    //       error: 'Saved search limit reached', 
    //       message: `${userTier} users are limited to ${maxSavedSearches} saved searches.`,
    //       upgradeUrl: userTier === 'FREE' ? '/upgrade' : null
    //     },
    //     { status: 403 }
    //   )
    // }

    // TODO: Enable when schema is updated
    // const savedSearch = await prisma.savedSearch.create({
    //   data: {
    //     userId,
    //     name,
    //     query,
    //     filters: JSON.stringify(filters),
    //     alertEnabled
    //   }
    // })

    // Mock saved search creation
    const savedSearch = {
      id: Date.now().toString(),
      userId,
      name,
      query,
      filters: JSON.stringify(filters),
      alertEnabled,
      lastRun: new Date().toISOString(),
      resultCount: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(savedSearch, { status: 201 })
  } catch (error) {
    console.error('Create saved search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 