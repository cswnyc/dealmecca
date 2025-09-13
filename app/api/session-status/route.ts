import { NextRequest, NextResponse } from 'next/server';
// Removed NextAuth JWT import - using Firebase auth via middleware
import { jwtVerify } from 'jose'

export async function GET(request: NextRequest) {
  try {
    // NextAuth removed - only check custom session cookie
    
    // Check custom session cookie
    const sessionCookie = request.cookies.get('dealmecca-session')
    let customToken = null
    
    if (sessionCookie?.value) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
        const { payload } = await jwtVerify(sessionCookie.value, secret)
        customToken = {
          sub: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          subscriptionTier: payload.subscriptionTier
        }
      } catch (error) {
        console.error('Custom token verification failed:', error)
      }
    }
    
    // Get all cookies for debugging
    const allCookies = Object.fromEntries(
      request.cookies.getAll().map(cookie => [cookie.name, cookie.value.substring(0, 50) + '...'])
    )
    
    return NextResponse.json({
      success: true,
      nextAuthToken: null, // NextAuth removed
      customToken,
      hasSessionCookie: !!sessionCookie,
      sessionCookieLength: sessionCookie?.value?.length || 0,
      cookies: allCookies,
      activeToken: customToken,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Session status error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check session status',
      details: error.message
    }, { status: 500 })
  }
} 