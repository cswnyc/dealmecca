import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();
    
    // Simple security check - in production this should be more secure
    const adminSecret = process.env.ADMIN_SECRET || 'dealmecca-admin-2024';
    const providedSecret = request.headers.get('x-admin-secret');
    
    if (providedSecret !== adminSecret) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin secret' },
        { status: 401 }
      );
    }

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    const validRoles = ['FREE', 'PRO', 'TEAM_ADMIN', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Update user role
    const user = await prisma.user.update({
      where: { email },
      data: { 
        role: role as any,
        subscriptionTier: role === 'ADMIN' ? 'PRO' : role === 'PRO' ? 'PRO' : 'FREE'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `User ${email} promoted to ${role}`,
      user
    });

  } catch (error: any) {
    console.error('User promotion error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to promote user' },
      { status: 500 }
    );
  }
} 