import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comment = await prisma.forumComment.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true
              }
            }
          }
        }
      }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Failed to fetch comment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comment' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    // Validate required fields
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Check if comment exists and user owns it or is admin
    const existingComment = await prisma.forumComment.findUnique({
      where: { id: params.id },
      select: { authorId: true, isDeleted: true }
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.isDeleted) {
      return NextResponse.json({ error: 'Comment is deleted' }, { status: 404 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (existingComment.authorId !== userId && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the comment
    const updatedComment = await prisma.forumComment.update({
      where: { id: params.id },
      data: {
        content: content.trim(),
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Failed to update comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if comment exists and user owns it or is admin
    const existingComment = await prisma.forumComment.findUnique({
      where: { id: params.id },
      select: { authorId: true, isDeleted: true }
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.isDeleted) {
      return NextResponse.json({ error: 'Comment already deleted' }, { status: 404 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (existingComment.authorId !== userId && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete the comment
    await prisma.forumComment.update({
      where: { id: params.id },
      data: {
        isDeleted: true,
        content: '[deleted]',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}