import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'
import { jwtVerify } from 'jose'

export async function GET(request: NextRequest) {
  try {
    // Check NextAuth token
    const nextAuthToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    // Check custom session cookie
    const sessionCookie = request.cookies.get('dealmecca-session')
    let customToken = null
    
    if (sessionCookie?.value) {
      try {
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')
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
      nextAuthToken: nextAuthToken ? {
        sub: nextAuthToken.sub,
        email: nextAuthToken.email,
        role: nextAuthToken.role,
        subscriptionTier: nextAuthToken.subscriptionTier
      } : null,
      customToken,
      hasSessionCookie: !!sessionCookie,
      sessionCookieLength: sessionCookie?.value?.length || 0,
      cookies: allCookies,
      activeToken: nextAuthToken || customToken,
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