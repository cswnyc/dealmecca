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
  
  // TEMPORARY: Allow all API routes for debugging
  if (pathname.startsWith('/api/')) {
    console.log('🔍 Middleware: Allowing all API routes for debugging:', pathname)
    return NextResponse.next()
  }
  
  // For pages, basic handling
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 