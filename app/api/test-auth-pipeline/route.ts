import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, step } = await request.json()
    
    console.log('🧪 AUTH PIPELINE TEST STARTED')
    console.log('🧪 Test parameters:', { email, step, hasPassword: !!password })

    const results = {
      step,
      email,
      timestamp: new Date().toISOString(),
      tests: {}
    }

    // Step 1: Database Connection Test
    if (!step || step === 'database') {
      console.log('🧪 Testing database connection...')
      try {
        const userCount = await prisma.user.count()
        results.tests.database = {
          success: true,
          userCount,
          message: 'Database connection successful'
        }
        console.log('✅ Database test passed:', userCount, 'users found')
      } catch (dbError: any) {
        results.tests.database = {
          success: false,
          error: dbError.message,
          message: 'Database connection failed'
        }
        console.error('❌ Database test failed:', dbError)
      }
    }

    // Step 2: User Lookup Test
    if (email && (!step || step === 'user-lookup')) {
      console.log('🧪 Testing user lookup...')
      try {
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            subscriptionTier: true,
            password: true, // We'll check if it exists but not return it
            createdAt: true
          }
        })
        
        if (user) {
          results.tests.userLookup = {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              subscriptionTier: user.subscriptionTier,
              hasPassword: !!user.password,
              createdAt: user.createdAt
            },
            message: 'User found in database'
          }
          console.log('✅ User lookup passed:', user.email)
        } else {
          results.tests.userLookup = {
            success: false,
            user: null,
            message: 'User not found in database'
          }
          console.log('❌ User lookup failed: user not found')
        }
      } catch (userError: any) {
        results.tests.userLookup = {
          success: false,
          error: userError.message,
          message: 'User lookup database error'
        }
        console.error('❌ User lookup test failed:', userError)
      }
    }

    // Step 3: Password Verification Test
    if (email && password && (!step || step === 'password')) {
      console.log('🧪 Testing password verification...')
      try {
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, password: true }
        })
        
        if (user && user.password) {
          const isValid = await compare(password, user.password)
          results.tests.passwordVerification = {
            success: isValid,
            userId: user.id,
            message: isValid ? 'Password verification successful' : 'Invalid password'
          }
          console.log('🔐 Password verification result:', isValid)
        } else {
          results.tests.passwordVerification = {
            success: false,
            message: 'User not found or no password set'
          }
          console.log('❌ Password verification failed: no user or password')
        }
      } catch (passwordError: any) {
        results.tests.passwordVerification = {
          success: false,
          error: passwordError.message,
          message: 'Password verification error'
        }
        console.error('❌ Password verification test failed:', passwordError)
      }
    }

    // Step 4: Session Creation Test
    if (email && (!step || step === 'session')) {
      console.log('🧪 Testing manual session creation...')
      try {
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true }
        })
        
        if (user) {
          const testSessionToken = `test_pipeline_${Date.now()}_${user.id}_${Math.random().toString(36).substring(2)}`
          
          const session = await prisma.session.create({
            data: {
              sessionToken: testSessionToken,
              userId: user.id,
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
          })
          
          // Verify session was created
          const verifySession = await prisma.session.findUnique({
            where: { sessionToken: testSessionToken },
            include: { user: true }
          })
          
          results.tests.sessionCreation = {
            success: true,
            sessionId: session.id,
            sessionToken: testSessionToken.substring(0, 20) + '...',
            userId: user.id,
            verified: !!verifySession,
            expires: session.expires,
            message: 'Session creation successful'
          }
          console.log('✅ Session creation test passed')
        } else {
          results.tests.sessionCreation = {
            success: false,
            message: 'User not found for session creation'
          }
          console.log('❌ Session creation failed: user not found')
        }
      } catch (sessionError: any) {
        results.tests.sessionCreation = {
          success: false,
          error: sessionError.message,
          message: 'Session creation failed'
        }
        console.error('❌ Session creation test failed:', sessionError)
      }
    }

    // Step 5: Environment Variables Test
    if (!step || step === 'environment') {
      console.log('🧪 Testing environment variables...')
      results.tests.environment = {
        success: true,
        variables: {
          NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
          NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
          DATABASE_URL: !!process.env.DATABASE_URL,
          NODE_ENV: process.env.NODE_ENV,
          secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
          nextAuthUrl: process.env.NEXTAUTH_URL
        },
        message: 'Environment variables check complete'
      }
      console.log('🔍 Environment test completed')
    }

    // Overall success assessment
    const allTests = Object.values(results.tests)
    const successfulTests = allTests.filter(test => test.success)
    const failedTests = allTests.filter(test => !test.success)
    
    results.summary = {
      totalTests: allTests.length,
      successfulTests: successfulTests.length,
      failedTests: failedTests.length,
      overallSuccess: failedTests.length === 0,
      message: failedTests.length === 0 
        ? 'All authentication pipeline tests passed' 
        : `${failedTests.length} tests failed`
    }

    console.log('🧪 AUTH PIPELINE TEST COMPLETED')
    console.log('📊 Summary:', results.summary)

    return NextResponse.json({
      success: true,
      results
    })
    
  } catch (error: any) {
    console.error('❌ AUTH PIPELINE TEST ERROR:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // GET endpoint for basic environment and database testing
  return POST(request)
} 