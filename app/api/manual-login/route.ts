import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();
    
    console.log('🔐 Manual login attempt for:', email);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }
    
    // For testing - bypass password check if no password provided
    if (password && user.password) {
      const isValid = await compare(password, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    } else if (password) {
      return NextResponse.json({ error: 'Password required but not set for user' }, { status: 401 });
    }
    // If no password provided, allow bypass for testing
    
    console.log('✅ Manual login successful for:', email, 'Role:', user.role);
    
    // Create JWT token manually
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionTier: user.subscriptionTier
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);
    
    console.log('🔐 Created JWT token');
    
    // Create response with manual cookie setting
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      message: 'Login successful - redirecting to admin'
    });
    
    // Set the session cookie manually
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set({
      name: 'next-auth.session-token',
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      ...(isProduction && { domain: '.getmecca.com' }),
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });
    
    console.log('🍪 Set session cookie manually');
    
    return response;
    
  } catch (error) {
    console.error('❌ Manual login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}