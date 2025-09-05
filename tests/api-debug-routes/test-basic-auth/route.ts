import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔬 BASIC AUTH TEST: Starting...')
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Basic auth test endpoint working',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        databaseUrl: !!process.env.DATABASE_URL,
        secretLength: process.env.NEXTAUTH_SECRET?.length || 0
      },
      imports: {
        nextRequest: !!NextRequest,
        nextResponse: !!NextResponse
      }
    }
    
    console.log('✅ BASIC AUTH TEST: Environment check completed')
    console.log('📊 Response data:', response)
    
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('❌ BASIC AUTH TEST: Critical failure:', error)
    
    const errorResponse = {
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      message: 'Basic auth test failed'
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔬 BASIC AUTH TEST POST: Starting...')
    
    let body = null
    try {
      body = await request.json()
    } catch (jsonError) {
      console.log('⚠️ No JSON body provided, continuing without it')
    }
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'POST endpoint working',
      receivedBody: body,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        databaseUrl: !!process.env.DATABASE_URL
      }
    }
    
    console.log('✅ BASIC AUTH TEST POST: Completed successfully')
    
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('❌ BASIC AUTH TEST POST: Failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 