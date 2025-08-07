import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { SignJWT } from 'jose'

export async function POST(request: NextRequest) {
  console.log('🔐 === AUTH LOGIN START ===')
  
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password required'
      }, { status: 400 })
    }
    
    console.log('🔑 Authenticating user:', email)
    
    // Step 1: Verify credentials
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        subscriptionTier: true
      }
    })
    
    if (!user || !user.password) {
      console.log('❌ User not found or no password')
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }
    
    const isPasswordValid = await compare(password, user.password)
    if (!isPasswordValid) {
      console.log('❌ Invalid password')
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }
    
    console.log('✅ Credentials validated successfully')
    
    // Step 2: Create NextAuth-compatible JWT token
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')
    
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    }
    
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret)
    
    console.log('✅ JWT token created')
    
    // Step 3: Create response with NextAuth-compatible session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionTier: user.subscriptionTier
      },
      redirectUrl: user.role === 'ADMIN' ? '/admin' : '/dashboard-test'
    })
    
    // Set NextAuth-compatible session cookie
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // Only secure in production
      sameSite: 'lax' as const,
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      ...(isProduction && { domain: '.getmecca.com' }) // Only set domain in production
    }
    
    response.cookies.set('next-auth.session-token', token, cookieOptions)
    
    // Also set CSRF token cookie for compatibility
    const csrfToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
    response.cookies.set('next-auth.csrf-token', csrfToken, {
      httpOnly: true,
      secure: isProduction, // Only secure in production
      sameSite: 'lax' as const,
      maxAge: 60 * 60, // 1 hour
      path: '/',
      ...(isProduction && { domain: '.getmecca.com' }) // Only set domain in production
    })
    
    console.log('✅ Session cookies set successfully')
    console.log('🔐 === AUTH LOGIN COMPLETE ===')
    
    return response
    
  } catch (error) {
    console.error('❌ Auth login error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 