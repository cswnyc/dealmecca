import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { userId, follow } = body;

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

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if follow relationship already exists
    const existingFollow = await prisma.postFollow.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId
        }
      }
    });

    if (follow === false || (existingFollow && follow !== true)) {
      // Remove follow
      if (existingFollow) {
        await prisma.postFollow.delete({
          where: { id: existingFollow.id }
        });
      }
    } else {
      // Add follow
      if (!existingFollow) {
        await prisma.postFollow.create({
          data: {
            userId: user.id,
            postId
          }
        });
      }
    }

    // Get updated follow count
    const followCount = await prisma.postFollow.count({
      where: { postId }
    });

    const isFollowing = follow !== false && (existingFollow || follow === true);

    return NextResponse.json({
      success: true,
      isFollowing,
      followCount
    });

  } catch (error) {
    console.error('Error processing follow:', error);
    return NextResponse.json(
      { error: 'Failed to process follow' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'Post ID and user ID are required' },
        { status: 400 }
      );
    }

    // Remove follow
    await prisma.postFollow.deleteMany({
      where: {
        userId,
        postId
      }
    });

    // Get updated follow count
    const followCount = await prisma.postFollow.count({
      where: { postId }
    });

    return NextResponse.json({
      success: true,
      isFollowing: false,
      followCount
    });

  } catch (error) {
    console.error('Error removing follow:', error);
    return NextResponse.json(
      { error: 'Failed to remove follow' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const userId = request.nextUrl.searchParams.get('userId');

    // Get follow count
    const followCount = await prisma.postFollow.count({
      where: { postId }
    });

    let isFollowing = false;
    if (userId) {
      const existingFollow = await prisma.postFollow.findUnique({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      });
      isFollowing = !!existingFollow;
    }

    return NextResponse.json({
      isFollowing,
      followCount
    });

  } catch (error) {
    console.error('Error fetching follow data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follow data' },
      { status: 500 }
    );
  }
}