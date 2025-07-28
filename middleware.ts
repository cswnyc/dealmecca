import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
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
  let token = null
  try {
    token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  } catch (error) {
    console.error('🔍 Middleware: Error getting token:', error)
  }
  
  // For API routes that need authentication, add user headers if authenticated
  if (pathname.startsWith('/api/')) {
    if (!token) {
      console.log('🔍 Middleware: No token for API route:', pathname)
      return NextResponse.json(
        { 
          success: false,
          error: 'Please log in to access search features',
          code: 'UNAUTHORIZED',
          message: 'You must be signed in to access search and user features.',
          helpText: 'Create an account or sign in to start searching companies, contacts, and more.',
          actionUrl: '/auth/signin',
          actionText: 'Sign In'
        },
        { status: 401 }
      )
    }
    
    console.log('🔍 Middleware: Token found for API route:', pathname, 'User:', token.sub)
    
    // Add user info to headers for authenticated API routes
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', token.sub || '')
    requestHeaders.set('x-user-email', (token as any).email || '')
    requestHeaders.set('x-user-role', (token as any).role || 'USER')
    requestHeaders.set('x-user-tier', (token as any).subscriptionTier || 'FREE')
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  // For pages, allow access but redirect to signin if accessing protected pages without auth
  const publicPages = [
    '/',
    '/auth',
    '/pricing',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/help',
    '/login',
    '/signup'
  ]
  
  if (publicPages.some(page => pathname.startsWith(page))) {
    return NextResponse.next()
  }
  
  // Protected pages - redirect to signin if not authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 