export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { safeHandler, bad } from '@/server/safeHandler';
import { requireAuth } from '@/server/requireAuth';
import { randomBytes } from 'crypto';
import { z } from 'zod';

const CreateCommentSchema = z.object({
  content: z.string().trim().min(1, 'Content is required').max(5000, 'Content too long'),
  parentId: z.string().optional().nullable(),
  isAnonymous: z.boolean().optional().default(false),
});

// Generate a random ID similar to CUID format
const generateId = () => {
  return `cmg${randomBytes(12).toString('base64url')}`;
};

/**
 * GET /api/forum/posts/[id]/comments
 * Get all comments for a post (public, no auth required)
 */
export const GET = safeHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  { requestId }
) => {
  const { id: postId } = await params;

  if (!postId) {
    return bad(400, requestId, 'post_id_required');
  }

  // Get all comments for this post with author information
  const comments = await prisma.forumComment.findMany({
    where: { postId },
    include: {
      User: {
        select: {
          id: true,
          publicHandle: true,
          name: true,
          anonymousUsername: true,
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
              publicHandle: true,
              name: true,
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

  return NextResponse.json(
    {
      comments: formattedComments,
      total: formattedComments.length,
      requestId,
    },
    { headers: { 'x-request-id': requestId } }
  );
});

/**
 * POST /api/forum/posts/[id]/comments
 * Create a new comment (requires auth)
 */
export const POST = safeHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  { requestId }
) => {
  // Authenticate user
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id: postId } = await params;

  if (!postId) {
    return bad(400, requestId, 'post_id_required');
  }

  // Parse and validate input
  let body;
  try {
    body = CreateCommentSchema.parse(await request.json());
  } catch (e: any) {
    return bad(400, requestId, 'invalid_input', { issues: e?.issues });
  }

  const { content, parentId, isAnonymous } = body;

  // Verify post exists
  const post = await prisma.forumPost.findUnique({
    where: { id: postId }
  });

  if (!post) {
    return bad(404, requestId, 'post_not_found');
  }

  // Generate unique ID for comment
  const commentId = generateId();

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
      anonymousAvatarId: null,
      updatedAt: new Date(),
    },
    include: {
      User: {
        select: {
          id: true,
          publicHandle: true,
          name: true,
          anonymousUsername: true,
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

  // Update the post's last activity time
  await prisma.forumPost.update({
    where: { id: postId },
    data: {
      lastActivityAt: new Date()
    }
  });

  // Create notifications for users following this post
  const followers = await prisma.postFollow.findMany({
    where: {
      postId,
      userId: { not: auth.dbUserId } // Don't notify the commenter themselves
    },
    select: {
      userId: true
    }
  });

  if (followers.length > 0) {
    const authorName = comment.User.anonymousUsername || comment.User.publicHandle || 'Someone';
    await prisma.notification.createMany({
      data: followers.map(follower => ({
        id: generateId(),
        userId: follower.userId,
        type: 'FORUM_COMMENT',
        title: 'New comment on a post you follow',
        message: `${authorName} commented on a post you're following`,
        isRead: false,
        metadata: JSON.stringify({
          postId,
          commentId: comment.id,
          authorId: auth.dbUserId
        }),
        createdAt: new Date()
      }))
    });
  }

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

  return NextResponse.json(
    {
      requestId,
      id: comment.id,
      comment: formattedComment,
    },
    {
      status: 201,
      headers: { 'x-request-id': requestId }
    }
  );
});
