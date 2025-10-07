export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { safeHandler, bad } from '@/server/safeHandler';
import { requireAuth } from '@/server/requireAuth';
import { prisma } from '@/server/prisma';

/**
 * POST /api/forum/topics/[topicId]/follow
 * Follow a topic (idempotent)
 */
export const POST = safeHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
  { requestId }
) => {
  // Authenticate user
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { topicId } = await params;

  if (!topicId) {
    return bad(400, requestId, 'topic_id_required');
  }

  // Verify topic exists
  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  });

  if (!topic) {
    return bad(404, requestId, 'topic_not_found');
  }

  // Idempotent upsert by unique(userId, topicId)
  const created = await prisma.topicFollow.upsert({
    where: {
      userId_topicId: {
        userId: auth.dbUserId,
        topicId
      }
    },
    update: {},
    create: {
      userId: auth.dbUserId,
      topicId
    },
  });

  return NextResponse.json(
    { requestId, id: created.id },
    {
      status: 201,
      headers: { 'x-request-id': requestId }
    }
  );
});

/**
 * DELETE /api/forum/topics/[topicId]/follow
 * Unfollow a topic (idempotent)
 */
export const DELETE = safeHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> },
  { requestId }
) => {
  // Authenticate user
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { topicId } = await params;

  if (!topicId) {
    return bad(400, requestId, 'topic_id_required');
  }

  // Idempotent: delete if exists
  await prisma.topicFollow.deleteMany({
    where: {
      userId: auth.dbUserId,
      topicId
    }
  });

  return NextResponse.json(
    { requestId, ok: true },
    {
      status: 200,
      headers: { 'x-request-id': requestId }
    }
  );
});
