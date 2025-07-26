import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  console.log('🔍 DEBUG SESSION: Starting session detection test...')
  
  try {
    // Get NextAuth session
    const session = await getServerSession(authOptions)
    console.log('🔍 DEBUG SESSION: NextAuth session result:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role
    })
    
    // Check database sessions
    const dbSessions = await prisma.session.findMany({
      take: 5,
      orderBy: { expires: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    })
    
    console.log('🔍 DEBUG SESSION: Database sessions count:', dbSessions.length)
    
    // Check cookies
    const cookies = request.headers.get('cookie') || ''
    const hasSessionToken = cookies.includes('next-auth.session-token')
    const hasCallbackUrl = cookies.includes('next-auth.callback-url')
    const hasCSRFToken = cookies.includes('next-auth.csrf-token')
    
    console.log('🔍 DEBUG SESSION: Cookie analysis:', {
      hasCookieHeader: !!cookies,
      hasSessionToken,
      hasCallbackUrl,
      hasCSRFToken,
      cookieLength: cookies.length
    })
    
    // Domain detection
    const host = request.headers.get('host')
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    console.log('🔍 DEBUG SESSION: Domain info:', {
      host,
      origin,
      referer,
      domain: host?.includes('getmecca.com') ? 'getmecca.com' : 'other'
    })
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      domain: host,
      session: {
        detected: !!session,
        userId: session?.user?.id || null,
        email: session?.user?.email || null,
        role: session?.user?.role || null
      },
      cookies: {
        hasSessionToken,
        hasCallbackUrl,
        hasCSRFToken,
        cookieCount: cookies.split(';').length
      },
      database: {
        totalSessions: dbSessions.length,
        recentSessions: dbSessions.map(s => ({
          sessionToken: s.sessionToken?.substring(0, 20) + '...',
          userId: s.userId,
          userEmail: s.user?.email,
          expires: s.expires,
          isValid: s.expires > new Date()
        }))
      },
      status: session ? 'FIXED - Session detected!' : 'ISSUE - No session detected'
    })
    
  } catch (error) {
    console.error('❌ DEBUG SESSION: Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 