export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/requireAuth';
import { randomBytes } from 'crypto';

// Generate a random ID similar to CUID format
const generateId = () => {
  return `cmg${randomBytes(12).toString('base64url')}`;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Get all comments for this post with author information
    const comments = await prisma.forumComment.findMany({
      where: { postId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            ForumCommentVote: true,
            other_ForumComment: true
          }
        },
        ForumCommentVote: {
          select: {
            type: true,
            userId: true
          }
        },
        other_ForumComment: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                ForumCommentVote: true
              }
            },
            ForumCommentVote: {
              select: {
                type: true,
                userId: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate vote counts for each comment
    const formattedComments = comments.map(comment => {
      const upvotes = comment.ForumCommentVote.filter(vote => vote.type === 'UPVOTE').length;
      const downvotes = comment.ForumCommentVote.filter(vote => vote.type === 'DOWNVOTE').length;

      // Format replies with vote counts
      const formattedReplies = comment.other_ForumComment.map(reply => {
        const replyUpvotes = reply.ForumCommentVote.filter(vote => vote.type === 'UPVOTE').length;
        const replyDownvotes = reply.ForumCommentVote.filter(vote => vote.type === 'DOWNVOTE').length;

        return {
          id: reply.id,
          content: reply.content,
          isAnonymous: reply.isAnonymous,
          anonymousHandle: reply.anonymousHandle,
          anonymousAvatarId: reply.anonymousAvatarId,
          author: reply.User,
          upvotes: replyUpvotes,
          downvotes: replyDownvotes,
          createdAt: reply.createdAt.toISOString(),
          updatedAt: reply.updatedAt.toISOString()
        };
      });

      return {
        id: comment.id,
        content: comment.content,
        isAnonymous: comment.isAnonymous,
        anonymousHandle: comment.anonymousHandle,
        anonymousAvatarId: comment.anonymousAvatarId,
        author: comment.User,
        upvotes,
        downvotes,
        replyCount: comment._count.other_ForumComment,
        replies: formattedReplies,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString()
      };
    });

    return NextResponse.json({
      comments: formattedComments,
      total: formattedComments.length
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    // Authenticate user via Firebase ID token
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) {
      // requireAuth returned error response
      return auth;
    }

    console.log('✅ Comment API: User authenticated:', auth.dbUserId, 'handle:', auth.dbUserHandle);

    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const content = (body?.content || '').toString().trim();
    const parentId = body?.parentId || null;
    const isAnonymous = body?.isAnonymous || false;

    // Validate content
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Content must be 5000 characters or less' },
        { status: 400 }
      );
    }

    // Verify post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Generate unique ID for comment
    const commentId = generateId();
    console.log('🆕 Creating comment with ID:', commentId);

    // Create the comment with anonymized author info
    const comment = await prisma.forumComment.create({
      data: {
        id: commentId,
        content,
        authorId: auth.dbUserId,
        postId,
        parentId: parentId || null,
        isAnonymous: isAnonymous,
        // Store anonymized handle when anonymous
        anonymousHandle: isAnonymous ? auth.dbUserHandle : null,
        anonymousAvatarId: null // Can be enhanced later
      },
      include: {
        User: {
          select: {
            id: true,
            publicHandle: true,
            anonymousHandle: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            ForumCommentVote: true,
            other_ForumComment: true
          }
        }
      }
    });

    // Update the post's comment count
    const commentCount = await prisma.forumComment.count({
      where: { postId }
    });

    await prisma.forumPost.update({
      where: { id: postId },
      data: {
        commentsCount: commentCount,
        lastActivityAt: new Date()
      }
    });

    const formattedComment = {
      id: comment.id,
      content: comment.content,
      isAnonymous: comment.isAnonymous,
      anonymousHandle: comment.anonymousHandle,
      anonymousAvatarId: comment.anonymousAvatarId,
      author: comment.User,
      upvotes: 0,
      downvotes: 0,
      replyCount: 0,
      replies: [],
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      comment: formattedComment
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating comment:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        message: 'Failed to create comment',
        detail: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
