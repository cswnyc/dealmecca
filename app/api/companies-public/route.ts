import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Get companies without authentication requirement
    const companies = await prisma.company.findMany({
      take: Math.min(limit, 50), // Cap at 50
      select: {
        id: true,
        name: true,
        companyType: true,
        industry: true,
        city: true,
        state: true,
        verified: true,
        _count: {
          select: {
            contacts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      companies,
      count: companies.length,
      message: 'Public companies data (no auth required)',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Public companies API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch companies',
        details: error instanceof Error ? error.message : 'Unknown error',
        companies: [],
        count: 0
      }, 
      { status: 500 }
    )
  }
} 