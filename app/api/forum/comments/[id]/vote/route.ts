import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: commentId } = resolvedParams;
    const { type, userId } = await request.json();
    
    // Get user ID from session or use provided one
    const effectiveUserId = request.headers.get('x-user-id') || userId || 'cmejqubg80002s8j0jjcbxug0';

    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    // Convert frontend vote types to database enum values  
    let voteType;
    if (type === 'upvote' || type === 'up') {
      voteType = 'UPVOTE';
    } else if (type === 'downvote' || type === 'down') {
      voteType = 'DOWNVOTE';
    } else {
      voteType = type.toUpperCase();
    }

    console.log('Comment vote - received type:', type, 'converted to:', voteType);

    if (!['UPVOTE', 'DOWNVOTE'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      );
    }

    // Check if user has already voted on this comment
    const existingVote = await prisma.forumCommentVote.findUnique({
      where: {
        userId_commentId: {
          userId: effectiveUserId,
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
              userId: effectiveUserId,
              commentId
            }
          }
        });

        // Update comment vote counts
        updatedComment = await prisma.forumComment.update({
          where: { id: commentId },
          data: {
            upvotes: voteType === 'UPVOTE' ? { decrement: 1 } : undefined,
            downvotes: voteType === 'DOWNVOTE' ? { decrement: 1 } : undefined
          }
        });
      } else {
        // Update existing vote
        await prisma.forumCommentVote.update({
          where: {
            userId_commentId: {
              userId: effectiveUserId,
              commentId
            }
          },
          data: { type: voteType }
        });

        // Update comment vote counts
        const upvoteChange = voteType === 'UPVOTE' ? 1 : -1;
        const downvoteChange = voteType === 'DOWNVOTE' ? 1 : -1;

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
          userId: effectiveUserId,
          commentId,
          type: voteType
        }
      });

      // Update comment vote counts
      updatedComment = await prisma.forumComment.update({
        where: { id: commentId },
        data: {
          upvotes: voteType === 'UPVOTE' ? { increment: 1 } : undefined,
          downvotes: voteType === 'DOWNVOTE' ? { increment: 1 } : undefined
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