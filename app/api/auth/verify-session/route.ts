import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if session cookie exists and user headers are present (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');
    
    console.log('🔍 Session verification - Headers:', {
      userId,
      userEmail, 
      userRole,
      hasCookie: request.cookies.has('dealmecca-session')
    });
    
    if (userId && userEmail) {
      // Session is properly established
      return NextResponse.json({ 
        success: true, 
        sessionReady: true,
        user: {
          id: userId,
          email: userEmail,
          role: userRole
        }
      });
    } else {
      // Session not ready yet
      return NextResponse.json({ 
        success: false, 
        sessionReady: false,
        message: 'Session not established yet'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('❌ Session verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        sessionReady: false,
        error: 'Session verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}