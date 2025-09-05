import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST() {
  try {
    const testEmail = 'pro@dealmecca.pro'
    const testPassword = 'password123'
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    })
    
    if (existingUser) {
      return NextResponse.json({
        message: 'Test user already exists',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          subscriptionTier: existingUser.subscriptionTier,
        }
      })
    }
    
    // Hash password
    const hashedPassword = await hash(testPassword, 12)
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Pro User',
        password: hashedPassword,
        role: 'ADMIN',
        subscriptionTier: 'PRO',
        subscriptionStatus: 'ACTIVE'
      }
    })
    
    return NextResponse.json({
      message: 'Test user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
      },
      credentials: {
        email: testEmail,
        password: testPassword
      }
    })
  } catch (error) {
    console.error('Setup test user error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to setup test user',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
} 