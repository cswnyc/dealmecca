import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const body = await request.json();
    const { type, userId } = body;

    if (!commentId || !type || !userId) {
      return NextResponse.json(
        { error: 'Comment ID, vote type, and user ID are required' },
        { status: 400 }
      );
    }

    if (!['UPVOTE', 'DOWNVOTE'].includes(type)) {
      return NextResponse.json(
        { error: 'Vote type must be UPVOTE or DOWNVOTE' },
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

    let userVote: string | null = null;

    if (existingVote) {
      if (existingVote.type === type) {
        // Same vote type - remove the vote (toggle off)
        await prisma.forumCommentVote.delete({
          where: { id: existingVote.id }
        });
        userVote = null;
      } else {
        // Different vote type - update the vote
        await prisma.forumCommentVote.update({
          where: { id: existingVote.id },
          data: { type: type as 'UPVOTE' | 'DOWNVOTE' }
        });
        userVote = type;
      }
    } else {
      // No existing vote - create new vote
      await prisma.forumCommentVote.create({
        data: {
          userId,
          commentId,
          type: type as 'UPVOTE' | 'DOWNVOTE'
        }
      });
      userVote = type;
    }

    // Get updated vote counts
    const [upvoteCount, downvoteCount] = await Promise.all([
      prisma.forumCommentVote.count({
        where: { commentId, type: 'UPVOTE' }
      }),
      prisma.forumCommentVote.count({
        where: { commentId, type: 'DOWNVOTE' }
      })
    ]);

    // Update the comment's vote counts
    await prisma.forumComment.update({
      where: { id: commentId },
      data: {
        upvotes: upvoteCount,
        downvotes: downvoteCount
      }
    });

    return NextResponse.json({
      success: true,
      userVote,
      upvotes: upvoteCount,
      downvotes: downvoteCount,
      comment: {
        upvotes: upvoteCount,
        downvotes: downvoteCount
      }
    });

  } catch (error) {
    console.error('Error processing comment vote:', error);
    return NextResponse.json(
      { error: 'Failed to process comment vote' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const userId = request.nextUrl.searchParams.get('userId');

    // Get vote counts
    const [upvoteCount, downvoteCount] = await Promise.all([
      prisma.forumCommentVote.count({
        where: { commentId, type: 'UPVOTE' }
      }),
      prisma.forumCommentVote.count({
        where: { commentId, type: 'DOWNVOTE' }
      })
    ]);

    let userVote = null;
    if (userId) {
      const existingVote = await prisma.forumCommentVote.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId
          }
        }
      });
      userVote = existingVote?.type || null;
    }

    return NextResponse.json({
      upvotes: upvoteCount,
      downvotes: downvoteCount,
      userVote
    });

  } catch (error) {
    console.error('Error fetching comment vote data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comment vote data' },
      { status: 500 }
    );
  }
}
