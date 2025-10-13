export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { safeHandler, bad } from '@/server/safeHandler';
import { requireAuth } from '@/server/requireAuth';
import { z } from 'zod';

const UpdatePostSchema = z.object({
  content: z.string().trim().min(1).max(50000).optional(),
  categoryId: z.string().min(1).optional(),
  tags: z.string().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  dealSize: z.string().optional(),
  location: z.string().optional(),
});

/**
 * GET /api/forum/posts/[id]
 * Get a single post by ID (public, no auth required)
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

  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      User: {
        select: {
          id: true,
          publicHandle: true,
          name: true,
        }
      },
      ForumCategory: true,
      CompanyMention: {
        include: {
          companies: true
        }
      },
      ContactMention: {
        include: {
          contacts: true
        }
      },
      TopicMention: {
        include: {
          Topic: true
        }
      },
      _count: {
        select: {
          ForumComment: true,
          ForumVote: true,
        }
      }
    }
  });

  if (!post) {
    return bad(404, requestId, 'post_not_found');
  }

  // Increment view count
  await prisma.forumPost.update({
    where: { id: postId },
    data: { views: { increment: 1 } }
  });

  return NextResponse.json(
    { post, requestId },
    { headers: { 'x-request-id': requestId } }
  );
});

/**
 * PATCH /api/forum/posts/[id]
 * Edit a post (requires auth, owner only)
 */
export const PATCH = safeHandler(async (
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
    body = UpdatePostSchema.parse(await request.json());
  } catch (e: any) {
    return bad(400, requestId, 'invalid_input', { issues: e?.issues });
  }

  // Check if post exists and user is the author
  const existingPost = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { authorId: true }
  });

  if (!existingPost) {
    return bad(404, requestId, 'post_not_found');
  }

  if (existingPost.authorId !== auth.dbUserId) {
    return bad(403, requestId, 'forbidden', { detail: 'You can only edit your own posts' });
  }

  // Update the post
  const updated = await prisma.forumPost.update({
    where: { id: postId },
    data: {
      ...body,
      updatedAt: new Date(),
    },
    include: {
      User: {
        select: {
          id: true,
          publicHandle: true,
          name: true,
        }
      },
      ForumCategory: true,
    }
  });

  return NextResponse.json(
    { success: true, post: updated, requestId },
    { headers: { 'x-request-id': requestId } }
  );
});

/**
 * DELETE /api/forum/posts/[id]
 * Delete a post (requires auth, owner only)
 */
export const DELETE = safeHandler(async (
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

  // Check if post exists and user is the author
  const existingPost = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { authorId: true }
  });

  if (!existingPost) {
    return bad(404, requestId, 'post_not_found');
  }

  if (existingPost.authorId !== auth.dbUserId) {
    return bad(403, requestId, 'forbidden', { detail: 'You can only delete your own posts' });
  }

  // Delete the post (cascading deletes will handle comments, votes, etc.)
  await prisma.forumPost.delete({
    where: { id: postId }
  });

  return NextResponse.json(
    { success: true, requestId },
    { headers: { 'x-request-id': requestId } }
  );
});
