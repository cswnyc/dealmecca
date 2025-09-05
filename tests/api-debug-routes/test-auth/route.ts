import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Testing auth for email:', email);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        subscriptionTier: true
      }
    });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        debug: 'No user found with this email'
      });
    }
    
    console.log('✅ User found:', { id: user.id, email: user.email, role: user.role });
    
    if (!user.password) {
      return NextResponse.json({
        success: false,
        error: 'No password set',
        debug: 'User exists but has no password (maybe OAuth only?)',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          hasPassword: false
        }
      });
    }
    
    console.log('🔑 Testing password...');
    const isPasswordValid = await compare(password, user.password);
    
    return NextResponse.json({
      success: isPasswordValid,
      message: isPasswordValid ? 'Authentication successful' : 'Invalid password',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        hasPassword: !!user.password,
        passwordMatch: isPasswordValid
      },
      debug: {
        userExists: true,
        hasPassword: !!user.password,
        passwordProvided: !!password,
        passwordMatch: isPasswordValid
      }
    });
    
  } catch (error: any) {
    console.error('❌ Auth test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Authentication test failed',
      details: error.message,
      debug: 'Exception occurred during authentication test'
    }, { status: 500 });
  }
} 