import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('userId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Get post status and user interaction data
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        status: true,
        authorId: true,
        upvotes: true,
        downvotes: true,
        bookmarks: true,
        views: true
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    let userVote = null;
    let isBookmarked = false;
    let isFollowing = false;
    let dbUserId: string | null = null;

    if (firebaseUid) {
      // Find database user ID from Firebase UID
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { firebaseUid },
            { email: firebaseUid }
          ]
        },
        select: {
          id: true
        }
      });

      dbUserId = user?.id || null;

      if (dbUserId) {
        // Check if user has voted on this post
        const vote = await prisma.forumVote.findUnique({
          where: {
            userId_postId: {
              userId: dbUserId,
              postId
            }
          },
          select: {
            type: true
          }
        });

        userVote = vote?.type || null;

        // Check if user has bookmarked this post
        const bookmark = await prisma.forumBookmark.findUnique({
          where: {
            userId_postId: {
              userId: dbUserId,
              postId
            }
          }
        });

        isBookmarked = !!bookmark;

        // Check if user is following this post
        const follow = await prisma.postFollow.findUnique({
          where: {
            userId_postId: {
              userId: dbUserId,
              postId
            }
          }
        });

        isFollowing = !!follow;
      }
    }

    return NextResponse.json({
      postId: post.id,
      status: post.status,
      isAuthor: dbUserId === post.authorId,
      userVote,
      isBookmarked,
      isFollowing,
      stats: {
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        bookmarks: post.bookmarks,
        views: post.views
      }
    });

  } catch (error) {
    console.error('Error fetching post status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post status' },
      { status: 500 }
    );
  }
}
