export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { safeHandler, bad } from '@/server/safeHandler';
import { requireAuth } from '@/server/requireAuth';
import { z } from 'zod';

const VoteSchema = z.object({
  type: z.enum(['UPVOTE', 'DOWNVOTE']),
});

/**
 * POST /api/forum/posts/[id]/vote
 * Vote on a post (toggle voting - same vote type removes vote)
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
    body = VoteSchema.parse(await request.json());
  } catch (e: any) {
    return bad(400, requestId, 'invalid_input', { issues: e?.issues });
  }

  const { type } = body;

  // Check if user has already voted on this post
  const existingVote = await prisma.forumVote.findUnique({
    where: {
      userId_postId: {
        userId: auth.dbUserId,
        postId
      }
    }
  });

  let userVote: string | null = null;

  if (existingVote) {
    if (existingVote.type === type) {
      // Same vote type - remove the vote (toggle off)
      await prisma.forumVote.delete({
        where: { id: existingVote.id }
      });
      userVote = null;
    } else {
      // Different vote type - update the vote
      await prisma.forumVote.update({
        where: { id: existingVote.id },
        data: { type: type as 'UPVOTE' | 'DOWNVOTE' }
      });
      userVote = type;
    }
  } else {
    // No existing vote - create new vote
    await prisma.forumVote.create({
      data: {
        userId: auth.dbUserId,
        postId,
        type: type as 'UPVOTE' | 'DOWNVOTE'
      }
    });
    userVote = type;
  }

  // Get updated vote counts
  const [upvoteCount, downvoteCount] = await Promise.all([
    prisma.forumVote.count({
      where: { postId, type: 'UPVOTE' }
    }),
    prisma.forumVote.count({
      where: { postId, type: 'DOWNVOTE' }
    })
  ]);

  // Update the post's vote counts
  await prisma.forumPost.update({
    where: { id: postId },
    data: {
      upvotes: upvoteCount,
      downvotes: downvoteCount
    }
  });

  return NextResponse.json(
    {
      success: true,
      userVote,
      upvotes: upvoteCount,
      downvotes: downvoteCount,
      requestId,
    },
    { headers: { 'x-request-id': requestId } }
  );
});

/**
 * GET /api/forum/posts/[id]/vote
 * Get vote counts and user's vote status (optional auth)
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

  // Get vote counts
  const [upvoteCount, downvoteCount] = await Promise.all([
    prisma.forumVote.count({
      where: { postId, type: 'UPVOTE' }
    }),
    prisma.forumVote.count({
      where: { postId, type: 'DOWNVOTE' }
    })
  ]);

  // Optionally check user's vote if authenticated
  let userVote = null;
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const auth = await requireAuth(request);
    if (!(auth instanceof NextResponse)) {
      // User is authenticated - check their vote
      const existingVote = await prisma.forumVote.findUnique({
        where: {
          userId_postId: {
            userId: auth.dbUserId,
            postId
          }
        }
      });
      userVote = existingVote?.type || null;
    }
  }

  return NextResponse.json(
    {
      upvotes: upvoteCount,
      downvotes: downvoteCount,
      userVote,
      requestId,
    },
    { headers: { 'x-request-id': requestId } }
  );
});
