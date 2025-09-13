import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetId, targetType, action } = await request.json();

    if (!targetId || !targetType || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: targetId, targetType, action' },
        { status: 400 }
      );
    }

    if (!['company', 'contact'].includes(targetType)) {
      return NextResponse.json(
        { error: 'Invalid targetType. Must be "company" or "contact"' },
        { status: 400 }
      );
    }

    if (!['follow', 'unfollow'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "follow" or "unfollow"' },
        { status: 400 }
      );
    }

    const userId = request.headers.get('x-user-id');

    if (action === 'follow') {
      // Create follow relationship
      const followData = {
        followerId: userId,
        ...(targetType === 'company' ? { companyId: targetId } : { contactId: targetId })
      };

      // Check if already following to avoid duplicates
      const existingFollow = await prisma.userConnection.findFirst({
        where: followData
      });

      if (existingFollow) {
        return NextResponse.json(
          { message: 'Already following this ' + targetType },
          { status: 200 }
        );
      }

      await prisma.userConnection.create({
        data: {
          ...followData,
          connectionType: 'FOLLOWING',
          createdAt: new Date()
        }
      });

    } else {
      // Remove follow relationship
      const whereClause = {
        followerId: userId,
        connectionType: 'FOLLOWING',
        ...(targetType === 'company' ? { companyId: targetId } : { contactId: targetId })
      };

      await prisma.userConnection.deleteMany({
        where: whereClause
      });
    }

    // Get updated follower count
    const followerCount = await prisma.userConnection.count({
      where: {
        connectionType: 'FOLLOWING',
        ...(targetType === 'company' ? { companyId: targetId } : { contactId: targetId })
      }
    });

    // Check if current user is following
    const isFollowing = await prisma.userConnection.findFirst({
      where: {
        followerId: userId,
        connectionType: 'FOLLOWING',
        ...(targetType === 'company' ? { companyId: targetId } : { contactId: targetId })
      }
    });

    return NextResponse.json({
      success: true,
      action,
      targetType,
      targetId,
      followerCount,
      isFollowing: !!isFollowing
    });

  } catch (error) {
    console.error('Follow action error:', error);
    return NextResponse.json(
      { error: 'Failed to process follow action' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType');

    if (!targetId || !targetType) {
      return NextResponse.json(
        { error: 'Missing targetId or targetType' },
        { status: 400 }
      );
    }

    const userId = request.headers.get('x-user-id');

    // Get follow status and count
    const [isFollowing, followerCount] = await Promise.all([
      prisma.userConnection.findFirst({
        where: {
          followerId: userId,
          connectionType: 'FOLLOWING',
          ...(targetType === 'company' ? { companyId: targetId } : { contactId: targetId })
        }
      }),
      prisma.userConnection.count({
        where: {
          connectionType: 'FOLLOWING',
          ...(targetType === 'company' ? { companyId: targetId } : { contactId: targetId })
        }
      })
    ]);

    return NextResponse.json({
      targetId,
      targetType,
      isFollowing: !!isFollowing,
      followerCount
    });

  } catch (error) {
    console.error('Follow status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
}