import { NextRequest, NextResponse } from 'next/server'
// Removed NextAuth dependency - using Firebase auth via middleware

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 FORCE SESSION REFRESH: Starting...')
    
    // Check user from middleware headers
    const userId = request.headers.get('x-user-id')
    const userEmail = request.headers.get('x-user-email')
    
    if (userId && userEmail) {
      console.log('✅ FORCE SESSION REFRESH: Firebase session found')
      
      return NextResponse.json({
        success: true,
        message: 'Session refresh successful',
        session: { user: { id: userId, email: userEmail } },
        redirect: '/dashboard'
      })
    } else {
      console.log('⚠️ FORCE SESSION REFRESH: No server session found')
      
      return NextResponse.json({
        success: false,
        message: 'No session found',
        session: null,
        redirect: '/login'
      })
    }
    
  } catch (error: any) {
    console.error('❌ FORCE SESSION REFRESH ERROR:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Session refresh failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
} 