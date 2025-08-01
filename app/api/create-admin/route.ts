import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Hash password
    const hashedPassword = await hash('password123', 12);
    
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@dealmecca.pro' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      
      // Update to ADMIN role if needed
      if (existingAdmin.role !== 'ADMIN') {
        const updatedUser = await prisma.user.update({
          where: { email: 'admin@dealmecca.pro' },
          data: { role: 'ADMIN' }
        });
        
        return NextResponse.json({
          message: 'Admin user role updated to ADMIN',
          user: {
            email: updatedUser.email,
            role: updatedUser.role
          },
          credentials: {
            email: 'admin@dealmecca.pro',
            password: 'password123'
          }
        });
      }
      
      return NextResponse.json({
        message: 'Admin user already exists with ADMIN role',
        user: {
          email: existingAdmin.email,
          role: existingAdmin.role
        },
        credentials: {
          email: 'admin@dealmecca.pro',
          password: 'password123'
        }
      });
    }
    
    // Create new admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@dealmecca.pro',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        subscriptionTier: 'PRO',
        subscriptionStatus: 'ACTIVE'
      }
    });
    
    // Also upgrade existing pro user
    const existingPro = await prisma.user.findUnique({
      where: { email: 'pro@dealmecca.pro' }
    });
    
    if (existingPro && existingPro.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email: 'pro@dealmecca.pro' },
        data: { role: 'ADMIN' }
      });
    }
    
    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        email: adminUser.email,
        role: adminUser.role
      },
      credentials: [
        {
          email: 'admin@dealmecca.pro',
          password: 'password123'
        },
        {
          email: 'pro@dealmecca.pro',
          password: 'test123'
        }
      ],
      note: 'Both users now have ADMIN role for dashboard access'
    });
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 