import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const { voteType, userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    if (!['up', 'down'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      );
    }

    // Check if user has already voted on this comment
    const existingVote = await prisma.forumCommentVote.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId
        }
      }
    });

    let updatedComment;

    if (existingVote) {
              if (existingVote.type === voteType) {
        // Remove vote if clicking the same button
        await prisma.forumCommentVote.delete({
          where: {
            userId_commentId: {
              userId,
              commentId
            }
          }
        });

        // Update comment vote counts
        updatedComment = await prisma.forumComment.update({
          where: { id: commentId },
          data: {
            upvotes: voteType === 'up' ? { decrement: 1 } : undefined,
            downvotes: voteType === 'down' ? { decrement: 1 } : undefined
          }
        });
      } else {
        // Update existing vote
        await prisma.forumCommentVote.update({
          where: {
            userId_commentId: {
              userId,
              commentId
            }
          },
          data: { type: voteType }
        });

        // Update comment vote counts
        const upvoteChange = voteType === 'up' ? 1 : -1;
        const downvoteChange = voteType === 'down' ? 1 : -1;

        updatedComment = await prisma.forumComment.update({
          where: { id: commentId },
          data: {
            upvotes: { increment: upvoteChange },
            downvotes: { increment: downvoteChange }
          }
        });
      }
    } else {
      // Create new vote
      await prisma.forumCommentVote.create({
        data: {
          userId,
          commentId,
          type: voteType
        }
      });

      // Update comment vote counts
      updatedComment = await prisma.forumComment.update({
        where: { id: commentId },
        data: {
          upvotes: voteType === 'up' ? { increment: 1 } : undefined,
          downvotes: voteType === 'down' ? { increment: 1 } : undefined
        }
      });
    }

    return NextResponse.json({ 
      comment: updatedComment,
      userVote: existingVote?.type === voteType ? null : voteType
    });

  } catch (error) {
    console.error('Failed to vote on comment:', error);
    return NextResponse.json(
      { error: 'Failed to vote on comment' },
      { status: 500 }
    );
  }
}