import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getToken } from 'next-auth/jwt'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 NEXTAUTH SESSION DEBUG: Starting comprehensive session analysis...')
    
    const results: any = {
      timestamp: new Date().toISOString(),
      url: request.url,
      method: 'GET'
    }

    // Test 1: Check NextAuth Server Session
    console.log('🔍 Testing getServerSession...')
    try {
      const serverSession = await getServerSession(authOptions)
      results.serverSession = {
        exists: !!serverSession,
        session: serverSession,
        message: serverSession ? 'Server session found' : 'No server session'
      }
      console.log('📱 Server session result:', !!serverSession)
    } catch (sessionError: any) {
      results.serverSession = {
        exists: false,
        error: sessionError.message,
        message: 'Server session lookup failed'
      }
      console.error('❌ Server session error:', sessionError)
    }

    // Test 2: Check JWT Token
    console.log('🔍 Testing JWT token...')
    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      })
      results.jwtToken = {
        exists: !!token,
        token: token,
        hasSessionToken: !!(token as any)?.sessionToken,
        hasSessionId: !!(token as any)?.sessionId,
        message: token ? 'JWT token found' : 'No JWT token'
      }
      console.log('🔐 JWT token result:', !!token)
    } catch (tokenError: any) {
      results.jwtToken = {
        exists: false,
        error: tokenError.message,
        message: 'JWT token lookup failed'
      }
      console.error('❌ JWT token error:', tokenError)
    }

    // Test 3: Check Request Headers and Cookies
    console.log('🔍 Checking request headers and cookies...')
    const cookies = request.headers.get('cookie') || ''
    const authCookies = cookies.split(';')
      .map(c => c.trim())
      .filter(c => c.includes('next-auth') || c.includes('__Secure-next-auth'))
    
    results.cookies = {
      hasCookies: cookies.length > 0,
      totalCookies: cookies.split(';').length,
      authCookies: authCookies,
      authCookieCount: authCookies.length,
      rawCookieHeader: cookies.substring(0, 200) + '...'
    }

    // Test 4: Check Database Sessions
    console.log('🔍 Checking database sessions...')
    try {
      const dbSessions = await prisma.session.findMany({
        include: { user: true },
        orderBy: { expires: 'desc' },
        take: 10
      })
      
      const activeSessions = dbSessions.filter(s => s.expires > new Date())
      
      results.databaseSessions = {
        totalSessions: dbSessions.length,
        activeSessions: activeSessions.length,
        recentSessions: activeSessions.map(s => ({
          id: s.id,
          sessionToken: s.sessionToken.substring(0, 20) + '...',
          userId: s.userId,
          userEmail: s.user.email,
          expires: s.expires,
          isActive: s.expires > new Date()
        }))
      }
      console.log('💾 Database sessions:', activeSessions.length, 'active')
    } catch (dbError: any) {
      results.databaseSessions = {
        error: dbError.message,
        message: 'Database session lookup failed'
      }
      console.error('❌ Database sessions error:', dbError)
    }

    // Test 5: Environment Check
    results.environment = {
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV,
      secretLength: process.env.NEXTAUTH_SECRET?.length || 0
    }

    // Overall Analysis
    const hasServerSession = !!results.serverSession?.exists
    const hasJwtToken = !!results.jwtToken?.exists
    const hasDbSessions = !!results.databaseSessions?.activeSessions
    const hasCookies = !!results.cookies?.authCookieCount

    results.analysis = {
      hasServerSession,
      hasJwtToken,
      hasDbSessions,
      hasCookies,
      diagnosis: getDiagnosis(hasServerSession, hasJwtToken, hasDbSessions, hasCookies),
      nextSteps: getNextSteps(hasServerSession, hasJwtToken, hasDbSessions, hasCookies)
    }

    console.log('🔍 NEXTAUTH SESSION DEBUG COMPLETED')
    console.log('📊 Analysis:', results.analysis)

    return NextResponse.json({
      success: true,
      results
    })
    
  } catch (error: any) {
    console.error('❌ NEXTAUTH SESSION DEBUG ERROR:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function getDiagnosis(hasServerSession: boolean, hasJwtToken: boolean, hasDbSessions: boolean, hasCookies: boolean): string {
  if (hasServerSession && hasJwtToken) {
    return "✅ NextAuth session working perfectly"
  } else if (hasJwtToken && hasDbSessions && !hasServerSession) {
    return "🔧 JWT and DB sessions exist but server session not found - session callback issue"
  } else if (hasDbSessions && !hasJwtToken && !hasServerSession) {
    return "🔧 DB sessions exist but NextAuth can't access them - JWT/cookie issue"
  } else if (!hasDbSessions && !hasJwtToken && !hasServerSession) {
    return "❌ No sessions found anywhere - authentication not working"
  } else if (hasCookies && !hasServerSession) {
    return "🔧 Cookies present but session not accessible - NextAuth config issue"
  } else {
    return "🔧 Mixed results - partial authentication working"
  }
}

function getNextSteps(hasServerSession: boolean, hasJwtToken: boolean, hasDbSessions: boolean, hasCookies: boolean): string[] {
  const steps = []
  
  if (!hasServerSession && hasJwtToken) {
    steps.push("Check NextAuth session callback configuration")
  }
  
  if (!hasJwtToken && hasDbSessions) {
    steps.push("Check JWT callback and cookie configuration")
  }
  
  if (!hasCookies) {
    steps.push("Check NextAuth cookie settings and domain configuration")
  }
  
  if (hasDbSessions && !hasServerSession) {
    steps.push("Verify session callback can read database sessions")
  }
  
  if (steps.length === 0) {
    steps.push("Run login test and check console logs")
  }
  
  return steps
}

export async function POST(request: NextRequest) {
  return GET(request)
} 