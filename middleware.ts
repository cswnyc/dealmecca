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
    pathname.includes('.')
  ) {
    console.log('🔵 Skipping middleware for static file:', pathname)
    return NextResponse.next()
  }
  
  // Always allow NextAuth API routes
  if (pathname.startsWith('/api/auth/')) {
    console.log('🔵 Allowing NextAuth route:', pathname)
    return NextResponse.next()
  }
  
  // TEMPORARY: Allow all API routes for debugging
  if (pathname.startsWith('/api/')) {
    console.log('🔵 Allowing all API routes for debugging:', pathname)
    console.log('🔵 === MIDDLEWARE END (API ALLOWED) ===')
    return NextResponse.next()
  }
  
  console.log('🔵 Page request - allowing:', pathname)
  console.log('🔵 === MIDDLEWARE END (PAGE) ===')
  
  // For pages, basic handling
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 