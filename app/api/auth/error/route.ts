import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const error = url.searchParams.get('error');
  
  console.log('🔥 Firebase Auth Error Handler:', error);
  
  // If this is a Firebase user (has dealmecca-session cookie), redirect to dashboard
  const sessionCookie = request.cookies.get('dealmecca-session');
  
  if (sessionCookie) {
    console.log('🔥 Firebase user detected, redirecting to dashboard instead of error page');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // For non-Firebase users, handle the error normally
  // Redirect to a generic error page or back to signin
  const errorMessage = error || 'Authentication error occurred';
  const signinUrl = new URL('/auth/signin', request.url);
  signinUrl.searchParams.set('error', errorMessage);
  
  console.log('🔥 Redirecting to signin with error:', errorMessage);
  return NextResponse.redirect(signinUrl);
}

export async function POST(request: NextRequest) {
  return GET(request);
}