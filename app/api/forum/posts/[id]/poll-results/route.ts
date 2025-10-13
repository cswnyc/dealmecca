export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { safeHandler, bad } from '@/server/safeHandler';
import { requireAuth } from '@/server/requireAuth';

/**
 * GET /api/forum/posts/[id]/poll-results
 * Get poll results including vote counts, percentages, and user's vote (if authenticated)
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

  // Verify the post is a poll
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: {
      postType: true,
      pollChoices: true,
      pollEndsAt: true,
      pollDuration: true,
    },
  });

  if (!post) {
    return bad(404, requestId, 'post_not_found');
  }

  if (post.postType !== 'poll') {
    return bad(400, requestId, 'not_a_poll');
  }

  // Parse poll choices
  const pollChoices = post.pollChoices ? JSON.parse(post.pollChoices) : [];

  // Get all votes for this poll
  const allVotes = await prisma.pollVote.findMany({
    where: { postId },
    select: { choiceIndex: true },
  });

  // Calculate vote counts
  const voteCounts: Record<number, number> = {};
  pollChoices.forEach((_: any, index: number) => {
    voteCounts[index] = 0;
  });

  allVotes.forEach((vote) => {
    voteCounts[vote.choiceIndex] = (voteCounts[vote.choiceIndex] || 0) + 1;
  });

  const totalVotes = allVotes.length;

  // Calculate percentages
  const percentages: Record<number, number> = {};
  pollChoices.forEach((_: any, index: number) => {
    percentages[index] = totalVotes > 0
      ? Math.round((voteCounts[index] / totalVotes) * 100)
      : 0;
  });

  // Check if poll has ended
  const hasEnded = post.pollEndsAt ? new Date(post.pollEndsAt) < new Date() : false;

  // Optionally check user's vote if authenticated
  let userVote: number | null = null;
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const auth = await requireAuth(request);
    if (!(auth instanceof NextResponse)) {
      // User is authenticated - check their vote
      const existingVote = await prisma.pollVote.findUnique({
        where: {
          userId_postId: {
            userId: auth.dbUserId,
            postId,
          },
        },
      });
      userVote = existingVote?.choiceIndex ?? null;
    }
  }

  return NextResponse.json(
    {
      choices: pollChoices,
      voteCounts,
      percentages,
      totalVotes,
      userVote,
      hasEnded,
      pollEndsAt: post.pollEndsAt,
      requestId,
    },
    { headers: { 'x-request-id': requestId } }
  );
});
