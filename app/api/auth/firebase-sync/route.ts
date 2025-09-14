import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, displayName, photoURL, providerId, isNewUser } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Firebase UID and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists in database
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create new user in database
      user = await prisma.user.create({
        data: {
          id: uid, // Use Firebase UID as database ID
          email,
          name: displayName || null,
          role: 'FREE',
          subscriptionTier: 'FREE',
          subscriptionStatus: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log('🔥 Firebase user synced to database:', { uid, email, isNewUser: true });
    } else if (user.id !== uid) {
      // Update user ID if it doesn't match Firebase UID
      user = await prisma.user.update({
        where: { email },
        data: {
          id: uid,
          name: displayName || user.name,
          updatedAt: new Date()
        }
      });
      
      console.log('🔥 Firebase user updated in database:', { uid, email });
    }

    // Set session cookie
    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionTier: user.subscriptionTier
      }
    });

    // Set a session cookie for server-side authentication
    response.cookies.set('dealmecca-session', uid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Firebase sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Firebase user' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('dealmecca-session')?.value;

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Firebase session check error:', error);
    return NextResponse.json({ user: null });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, displayName, photoURL } = body;
    
    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Firebase UID and email are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: uid },
      data: {
        name: displayName || null,
        updatedAt: new Date()
      }
    });

    console.log('🔥 Firebase user profile updated:', { uid, email });

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Firebase profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.cookies.get('dealmecca-session')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Clear session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('dealmecca-session', '', {
      maxAge: 0,
      path: '/'
    });

    console.log('🔥 Firebase session cleared:', { userId });

    return response;

  } catch (error) {
    console.error('Firebase signout error:', error);
    return NextResponse.json(
      { error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}
