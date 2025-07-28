import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  console.log('🧪 === AUTH TEST FLOW START ===')
  
  try {
    // Step 1: Check if we have authentication headers from middleware
    const userId = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')
    const userTier = request.headers.get('x-user-tier')
    const userEmail = request.headers.get('x-user-email')
    
    console.log('🔍 Headers from middleware:', {
      userId,
      userRole,
      userTier,
      userEmail
    })
    
    // Step 2: Also check NextAuth token directly
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: 'next-auth.session-token'
    })
    
    console.log('🔍 NextAuth token:', {
      hasToken: !!token,
      userId: token?.sub,
      email: token?.email,
      role: (token as any)?.role
    })
    
    // Step 3: Check all cookies
    const cookies = request.headers.get('cookie')
    console.log('🍪 All cookies:', cookies)
    
    // Step 4: Check specific NextAuth cookies
    const sessionCookie = request.cookies.get('next-auth.session-token')
    const csrfCookie = request.cookies.get('next-auth.csrf-token')
    
    console.log('🍪 NextAuth cookies:', {
      hasSessionCookie: !!sessionCookie,
      sessionCookieValue: sessionCookie?.value?.substring(0, 20) + '...',
      hasCsrfCookie: !!csrfCookie
    })
    
    // Step 5: Make assessment
    const isAuthenticated = !!(userId && token)
    const hasValidHeaders = !!(userId && userRole && userEmail)
    const hasValidToken = !!token?.sub
    
    return NextResponse.json({
      success: true,
      testResults: {
        isAuthenticated,
        hasValidHeaders,
        hasValidToken,
        middlewareHeaders: {
          userId,
          userRole,
          userTier,
          userEmail
        },
        nextAuthToken: token ? {
          userId: token.sub,
          email: token.email,
          role: (token as any)?.role,
          subscriptionTier: (token as any)?.subscriptionTier
        } : null,
        cookies: {
          hasSessionCookie: !!sessionCookie,
          hasCsrfCookie: !!csrfCookie,
          cookieCount: cookies ? cookies.split(';').length : 0
        }
      },
      diagnosis: {
        authStatus: isAuthenticated ? 'AUTHENTICATED' : 'NOT_AUTHENTICATED',
        issues: [
          !hasValidHeaders && 'Missing middleware headers',
          !hasValidToken && 'Missing or invalid NextAuth token',
          !sessionCookie && 'Missing session cookie'
        ].filter(Boolean)
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Auth test flow error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Auth test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 