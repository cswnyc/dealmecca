import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
// Removed NextAuth import - using Firebase authentication now

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  console.log('🔵 === MIDDLEWARE START ===')
  console.log('🔵 Pathname:', pathname)
  console.log('🔵 URL:', req.url)
  console.log('🔵 Method:', req.method)
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/icons/')
  ) {
    console.log('🔵 Skipping middleware for static file:', pathname)
    return NextResponse.next()
  }
  
  // Allow specific Firebase-compatible auth routes only
  const allowedAuthRoutes = [
    '/api/auth/firebase-sync',
    '/api/auth/verify-session',
    '/api/auth/error'
  ]
  if (allowedAuthRoutes.some(route => pathname === route)) {
    console.log('🔥 Allowing Firebase auth route:', pathname)
    return NextResponse.next()
  }
  
  // Allow public API routes without authentication
  const publicApiRoutes = [
    '/api/health',
    '/api/health-check',
    '/api/companies-public',
    '/api/check-env',
    '/api/disable-sw',
    '/api/companies',
    '/api/forum/categories',
    '/api/forum/mentions/topics'
  ]
  
  // Routes that are public only for GET requests
  const publicGetOnlyRoutes = [
    '/api/forum/posts'
  ]
  
  // Routes that are public only for the exact path (not sub-routes)
  const exactPublicApiRoutes = [
    '/api/events'  // Only /api/events, not /api/events/[id]
  ]
  
  // Check if this is a public route or a public GET-only route
  const isPublicRoute = publicApiRoutes.some(route => pathname.startsWith(route)) || 
                       exactPublicApiRoutes.includes(pathname) ||
                       (publicGetOnlyRoutes.some(route => pathname.startsWith(route)) && req.method === 'GET')
  
  if (isPublicRoute) {
    console.log('🔵 Allowing public API route:', pathname)
    return NextResponse.next()
  }
  
  // Allow public pages without authentication
  const publicPages = [
    '/',
    '/login',
    '/auth/signin',
    '/auth/firebase-signin',
    '/auth/signup', 
    '/auth/error',
    '/auth/verify-request',
    '/signup',
    '/pricing',
    '/search',
    '/orgs',
    '/dashboard-test',
    '/organizations',
    '/events',
    '/forum',
    '/intelligence',
    '/analytics',
    '/manual-login',
    '/debug-admin',
    '/session-status'
  ]
  
  if (publicPages.includes(pathname)) {
    console.log('🔵 Allowing public page:', pathname)
    return NextResponse.next()
  }
  
  // Check for Firebase authentication (dealmecca-session cookie)
  console.log('🔐 Checking Firebase authentication token...')
  
  let token = null
  const manualSessionCookie = req.cookies.get('dealmecca-session')?.value
  
  if (manualSessionCookie) {
    try {
      // Ensure we have a proper JWT secret
      const jwtSecret = process.env.JWT_SECRET
      if (!jwtSecret) {
        console.error('❌ JWT_SECRET environment variable not set!')
        throw new Error('JWT_SECRET not configured')
      }
      
      const secret = new TextEncoder().encode(jwtSecret)
      const { payload } = await jwtVerify(manualSessionCookie, secret, {
        algorithms: ['HS256'] // Explicitly specify the algorithm
      })
      
      token = payload as any
      
      // Verify token hasn't expired
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        console.log('⚠️ JWT token has expired')
        token = null
      } else {
        console.log('✅ Firebase session verified:', { 
          userId: payload.sub, 
          email: payload.email,
          expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'no expiration'
        })
      }
    } catch (error) {
      console.log('⚠️ Firebase session verification failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorName: error instanceof Error ? error.name : 'Unknown',
        cookiePresent: !!manualSessionCookie,
        cookieLength: manualSessionCookie?.length || 0,
        jwtSecretSet: !!process.env.JWT_SECRET
      })
      token = null
    }
  } else {
    console.log('🔍 No dealmecca-session cookie found')
  }
  
  console.log('🔐 Token result:', {
    hasToken: !!token,
    userId: token?.sub,
    email: token?.email,
    role: (token as any)?.role,
    method: token ? 'decoded' : 'none'
  })
  
  // If no token and accessing protected route, redirect to login
  if (!token) {
    console.log('❌ No authentication token found')
    
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      console.log('🔵 Returning 401 for unauthenticated API request')
      return NextResponse.json({ 
        success: false,
        error: 'Please log in to access search features',
        code: 'UNAUTHORIZED',
        message: 'You must be signed in to access search and user features.',
        helpText: 'Create an account or sign in to start searching companies, contacts, and more.',
        actionUrl: '/auth/signin',
        actionText: 'Sign In'
      }, { status: 401 })
    }
    
    // For pages, redirect to Firebase signin
    const loginUrl = new URL('/auth/firebase-signin', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    console.log('🔵 Redirecting to Firebase signin:', loginUrl.href)
    return NextResponse.redirect(loginUrl)
  }
  
  // User is authenticated - add headers for API routes
  if (pathname.startsWith('/api/')) {
    console.log('✅ Adding user headers to authenticated API request')
    
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', token.sub || '')
    requestHeaders.set('x-user-email', token.email || '')
    requestHeaders.set('x-user-role', (token as any)?.role || 'FREE')
    requestHeaders.set('x-user-tier', (token as any)?.subscriptionTier || 'FREE')
    
    console.log('🔵 User headers set:', {
      userId: token.sub,
      email: token.email,
      role: (token as any)?.role,
      tier: (token as any)?.subscriptionTier
    })
    
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    
    console.log('🔵 === MIDDLEWARE END (API WITH AUTH) ===')
    return response
  }
  
  console.log('✅ Authenticated user accessing page:', pathname)
  console.log('🔵 === MIDDLEWARE END (AUTHENTICATED PAGE) ===')
  
  // For authenticated page requests, just continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 