import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🏥 HEALTH CHECK: Starting basic API test')
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Basic API functionality working',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        secretLength: process.env.NEXTAUTH_SECRET?.length || 0
      }
    }
    
    console.log('✅ HEALTH CHECK: API working, environment check passed')
    
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('❌ HEALTH CHECK: API failure:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      message: 'Basic API functionality failed'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
} 