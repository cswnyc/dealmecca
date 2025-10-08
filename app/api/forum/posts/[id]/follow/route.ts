export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { safeHandler, bad } from '@/server/safeHandler';
import { requireAuth } from '@/server/requireAuth';
import { randomBytes } from 'crypto';
import { z } from 'zod';

// Generate a random ID similar to CUID format
const generateId = () => {
  return `cmg${randomBytes(12).toString('base64url')}`;
};

const FollowSchema = z.object({
  follow: z.boolean().optional(),
});

/**
 * POST /api/forum/posts/[id]/follow
 * Follow/unfollow a post
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

  // Parse input (follow field is optional, defaults to toggling)
  const body = await request.json().catch(() => ({}));
  const { follow } = FollowSchema.parse(body);

  // Check if follow relationship already exists
  const existingFollow = await prisma.postFollow.findUnique({
    where: {
      userId_postId: {
        userId: auth.dbUserId,
        postId
      }
    }
  });

  if (follow === false || (existingFollow && follow !== true)) {
    // Remove follow
    if (existingFollow) {
      await prisma.postFollow.delete({
        where: { id: existingFollow.id }
      });
    }
  } else {
    // Add follow
    if (!existingFollow) {
      await prisma.postFollow.create({
        data: {
          id: generateId(),
          userId: auth.dbUserId,
          postId
        }
      });
    }
  }

  // Get updated follow count
  const followCount = await prisma.postFollow.count({
    where: { postId }
  });

  const isFollowing = follow !== false && (existingFollow || follow === true);

  return NextResponse.json(
    {
      success: true,
      isFollowing,
      followCount,
      requestId,
    },
    { headers: { 'x-request-id': requestId } }
  );
});

/**
 * DELETE /api/forum/posts/[id]/follow
 * Unfollow a post
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

  // Remove follow
  await prisma.postFollow.deleteMany({
    where: {
      userId: auth.dbUserId,
      postId
    }
  });

  // Get updated follow count
  const followCount = await prisma.postFollow.count({
    where: { postId }
  });

  return NextResponse.json(
    {
      success: true,
      isFollowing: false,
      followCount,
      requestId,
    },
    { headers: { 'x-request-id': requestId } }
  );
});

/**
 * GET /api/forum/posts/[id]/follow
 * Get follow count and user's follow status (optional auth)
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

  // Get follow count
  const followCount = await prisma.postFollow.count({
    where: { postId }
  });

  // Optionally check user's follow status if authenticated
  let isFollowing = false;
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const auth = await requireAuth(request);
    if (!(auth instanceof NextResponse)) {
      const existingFollow = await prisma.postFollow.findUnique({
        where: {
          userId_postId: {
            userId: auth.dbUserId,
            postId
          }
        }
      });
      isFollowing = !!existingFollow;
    }
  }

  return NextResponse.json(
    {
      isFollowing,
      followCount,
      requestId,
    },
    { headers: { 'x-request-id': requestId } }
  );
});
