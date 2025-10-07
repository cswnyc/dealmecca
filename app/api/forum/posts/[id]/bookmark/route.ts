export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeHandler, bad } from '@/server/safeHandler';
import { requireAuth } from '@/server/requireAuth';

export const POST = safeHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  { requestId }
) => {
  // Authenticate user
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id: postId } = await params;
  const body = await request.json().catch(() => ({}));
  const { bookmark } = body;

  if (!postId) {
    return bad(400, requestId, 'post_id_required');
  }

  // Check if bookmark already exists
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

  // Update the post's bookmark count
  await prisma.forumPost.update({
    where: { id: postId },
    data: {
      bookmarks: bookmarkCount
    }
  });

  const isBookmarked = bookmark !== false && (existingBookmark || bookmark === true);

  return NextResponse.json(
    {
      success: true,
      isBookmarked,
      bookmarkCount,
      requestId,
    },
    {
      headers: { 'x-request-id': requestId },
    }
  );
});

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

  // Update the post's bookmark count
  await prisma.forumPost.update({
    where: { id: postId },
    data: {
      bookmarks: bookmarkCount
    }
  });

  return NextResponse.json(
    {
      success: true,
      isBookmarked: false,
      bookmarkCount,
      requestId,
    },
    {
      headers: { 'x-request-id': requestId },
    }
  );
});

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

  // Check if current user has bookmarked (if authenticated)
  let isBookmarked = false;
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    // Optional auth - don't fail if not authenticated
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
    {
      headers: { 'x-request-id': requestId },
    }
  );
});