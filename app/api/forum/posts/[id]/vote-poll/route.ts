export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { safeHandler, bad } from '@/server/safeHandler';
import { requireAuth } from '@/server/requireAuth';
import { z } from 'zod';

const PollVoteSchema = z.object({
  choiceIndex: z.number().int().min(0),
});

/**
 * POST /api/forum/posts/[id]/vote-poll
 * Vote on a poll choice (allows changing vote)
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
    body = PollVoteSchema.parse(await request.json());
  } catch (e: any) {
    return bad(400, requestId, 'invalid_input', { issues: e?.issues });
  }

  const { choiceIndex } = body;

  // Verify the post is a poll
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: {
      postType: true,
      pollChoices: true,
      pollEndsAt: true,
    },
  });

  if (!post) {
    return bad(404, requestId, 'post_not_found');
  }

  if (post.postType !== 'poll') {
    return bad(400, requestId, 'not_a_poll');
  }

  // Check if poll has ended
  if (post.pollEndsAt && new Date(post.pollEndsAt) < new Date()) {
    return bad(400, requestId, 'poll_has_ended');
  }

  // Validate choiceIndex
  const pollChoices = post.pollChoices ? JSON.parse(post.pollChoices) : [];
  if (choiceIndex < 0 || choiceIndex >= pollChoices.length) {
    return bad(400, requestId, 'invalid_choice_index');
  }

  // Check if user has already voted on this poll
  const existingVote = await prisma.pollVote.findUnique({
    where: {
      userId_postId: {
        userId: auth.dbUserId,
        postId,
      },
    },
  });

  if (existingVote) {
    // Update existing vote
    await prisma.pollVote.update({
      where: { id: existingVote.id },
      data: {
        choiceIndex,
        updatedAt: new Date(),
      },
    });
  } else {
    // Create new vote
    await prisma.pollVote.create({
      data: {
        userId: auth.dbUserId,
        postId,
        choiceIndex,
      },
    });
  }

  // Get vote counts for all choices
  const allVotes = await prisma.pollVote.findMany({
    where: { postId },
    select: { choiceIndex: true },
  });

  const voteCounts: Record<number, number> = {};
  pollChoices.forEach((_: any, index: number) => {
    voteCounts[index] = 0;
  });

  allVotes.forEach((vote) => {
    voteCounts[vote.choiceIndex] = (voteCounts[vote.choiceIndex] || 0) + 1;
  });

  const totalVotes = allVotes.length;

  return NextResponse.json(
    {
      success: true,
      userVote: choiceIndex,
      voteCounts,
      totalVotes,
      requestId,
    },
    { headers: { 'x-request-id': requestId } }
  );
});
