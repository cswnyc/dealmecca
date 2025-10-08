export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { safeHandler, bad } from '@/server/safeHandler';
import { requireAuth } from '@/server/requireAuth';
import { randomBytes } from 'crypto';
import { z } from 'zod';

const BookmarkSchema = z.object({
  bookmark: z.boolean().optional(),
});

// Generate a random ID similar to CUID format
const generateId = () => {
  return `cmg${randomBytes(12).toString('base64url')}`;
};

/**
 * POST /api/forum/posts/[id]/bookmark
 * Bookmark/unbookmark a post
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

  // Parse input (bookmark field is optional, defaults to toggling)
  const body = await request.json().catch(() => ({}));
  const { bookmark } = BookmarkSchema.parse(body);

  // Check if bookmark relationship already exists
  const existingBookmark = await prisma.forumBookmark.findUnique({
    where: {
      userId_postId: {
        userId: auth.dbUserId,
        postId
      }
    }
  });

  if (bookmark === false || (existingBookmark && bookmark !== true)) {
    // Remove bookmark
    if (existingBookmark) {
      await prisma.forumBookmark.delete({
        where: { id: existingBookmark.id }
      });
    }
  } else {
    // Add bookmark
    if (!existingBookmark) {
      await prisma.forumBookmark.create({
        data: {
          id: generateId(),
          userId: auth.dbUserId,
          postId
        }
      });
    }
  }

  // Get updated bookmark count
  const bookmarkCount = await prisma.forumBookmark.count({
    where: { postId }
  });

  const isBookmarked = bookmark !== false && (existingBookmark || bookmark === true);

  return NextResponse.json(
    {
      success: true,
      isBookmarked,
      bookmarkCount,
      requestId,
    },
    { headers: { 'x-request-id': requestId } }
  );
});

/**
 * DELETE /api/forum/posts/[id]/bookmark
 * Remove bookmark from a post
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

  // Remove bookmark
  await prisma.forumBookmark.deleteMany({
    where: {
      userId: auth.dbUserId,
      postId
    }
  });

  // Get updated bookmark count
  const bookmarkCount = await prisma.forumBookmark.count({
    where: { postId }
  });

  return NextResponse.json(
    {
      success: true,
      isBookmarked: false,
      bookmarkCount,
      requestId,
    },
    { headers: { 'x-request-id': requestId } }
  );
});

/**
 * GET /api/forum/posts/[id]/bookmark
 * Get bookmark count and user's bookmark status (optional auth)
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

  // Get bookmark count
  const bookmarkCount = await prisma.forumBookmark.count({
    where: { postId }
  });

  // Optionally check user's bookmark status if authenticated
  let isBookmarked = false;
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const auth = await requireAuth(request);
    if (!(auth instanceof NextResponse)) {
      const existingBookmark = await prisma.forumBookmark.findUnique({
        where: {
          userId_postId: {
            userId: auth.dbUserId,
            postId
          }
        }
      });
      isBookmarked = !!existingBookmark;
    }
  }

  return NextResponse.json(
    {
      isBookmarked,
      bookmarkCount,
      requestId,
    },
    { headers: { 'x-request-id': requestId } }
  );
});
