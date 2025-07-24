import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug session endpoint called')
    
    // Get session using NextAuth
    const session = await getServerSession(authOptions)
    console.log('📱 NextAuth session:', session)
    
    // Query sessions directly from database
    const dbSessions = await prisma.session.findMany({
      take: 5,
      orderBy: { expires: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            subscriptionTier: true
          }
        }
      }
    })
    console.log('💾 Database sessions:', dbSessions)
    
    // Query users from database
    const dbUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        createdAt: true
      }
    })
    console.log('👥 Database users:', dbUsers)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      session: session,
      sessionExists: !!session,
      sessionUserId: session?.user?.id || null,
      database: {
        sessionsCount: dbSessions.length,
        usersCount: dbUsers.length,
        recentSessions: dbSessions,
        recentUsers: dbUsers
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0
      }
    })
    
  } catch (error: any) {
    console.error('❌ Debug session error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    }, { status: 500 })
  }
} 