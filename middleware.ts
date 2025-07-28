import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { jwtVerify } from 'jose'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next()
  }
  
  // Always allow NextAuth API routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }
  
  // Always allow health check
  if (pathname === '/api/health') {
    return NextResponse.next()
  }
  
  // Get token for authentication using NextAuth
  const nextAuthToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  
  // ALSO check for manual authentication (dealmecca-session cookie)
  let manualToken = null
  const manualSessionCookie = req.cookies.get('dealmecca-session')?.value
  
  if (manualSessionCookie) {
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')
      const { payload } = await jwtVerify(manualSessionCookie, secret)
      manualToken = payload
      console.log('🔍 Manual session verified:', { userId: payload.sub, email: payload.email })
    } catch (error) {
      console.log('⚠️ Manual session verification failed:', error)
    }
  }
  
  // Use either NextAuth token OR manual token
  const token = nextAuthToken || manualToken

  // Debug logging for token resolution
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    console.log('🔍 Middleware token check:', {
      pathname,
      hasToken: !!token,
      authMethod: nextAuthToken ? 'NextAuth' : manualToken ? 'Manual' : 'None',
      userRole: token?.role || 'none',
      userEmail: token?.email || 'none'
    })
  }
  
  // Public API routes that don't need auth
  const publicApiRoutes = [
    '/api/stripe/webhook',
    '/api/forum/search/suggestions',
    '/api/auth/signup',       // User registration endpoint
    '/api/orgs/companies',    // Temporary for testing
    '/api/orgs/contacts',     // Temporary for testing
    '/api/companies-public',  // Temporary for testing
    '/api/admin/promote-user',  // Temporary for admin setup
    '/api/test-auth',         // Temporary for debugging login
    '/api/check-env',         // Temporary for checking environment
    '/api/direct-login',      // Temporary direct login bypass
    '/api/session-status',    // Temporary for debugging sessions
    '/api/debug-middleware',  // Temporary for debugging middleware
    '/api/debug-session',     // Temporary for debugging NextAuth sessions
    '/api/debug-nextauth-session', // Temporary for NextAuth-specific session debugging
    '/api/force-session-refresh', // Temporary for forcing session refresh
    '/api/test-session-creation', // Temporary for testing manual session creation
    '/api/test-auth-pipeline', // Temporary for testing complete auth pipeline
    '/api/test-basic-auth',   // Temporary for testing basic auth functionality
    '/api/test-database',     // Temporary for testing database connectivity
    '/api/health-check',      // Temporary for basic API health check
    '/api/disable-sw',        // Temporary for disabling service worker during debug
    '/api/test-search-debug', // Temporary for debugging search issues
    '/api/test-simple',       // Simple bypass test
    '/api/companies-no-auth'  // Companies search without auth for testing
  ]
  
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // For API routes that need auth, add user headers if authenticated
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Add user info to headers for authenticated API routes
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', token.sub || '')
    requestHeaders.set('x-user-role', (token.role as string) || 'FREE')
    requestHeaders.set('x-user-tier', (token.subscriptionTier as string) || 'FREE')
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  // Public pages that don't require authentication
  const publicPages = [
    '/',
    '/auth/signin',
    '/auth/signup', 
    '/auth/error',
    '/auth/verify-request',
    '/pricing',
    '/login',           // Standard login page
    '/signup',          // Standard signup page
    '/direct-login',    // Temporary direct login bypass (for testing)
    '/admin-bypass',    // Temporary admin bypass (for testing)
    '/dashboard-bypass' // Temporary dashboard bypass (for testing)
  ]
  
  if (publicPages.includes(pathname)) {
    return NextResponse.next()
  }
  
  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Admin routes require admin role
  if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard?error=unauthorized', req.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 