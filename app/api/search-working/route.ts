import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Search working endpoint called')
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || 'WPP'
    const limit = parseInt(searchParams.get('limit') || '5')
    
    console.log('📊 Search params:', { query, limit })

    // Simple database test
    const companyCount = await prisma.company.count()
    console.log('🏢 Total companies in database:', companyCount)

    // Simple search
    const companies = await prisma.company.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        industry: true,
      },
      take: limit,
    })

    console.log('✅ Companies found:', companies.length)

    return NextResponse.json({
      success: true,
      message: 'Search working successfully!',
      query,
      companies,
      totalInDb: companyCount,
      found: companies.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Search working error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 