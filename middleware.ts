import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

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
  
  // Always allow NextAuth API routes
  if (pathname.startsWith('/api/auth/')) {
    console.log('🔵 Allowing NextAuth route:', pathname)
    return NextResponse.next()
  }
  
  // Allow public API routes without authentication
  const publicApiRoutes = [
    '/api/health',
    '/api/health-check',
    '/api/test-minimal',
    '/api/companies-public',
    '/api/check-env',
    '/api/disable-sw',
    '/api/simple-login',
    '/api/direct-login',
    '/api/setup-test-user',
    '/api/create-admin',
    '/api/manual-login',
    '/api/session-debug',
    '/api/setup-sample-data',
    '/api/test-basic',
    '/api/debug-auth',
    '/api/debug-session',
    '/api/debug-middleware-status',
    '/api/test-session-creation',
    '/api/auth-test-flow',
    '/api/test-nextauth-flow',
    '/api/auth-login',
    '/api/companies',
    '/api/orgs/companies',
    '/api/orgs/contacts',
    '/api/contacts',
    '/api/events',
    '/api/forum/posts',
    '/api/forum/categories'
  ]
  
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    console.log('🔵 Allowing public API route:', pathname)
    return NextResponse.next()
  }
  
  // Allow public pages without authentication
  const publicPages = [
    '/',
    '/login',
    '/auth/signin',
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
  
  // Get NextAuth token
  console.log('🔐 Checking authentication token...')
  
  // Try NextAuth's getToken first
  let token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token'
  })
  
  // If NextAuth token doesn't work, try manually decoding our JWT
  if (!token) {
    console.log('🔐 NextAuth getToken failed, trying manual JWT decode...')
    const sessionCookie = req.cookies.get('next-auth.session-token')
    
    if (sessionCookie) {
      try {
        const { jwtVerify } = await import('jose')
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')
        
        const { payload } = await jwtVerify(sessionCookie.value, secret)
        token = payload as any
        console.log('✅ Manual JWT decode successful')
      } catch (jwtError) {
        console.log('❌ Manual JWT decode failed:', jwtError)
      }
    }
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
    
    // For pages, redirect to login
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    console.log('🔵 Redirecting to login:', loginUrl.href)
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