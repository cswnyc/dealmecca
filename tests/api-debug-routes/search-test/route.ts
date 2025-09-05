import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Search test endpoint called')
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || 'WPP'
    const limit = parseInt(searchParams.get('limit') || '5')
    
    console.log('📊 Search params:', { query, limit })

    // Simple database test
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { startsWith: query, mode: 'insensitive' } },
          { name: { endsWith: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        industry: true,
        employeeCount: true,
        city: true,
        state: true,
      },
      take: limit,
      orderBy: {
        name: 'asc'
      }
    })

    console.log('✅ Companies found:', companies.length)

    return NextResponse.json({
      success: true,
      message: 'Search test successful - no authentication required',
      companies,
      total: companies.length,
      query,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Search test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Search test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 