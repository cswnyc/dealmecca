import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const body = await request.json();
    const { userId, bookmark } = body;

    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'Post ID and user ID are required' },
        { status: 400 }
      );
    }

    // Check if bookmark already exists
    const existingBookmark = await prisma.forumBookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    if (bookmark === false || (existingBookmark && bookmark !== true)) {
      // Remove bookmark
      if (existingBookmark) {
        await prisma.forumBookmark.delete({
          where: { id: existingBookmark.id }
        });
      }
    } else {
      // Add bookmark
      if (!existingBookmark) {
        await prisma.forumBookmark.create({
          data: {
            userId,
            postId
          }
        });
      }
    }

    // Get updated bookmark count
    const bookmarkCount = await prisma.forumBookmark.count({
      where: { postId }
    });

    // Update the post's bookmark count
    await prisma.forumPost.update({
      where: { id: postId },
      data: {
        bookmarks: bookmarkCount
      }
    });

    const isBookmarked = bookmark !== false && (existingBookmark || bookmark === true);

    return NextResponse.json({
      success: true,
      isBookmarked,
      bookmarkCount
    });

  } catch (error) {
    console.error('Error processing bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to process bookmark' },
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

    // Remove bookmark
    await prisma.forumBookmark.deleteMany({
      where: {
        userId,
        postId
      }
    });

    // Get updated bookmark count
    const bookmarkCount = await prisma.forumBookmark.count({
      where: { postId }
    });

    // Update the post's bookmark count
    await prisma.forumPost.update({
      where: { id: postId },
      data: {
        bookmarks: bookmarkCount
      }
    });

    return NextResponse.json({
      success: true,
      isBookmarked: false,
      bookmarkCount
    });

  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to remove bookmark' },
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

    // Get bookmark count
    const bookmarkCount = await prisma.forumBookmark.count({
      where: { postId }
    });

    let isBookmarked = false;
    if (userId) {
      const existingBookmark = await prisma.forumBookmark.findUnique({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      });
      isBookmarked = !!existingBookmark;
    }

    return NextResponse.json({
      isBookmarked,
      bookmarkCount
    });

  } catch (error) {
    console.error('Error fetching bookmark data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmark data' },
      { status: 500 }
    );
  }
}