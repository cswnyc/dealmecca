import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 FORCE SESSION REFRESH: Starting...')
    
    // Check if we can get a server session
    const serverSession = await getServerSession(authOptions)
    
    if (serverSession) {
      console.log('✅ FORCE SESSION REFRESH: Server session found')
      
      return NextResponse.json({
        success: true,
        message: 'Session refresh successful',
        session: serverSession,
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