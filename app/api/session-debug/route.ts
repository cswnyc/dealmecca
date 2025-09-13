import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
// Removed NextAuth JWT import - using Firebase auth via middleware

export async function GET(request: NextRequest) {
  console.log('🔍 SESSION DEBUG: Starting comprehensive session check...');
  
  try {
    // 1. Check NextAuth getServerSession
    console.log('1️⃣ Checking getServerSession...');
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    
    // 2. Skip NextAuth JWT token - removed
    console.log('2️⃣ NextAuth JWT token check - REMOVED');
    const token = null;
    
    // 3. Check cookies manually
    console.log('3️⃣ Checking cookies...');
    const cookies = request.headers.get('cookie') || '';
    const cookieObj: Record<string, string> = {};
    cookies.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) cookieObj[name] = value;
    });
    
    // 4. Check specific session cookies
    const sessionToken = cookieObj['next-auth.session-token'];
    const callbackUrl = cookieObj['next-auth.callback-url'];
    const csrfToken = cookieObj['next-auth.csrf-token'];
    
    console.log('4️⃣ Session cookie analysis:', {
      hasSessionToken: !!sessionToken,
      sessionTokenLength: sessionToken?.length || 0,
      hasCallbackUrl: !!callbackUrl,
      hasCsrfToken: !!csrfToken
    });
    
    // 5. Manual JWT decode if session token exists
    let manualDecode = null;
    if (sessionToken) {
      try {
        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback');
        const { payload } = await jwtVerify(sessionToken, secret);
        manualDecode = payload;
        console.log('5️⃣ Manual JWT decode successful');
      } catch (error) {
        console.log('5️⃣ Manual JWT decode failed:', error);
      }
    }
    
    // 6. Check request headers
    const host = request.headers.get('host');
    const origin = request.headers.get('origin');
    const userAgent = request.headers.get('user-agent');
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      url: request.url,
      host,
      origin,
      
      // Session checks - NextAuth removed
      nextAuthSession: {
        exists: false,
        note: 'NextAuth removed - using Firebase + JWT'
      },
      
      // JWT token
      jwtToken: {
        exists: !!token,
        sub: token?.sub || null,
        email: token?.email || null,
        role: (token as any)?.role || null,
        exp: token?.exp || null
      },
      
      // Manual decode
      manualDecode: {
        exists: !!manualDecode,
        sub: manualDecode?.sub || null,
        email: manualDecode?.email || null,
        role: (manualDecode as any)?.role || null
      },
      
      // Cookies
      cookies: {
        total: Object.keys(cookieObj).length,
        hasSessionToken: !!sessionToken,
        hasCallbackUrl: !!callbackUrl,
        hasCsrfToken: !!csrfToken,
        sessionTokenPreview: sessionToken ? sessionToken.substring(0, 50) + '...' : null,
        allCookieNames: Object.keys(cookieObj)
      },
      
      // Environment
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasJWTSecret: !!process.env.JWT_SECRET,
        secretLength: process.env.JWT_SECRET?.length || 0
      },
      
      // Diagnosis
      diagnosis: {
        sessionWorking: !!session,
        tokenWorking: !!token,
        cookiePresent: !!sessionToken,
        manualDecodeWorking: !!manualDecode,
        likely_issue: !session && !token && !sessionToken ? 'No session cookie set' :
                      !session && !!sessionToken ? 'Session cookie exists but not being read by NextAuth' :
                      !!session && !session.user?.role ? 'Session exists but missing role' :
                      'Unknown issue'
      }
    };
    
    console.log('🔍 SESSION DEBUG: Complete analysis:', debugInfo);
    
    return NextResponse.json(debugInfo);
    
  } catch (error) {
    console.error('❌ SESSION DEBUG: Error:', error);
    return NextResponse.json({
      error: 'Session debug failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}