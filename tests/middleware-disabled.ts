// Temporary disabled middleware for testing
// Rename this file to middleware.ts to disable middleware during testing

import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  // Simply pass through all requests without authentication
  console.log('🔵 Middleware temporarily disabled for testing')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
