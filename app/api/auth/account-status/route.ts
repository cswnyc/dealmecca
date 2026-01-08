import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

/**
 * Get account status for the current user.
 * Works with both Firebase (dealmecca-session) and LinkedIn (linkedin-auth) cookies.
 */
export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;

    // Try to get user from dealmecca-session cookie (Firebase users)
    const sessionCookie = request.cookies.get('dealmecca-session');
    if (sessionCookie?.value) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
        const { payload } = await jwtVerify(sessionCookie.value, secret);
        userId = payload.sub as string;
        console.log('🔍 Account status: Found user from dealmecca-session:', userId);
      } catch (error) {
        console.log('🔍 Account status: dealmecca-session verification failed');
      }
    }

    // Try to get user from linkedin-auth cookie
    if (!userId) {
      const linkedinCookie = request.cookies.get('linkedin-auth');
      if (linkedinCookie?.value) {
        // LinkedIn cookie format: linkedin-{userId}
        const match = linkedinCookie.value.match(/^linkedin-(.+)$/);
        if (match) {
          userId = match[1];
          console.log('🔍 Account status: Found user from linkedin-auth:', userId);
        }
      }
    }

    if (!userId) {
      console.log('🔍 Account status: No authenticated user found');
      return NextResponse.json(
        { error: 'Not authenticated', accountStatus: null },
        { status: 401 }
      );
    }

    // Look up user's account status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accountStatus: true }
    });

    if (!user) {
      console.log('🔍 Account status: User not found in database:', userId);
      return NextResponse.json(
        { error: 'User not found', accountStatus: null },
        { status: 404 }
      );
    }

    console.log('🔍 Account status for user', userId, ':', user.accountStatus);

    return NextResponse.json({
      accountStatus: user.accountStatus,
      userId
    });

  } catch (error) {
    console.error('❌ Account status error:', error);
    return NextResponse.json(
      { error: 'Failed to check account status', accountStatus: null },
      { status: 500 }
    );
  }
}
