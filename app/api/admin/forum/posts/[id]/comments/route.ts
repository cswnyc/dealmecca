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

    const comments = await prisma.forumComment.findMany({
      where: { postId: id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform to match frontend expectations
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      userId: comment.userId,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      author: comment.User
    }));

    return NextResponse.json({ comments: formattedComments });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
