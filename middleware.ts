import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

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
  
  // Get token for authentication
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  
  // Public API routes that don't need auth
  const publicApiRoutes = [
    '/api/stripe/webhook',
    '/api/forum/search/suggestions',
    '/api/orgs/companies',
    '/api/orgs/contacts',
    '/api/companies-public',  // Temporary for testing
    '/api/admin/promote-user',  // Temporary for admin setup
    '/api/test-auth',  // Temporary for debugging login
    '/api/check-env'  // Temporary for checking environment
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
    '/pricing'
  ]
  
  if (publicPages.includes(pathname)) {
    return NextResponse.next()
  }
  
  // Redirect to signin if not authenticated
  if (!token) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
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