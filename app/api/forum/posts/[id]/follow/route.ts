import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const body = await request.json();
    const { userId, follow } = body;

    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'Post ID and user ID are required' },
        { status: 400 }
      );
    }

    // Check if follow relationship already exists
    const existingFollow = await prisma.postFollow.findUnique({
      where: {
        userId_postId: {
          userId,
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
            userId,
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