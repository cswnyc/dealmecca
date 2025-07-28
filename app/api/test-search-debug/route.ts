import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test search debug endpoint called')
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || 'WPP'
    const limit = parseInt(searchParams.get('limit') || '5')

    console.log('📊 Test search params:', { query, limit })

    // Test basic database connection
    console.log('🔌 Testing database connection...')
    const userCount = await prisma.user.count()
    console.log('👥 Users in database:', userCount)

    const companyCount = await prisma.company.count()
    console.log('🏢 Companies in database:', companyCount)

    // Test basic company query
    console.log('🔍 Testing basic company query...')
    const allCompanies = await prisma.company.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        companyType: true,
        industry: true
      }
    })
    console.log('🏢 Sample companies:', allCompanies)

    // Test search query
    console.log('🔍 Testing search query...')
    const where: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { industry: { contains: query, mode: 'insensitive' } }
      ]
    }

    console.log('🔍 Search where clause:', JSON.stringify(where, null, 2))

    const searchResults = await prisma.company.findMany({
      where,
      include: {
        _count: {
          select: { contacts: true }
        },
        contacts: {
          where: { isDecisionMaker: true },
          take: 2,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            title: true,
            email: true
          }
        }
      },
      take: limit,
      orderBy: { name: 'asc' }
    })

    console.log('✅ Search results:', { found: searchResults.length })

    return NextResponse.json({
      success: true,
      debug: {
        query,
        limit,
        userCount,
        companyCount,
        searchResultsCount: searchResults.length
      },
      sampleCompanies: allCompanies,
      searchResults,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Test search debug error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      success: false,
      error: 'Test search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No details available',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 