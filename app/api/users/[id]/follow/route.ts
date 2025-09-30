import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/firebase-admin';

async function verifyFirebaseToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followingId } = await params;
    const body = await request.json();
    const { userId: followerId, follow } = body;

    // Verify Firebase token if provided
    const firebaseUid = await verifyFirebaseToken(request);

    if (!followingId || !followerId) {
      return NextResponse.json(
        { error: 'Following user ID and follower user ID are required' },
        { status: 400 }
      );
    }

    // Prevent self-following
    if (followingId === followerId) {
      return NextResponse.json(
        { error: 'Users cannot follow themselves' },
        { status: 400 }
      );
    }

    // Verify both users exist
    const [followingUser, followerUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: followingId } }),
      prisma.user.findUnique({ where: { id: followerId } })
    ]);

    if (!followingUser || !followerUser) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }

    // Check if follow relationship already exists
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (follow === false || (existingFollow && follow !== true)) {
      // Remove follow
      if (existingFollow) {
        await prisma.userFollow.delete({
          where: { id: existingFollow.id }
        });
      }
    } else {
      // Add follow
      if (!existingFollow) {
        await prisma.userFollow.create({
          data: {
            followerId,
            followingId
          }
        });

        // Create notification for the followed user
        await prisma.notification.create({
          data: {
            userId: followingId,
            type: 'USER_FOLLOWED',
            title: 'New Follower',
            message: `${followerUser.name || followerUser.anonymousUsername || 'Someone'} started following you`,
            metadata: JSON.stringify({
              followerId,
              followerName: followerUser.name || followerUser.anonymousUsername,
              followerAvatar: followerUser.avatarSeed
            })
          }
        });
      }
    }

    // Get updated follow counts
    const [followerCount, followingCount] = await Promise.all([
      prisma.userFollow.count({ where: { followingId } }), // Followers of the target user
      prisma.userFollow.count({ where: { followerId: followingId } }) // People the target user follows
    ]);

    const isFollowing = follow !== false && (existingFollow || follow === true);

    return NextResponse.json({
      success: true,
      isFollowing,
      followerCount,
      followingCount,
      user: {
        id: followingUser.id,
        name: followingUser.name,
        anonymousUsername: followingUser.anonymousUsername,
        avatarSeed: followingUser.avatarSeed,
        isAnonymous: followingUser.isAnonymous
      }
    });

  } catch (error) {
    console.error('Error processing user follow:', error);
    return NextResponse.json(
      { error: 'Failed to process user follow' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const followingId = params.id;
    const followerId = request.nextUrl.searchParams.get('userId');

    // Verify Firebase token if provided
    const firebaseUid = await verifyFirebaseToken(request);

    if (!followingId || !followerId) {
      return NextResponse.json(
        { error: 'Following user ID and follower user ID are required' },
        { status: 400 }
      );
    }

    // Remove follow
    await prisma.userFollow.deleteMany({
      where: {
        followerId,
        followingId
      }
    });

    // Get updated follow counts
    const [followerCount, followingCount] = await Promise.all([
      prisma.userFollow.count({ where: { followingId } }),
      prisma.userFollow.count({ where: { followerId: followingId } })
    ]);

    return NextResponse.json({
      success: true,
      isFollowing: false,
      followerCount,
      followingCount
    });

  } catch (error) {
    console.error('Error removing user follow:', error);
    return NextResponse.json(
      { error: 'Failed to remove user follow' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const followingId = params.id;
    const followerId = request.nextUrl.searchParams.get('userId');

    // Get follow counts
    const [followerCount, followingCount] = await Promise.all([
      prisma.userFollow.count({ where: { followingId } }),
      prisma.userFollow.count({ where: { followerId: followingId } })
    ]);

    let isFollowing = false;
    if (followerId && followerId !== followingId) {
      const existingFollow = await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId
          }
        }
      });
      isFollowing = !!existingFollow;
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: followingId },
      select: {
        id: true,
        name: true,
        anonymousUsername: true,
        avatarSeed: true,
        isAnonymous: true,
        role: true,
        subscriptionTier: true
      }
    });

    return NextResponse.json({
      isFollowing,
      followerCount,
      followingCount,
      user
    });

  } catch (error) {
    console.error('Error fetching user follow data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user follow data' },
      { status: 500 }
    );
  }
}