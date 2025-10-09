export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { safeHandler, bad } from '@/server/safeHandler';
import { requireAuth } from '@/server/requireAuth';

/**
 * GET /api/forum/comments/[id]
 * Get a single comment by ID
 */
export const GET = safeHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  { requestId }
) => {
  const { id: commentId } = await params;

  if (!commentId) {
    return bad(400, requestId, 'comment_id_required');
  }

  const comment = await prisma.forumComment.findUnique({
    where: { id: commentId },
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
          ForumCommentVote: true,
          other_ForumComment: true,
        }
      }
    }
  });

  if (!comment) {
    return bad(404, requestId, 'comment_not_found');
  }

  return NextResponse.json(
    { comment, requestId },
    { headers: { 'x-request-id': requestId } }
  );
});

/**
 * DELETE /api/forum/comments/[id]
 * Delete a comment (requires auth, owner only)
 */
export const DELETE = safeHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  { requestId }
) => {
  // Authenticate user
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id: commentId } = await params;

  if (!commentId) {
    return bad(400, requestId, 'comment_id_required');
  }

  // Check if comment exists and user is the author
  const existingComment = await prisma.forumComment.findUnique({
    where: { id: commentId },
    select: {
      authorId: true,
      postId: true,
    }
  });

  if (!existingComment) {
    return bad(404, requestId, 'comment_not_found');
  }

  if (existingComment.authorId !== auth.dbUserId) {
    return bad(403, requestId, 'forbidden', { detail: 'You can only delete your own comments' });
  }

  // Delete the comment (cascading deletes will handle votes, replies, etc.)
  await prisma.forumComment.delete({
    where: { id: commentId }
  });

  // Update the post's last activity time
  await prisma.forumPost.update({
    where: { id: existingComment.postId },
    data: {
      lastActivityAt: new Date()
    }
  });

  return NextResponse.json(
    { success: true, requestId },
    { headers: { 'x-request-id': requestId } }
  );
});
