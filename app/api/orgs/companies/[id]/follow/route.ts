import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/firebase-admin';

async function verifyFirebaseToken(request: NextRequest): Promise<{ uid: string; email?: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    return { uid: decodedToken.uid, email: decodedToken.email };
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return null;
  }
}

async function getUserByFirebaseUid(firebaseUid: string) {
  return await prisma.user.findFirst({
    where: {
      OR: [
        { firebaseUid },
        { email: firebaseUid }
      ]
    }
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;

    // Optional auth - return false if not authenticated
    const firebaseAuth = await verifyFirebaseToken(request);
    if (!firebaseAuth) {
      return NextResponse.json({ isFollowing: false });
    }

    const user = await getUserByFirebaseUid(firebaseAuth.uid);
    if (!user) {
      return NextResponse.json({ isFollowing: false });
    }

    const follow = await prisma.companyFollow.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: companyId
        }
      }
    });

    return NextResponse.json({ isFollowing: !!follow });

  } catch (error: any) {
    console.error('[COMPANY FOLLOW GET ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;

    // Verify Firebase token
    const firebaseAuth = await verifyFirebaseToken(request);
    if (!firebaseAuth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await getUserByFirebaseUid(firebaseAuth.uid);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.companyFollow.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: companyId
        }
      }
    });

    if (existingFollow) {
      return NextResponse.json({
        isFollowing: true,
        message: 'Already following this company'
      });
    }

    // Create follow
    await prisma.companyFollow.create({
      data: {
        id: nanoid(),
        userId: user.id,
        companyId: companyId
      }
    });

    return NextResponse.json({
      isFollowing: true,
      message: 'Successfully followed company'
    });

  } catch (error: any) {
    console.error('[COMPANY FOLLOW POST ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to follow company', details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;

    // Verify Firebase token
    const firebaseAuth = await verifyFirebaseToken(request);
    if (!firebaseAuth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await getUserByFirebaseUid(firebaseAuth.uid);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find and delete the follow
    await prisma.companyFollow.deleteMany({
      where: {
        userId: user.id,
        companyId: companyId
      }
    });

    return NextResponse.json({
      isFollowing: false,
      message: 'Successfully unfollowed company'
    });

  } catch (error: any) {
    console.error('[COMPANY FOLLOW DELETE ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow company', details: error?.message },
      { status: 500 }
    );
  }
}
