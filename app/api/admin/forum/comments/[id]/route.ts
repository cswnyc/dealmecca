import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/requireAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const comment = await prisma.forumComment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);

  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;
    const body = await request.json();
    const {
      content,
      isAnonymous = false,
      anonymousHandle,
      isModerated = false,
      moderationReason
    } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const existingComment = await prisma.forumComment.findUnique({
      where: { id }
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const updatedComment = await prisma.forumComment.update({
      where: { id },
      data: {
        content,
        isAnonymous,
        anonymousHandle,
        isModerated,
        moderationReason,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    return NextResponse.json(updatedComment);

  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const comment = await prisma.forumComment.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // If comment has replies, just mark it as deleted instead of actually deleting
    if (comment._count.replies > 0) {
      await prisma.forumComment.update({
        where: { id },
        data: {
          content: '[This comment has been deleted]',
          isModerated: true,
          moderationReason: 'Deleted by admin'
        }
      });
    } else {
      // Actually delete if no replies
      await prisma.forumComment.delete({
        where: { id }
      });
    }

    return NextResponse.json({
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}