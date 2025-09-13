import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: postId } = resolvedParams;
    const { type, userId } = await request.json();

    // Get user ID from session or use provided one
    const effectiveUserId = request.headers.get('x-user-id') || userId || 'cmejqubg80002s8j0jjcbxug0';

    console.log('Post vote - received type:', type, 'userId:', userId, 'effectiveUserId:', effectiveUserId);

    if (!['UPVOTE', 'DOWNVOTE'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      );
    }

    // Check if user has already voted on this post
    const existingVote = await prisma.forumVote.findUnique({
      where: {
        userId_postId: {
          userId: effectiveUserId,
          postId
        }
      }
    });

    let updatedPost;

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if clicking the same button
        await prisma.forumVote.delete({
          where: {
            userId_postId: {
              userId: effectiveUserId,
              postId
            }
          }
        });

        // Update post vote counts
        updatedPost = await prisma.forumPost.update({
          where: { id: postId },
          data: {
            upvotes: type === 'UPVOTE' ? { decrement: 1 } : undefined,
            downvotes: type === 'DOWNVOTE' ? { decrement: 1 } : undefined
          }
        });
      } else {
        // Update existing vote
        await prisma.forumVote.update({
          where: {
            userId_postId: {
              userId: effectiveUserId,
              postId
            }
          },
          data: { type: type }
        });

        // Update post vote counts
        const upvoteChange = type === 'UPVOTE' ? 1 : -1;
        const downvoteChange = type === 'DOWNVOTE' ? 1 : -1;

        updatedPost = await prisma.forumPost.update({
          where: { id: postId },
          data: {
            upvotes: { increment: upvoteChange },
            downvotes: { increment: downvoteChange }
          }
        });
      }
    } else {
      // Create new vote
      await prisma.forumVote.create({
        data: {
          userId: effectiveUserId,
          postId,
          type: type
        }
      });

      // Update post vote counts
      updatedPost = await prisma.forumPost.update({
        where: { id: postId },
        data: {
          upvotes: type === 'UPVOTE' ? { increment: 1 } : undefined,
          downvotes: type === 'DOWNVOTE' ? { increment: 1 } : undefined
        }
      });
    }

    return NextResponse.json({ 
      post: updatedPost,
      userVote: existingVote?.type === type ? null : type
    });

  } catch (error) {
    console.error('Failed to vote on post:', error);
    return NextResponse.json(
      { error: 'Failed to vote on post' },
      { status: 500 }
    );
  }
}
