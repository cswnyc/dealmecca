import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'
import { jwtVerify } from 'jose'

// Function to verify our custom session token (same as middleware)
async function getCustomToken(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('dealmecca-session')
    if (!sessionCookie?.value) {
      return null
    }

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')
    const { payload } = await jwtVerify(sessionCookie.value, secret)
    
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      subscriptionTier: payload.subscriptionTier
    }
  } catch (error) {
    console.error('Custom token verification failed:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const pathname = '/admin'  // Simulate accessing admin page
    
    // Simulate the middleware logic
    const nextAuthToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    const customToken = await getCustomToken(request)
    const token = nextAuthToken || customToken

    console.log('🔍 Debug middleware simulation:', {
      pathname,
      hasNextAuthToken: !!nextAuthToken,
      hasCustomToken: !!customToken,
      finalToken: !!token,
      tokenSource: nextAuthToken ? 'nextauth' : customToken ? 'custom' : 'none',
      tokenRole: token?.role,
      wouldRedirect: !token,
      wouldAllowAdmin: token?.role === 'ADMIN'
    })

    return NextResponse.json({
      success: true,
      pathname,
      middleware_simulation: {
        nextAuthToken: nextAuthToken ? { role: nextAuthToken.role, email: nextAuthToken.email } : null,
        customToken: customToken ? { role: customToken.role, email: customToken.email } : null,
        finalToken: token ? { role: token.role, email: token.email } : null,
        tokenSource: nextAuthToken ? 'nextauth' : customToken ? 'custom' : 'none',
        wouldRedirect: !token,
        wouldAllowAdmin: token?.role === 'ADMIN',
        decision: !token ? 'REDIRECT_TO_LOGIN' : 
                 pathname.startsWith('/admin') && token.role !== 'ADMIN' ? 'REDIRECT_TO_DASHBOARD' :
                 'ALLOW_ACCESS'
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Debug middleware error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error.message
    }, { status: 500 })
  }
} 