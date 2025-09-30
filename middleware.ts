import { NextRequest, NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/forum',
  '/organizations',
  '/events',
  '/admin',
  '/dashboard',
  '/profile',
  '/settings'
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth',
  '/api/auth',
  '/api/public',
  '/about',
  '/pricing',
  '/contact',
  '/privacy',
  '/terms',
  '/billing',
  '/help',
  '/rewards',
  '/invite-only',
  // Test and diagnostic routes
  '/test-linkedin-diagnosis',
  '/test-linkedin-config',
  '/test-firebase-auth',
  '/test-firebase-config',
  '/test-convertkit',
  '/test-linkedin',
  '/test-linkedin-simple',
  '/test-auth',
  '/test-auth-fixed',
  '/test-auth-offline',
  '/test-auth-simple',
  '/test-isolated',
  '/test-components',
  '/test-confetti',
  '/demo'
];

// Define auth routes
const authRoutes = [
  '/auth/firebase-signin',
  '/auth/signup',
  '/auth/signin',
  '/auth/login'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes that should always be accessible
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Allow access to public routes and auth routes
  if (isPublicRoute || isAuthRoute) {
    return NextResponse.next();
  }

  // For protected routes, apply authentication checks
  if (isProtectedRoute) {
    // Skip auth checks for admin routes in development
    if (pathname.startsWith('/admin') && process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }

    // Check for authentication token/session
    const authToken = request.cookies.get('auth-token');
    const firebaseToken = request.cookies.get('__session'); // Firebase session cookie
    const linkedinToken = request.cookies.get('linkedin-auth'); // LinkedIn session cookie

    // If no auth indication found, redirect to auth page
    // Note: This is a basic check. The AuthGuard component will do the real verification
    if (!authToken && !firebaseToken && !linkedinToken) {
      // For API calls, return 401
      if (pathname.startsWith('/api/')) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      // For page requests, redirect to sign up
      const signUpUrl = new URL('/auth/firebase-signin', request.url);
      signUpUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signUpUrl);
    }
  }

  // For all other routes (neither public nor protected), allow access
  // This includes test routes, diagnostic pages, and other misc pages
  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public folder files
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};