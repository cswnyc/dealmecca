import { NextRequest, NextResponse } from 'next/server'
// Removed getServerSession - using Firebase auth via middleware headers
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Execute a saved search
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role)
  
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get the saved search
    const savedSearch = await prisma.savedSearch.findFirst({
      where: {
        id,
        userId: userId,
        isActive: true
      }
    })

    if (!savedSearch) {
      return NextResponse.json(
        { error: 'Saved search not found' },
        { status: 404 }
      )
    }

    // Parse the filters
    let filters: any = {}
    try {
      filters = typeof savedSearch.filters === 'string' 
        ? JSON.parse(savedSearch.filters)
        : savedSearch.filters
    } catch (error) {
      console.error('Failed to parse saved search filters:', error)
      return NextResponse.json(
        { error: 'Invalid search filters' },
        { status: 400 }
      )
    }

    // Execute the search using the enhanced search API logic
    const searchParams = new URLSearchParams()
    
    if (savedSearch.query) {
      searchParams.set('q', savedSearch.query)
    }
    
    // Add all filter parameters
    if (filters.searchType) searchParams.set('searchType', filters.searchType)
    if (filters.roles) filters.roles.forEach((role: string) => searchParams.append('roles', role))
    if (filters.seniority) filters.seniority.forEach((sen: string) => searchParams.append('seniority', sen))
    if (filters.department) filters.department.forEach((dept: string) => searchParams.append('department', dept))
    if (filters.companyType) filters.companyType.forEach((type: string) => searchParams.append('companyType', type))
    if (filters.industry) filters.industry.forEach((ind: string) => searchParams.append('industry', ind))
    if (filters.city) filters.city.forEach((city: string) => searchParams.append('city', city))
    if (filters.isDecisionMaker) searchParams.set('isDecisionMaker', 'true')

    // Forward the request to the enhanced search API
    const searchUrl = `${request.nextUrl.origin}/api/search/enhanced?${searchParams}`
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    })

    if (!searchResponse.ok) {
      throw new Error('Search execution failed')
    }

    const searchResults = await searchResponse.json()

    // Update the saved search with new result count and last run time
    await prisma.savedSearch.update({
      where: { id },
      data: {
        lastRun: new Date(),
        resultCount: searchResults.results.totalResults || 0
      }
    })

    return NextResponse.json({
      success: true,
      results: searchResults.results,
      filters: searchResults.filters,
      stats: searchResults.stats,
      savedSearch: {
        id: savedSearch.id,
        name: savedSearch.name,
        description: savedSearch.description,
        lastRun: new Date(),
        resultCount: searchResults.results.totalResults || 0
      }
    })

  } catch (error) {
    console.error('Failed to execute saved search:', error)
    return NextResponse.json(
      { error: 'Failed to execute saved search' },
      { status: 500 }
    )
  }
}
