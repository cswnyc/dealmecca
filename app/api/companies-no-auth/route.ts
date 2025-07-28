import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing companies API without auth')
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || 'WPP'
    const limit = parseInt(searchParams.get('limit') || '5')
    
    console.log('📊 Test search params:', { query, limit })

    // Test basic database connection
    const userCount = await prisma.user.count()
    console.log('👥 Users in database:', userCount)

    const companyCount = await prisma.company.count()
    console.log('🏢 Companies in database:', companyCount)

    // Try simple search
    const companies = await prisma.company.findMany({
      where: {
        name: {
          startsWith: query,
          mode: 'insensitive'
        }
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
      message: 'No-auth test successful',
      companies,
      total: companies.length,
      database: {
        userCount,
        companyCount
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ No-auth test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 