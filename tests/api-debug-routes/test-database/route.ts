import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🗄️ DATABASE TEST: Starting...')
    
    // First test basic imports and environment
    const response: any = {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Database test starting',
      environment: {
        databaseUrl: !!process.env.DATABASE_URL,
        databaseUrlLength: process.env.DATABASE_URL?.length || 0,
        databaseUrlStart: process.env.DATABASE_URL?.substring(0, 20) + '...' || 'Not found'
      }
    }
    
    console.log('🔍 DATABASE TEST: Environment check completed')
    console.log('📊 Database URL available:', !!process.env.DATABASE_URL)
    
    // Try to import Prisma
    try {
      console.log('📦 DATABASE TEST: Importing Prisma...')
      const { prisma } = await import('@/lib/prisma')
      console.log('✅ DATABASE TEST: Prisma imported successfully')
      
      // Try a simple count operation
      console.log('🔢 DATABASE TEST: Testing user count...')
      const userCount = await prisma.user.count()
      console.log('✅ DATABASE TEST: User count successful:', userCount)
      
      response.database = {
        prismaImported: true,
        userCount,
        connectionWorking: true
      }
      
    } catch (prismaError: any) {
      console.error('❌ DATABASE TEST: Prisma error:', prismaError)
      
      response.database = {
        prismaImported: false,
        error: prismaError.message,
        connectionWorking: false
      }
      response.success = false
    }
    
    console.log('📊 DATABASE TEST: Final response:', response)
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('❌ DATABASE TEST: Critical failure:', error)
    
    const errorResponse = {
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      message: 'Database test completely failed'
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
} 