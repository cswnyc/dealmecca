import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: postId } = await params;

    // Check if user has already bookmarked this post
    const existingBookmark = await prisma.forumBookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    });

    if (existingBookmark) {
      // User is removing their bookmark
      await prisma.forumBookmark.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: postId
          }
        }
      });

      // Update post bookmark count
      await prisma.forumPost.update({
        where: { id: postId },
        data: {
          bookmarks: { decrement: 1 }
        }
      });

      return NextResponse.json({ message: 'Bookmark removed' });
    } else {
      // User is bookmarking for the first time
      await prisma.forumBookmark.create({
        data: {
          userId: session.user.id,
          postId: postId
        }
      });

      // Update post bookmark count
      await prisma.forumPost.update({
        where: { id: postId },
        data: {
          bookmarks: { increment: 1 }
        }
      });

      return NextResponse.json({ message: 'Bookmark added' });
    }
  } catch (error) {
    console.error('Failed to process bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to process bookmark' },
      { status: 500 }
    );
  }
} 