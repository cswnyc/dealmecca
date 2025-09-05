import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('🧪 Testing session creation for:', email)
    
    // Step 1: Verify user exists and password is correct
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user || !user.password) {
      return NextResponse.json({
        success: false,
        error: 'User not found or no password set',
        step: 'user_lookup'
      }, { status: 404 })
    }
    
    const isPasswordValid = await compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid password',
        step: 'password_verification'
      }, { status: 401 })
    }
    
    console.log('✅ User authentication succeeded:', user.id)
    
    // Step 2: Check current sessions for this user
    const existingSessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { expires: 'desc' }
    })
    
    console.log('📊 Existing sessions for user:', existingSessions.length)
    
    // Step 3: Manually create a test session
    const testSessionToken = `test_session_${Date.now()}_${user.id}_${Math.random().toString(36).substring(2)}`
    
    const newSession = await prisma.session.create({
      data: {
        sessionToken: testSessionToken,
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })
    
    console.log('✅ Test session created:', newSession)
    
    // Step 4: Verify session was actually created
    const verifySession = await prisma.session.findUnique({
      where: { sessionToken: testSessionToken },
      include: { user: true }
    })
    
    // Step 5: Get updated session count
    const totalSessions = await prisma.session.count()
    const userSessions = await prisma.session.count({
      where: { userId: user.id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Session creation test completed',
      results: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          subscriptionTier: user.subscriptionTier
        },
        sessionCreation: {
          testSessionToken,
          sessionCreated: !!newSession,
          sessionVerified: !!verifySession,
          sessionData: verifySession
        },
        sessionCounts: {
          existingSessionsBeforeTest: existingSessions.length,
          currentUserSessions: userSessions,
          totalSystemSessions: totalSessions
        },
        previousSessions: existingSessions.map(s => ({
          sessionToken: s.sessionToken.substring(0, 20) + '...',
          expires: s.expires,
          createdAt: s.id
        }))
      }
    })
    
  } catch (error: any) {
    console.error('❌ Session creation test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      step: 'test_execution'
    }, { status: 500 })
  }
} 