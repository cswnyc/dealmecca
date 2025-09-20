import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { type, userId } = body;

    if (!postId || !type || !userId) {
      return NextResponse.json(
        { error: 'Post ID, vote type, and user ID are required' },
        { status: 400 }
      );
    }

    if (!['UPVOTE', 'DOWNVOTE'].includes(type)) {
      return NextResponse.json(
        { error: 'Vote type must be UPVOTE or DOWNVOTE' },
        { status: 400 }
      );
    }

    // Check if user has already voted on this post
    const existingVote = await prisma.forumVote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    let userVote: string | null = null;

    if (existingVote) {
      if (existingVote.type === type) {
        // Same vote type - remove the vote (toggle off)
        await prisma.forumVote.delete({
          where: { id: existingVote.id }
        });
        userVote = null;
      } else {
        // Different vote type - update the vote
        await prisma.forumVote.update({
          where: { id: existingVote.id },
          data: { type: type as 'UPVOTE' | 'DOWNVOTE' }
        });
        userVote = type;
      }
    } else {
      // No existing vote - create new vote
      await prisma.forumVote.create({
        data: {
          userId,
          postId,
          type: type as 'UPVOTE' | 'DOWNVOTE'
        }
      });
      userVote = type;
    }

    // Get updated vote counts
    const [upvoteCount, downvoteCount] = await Promise.all([
      prisma.forumVote.count({
        where: { postId, type: 'UPVOTE' }
      }),
      prisma.forumVote.count({
        where: { postId, type: 'DOWNVOTE' }
      })
    ]);

    // Update the post's vote counts
    await prisma.forumPost.update({
      where: { id: postId },
      data: {
        upvotes: upvoteCount,
        downvotes: downvoteCount
      }
    });

    return NextResponse.json({
      success: true,
      userVote,
      upvotes: upvoteCount,
      downvotes: downvoteCount
    });

  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const userId = request.nextUrl.searchParams.get('userId');

    // Get vote counts
    const [upvoteCount, downvoteCount] = await Promise.all([
      prisma.forumVote.count({
        where: { postId, type: 'UPVOTE' }
      }),
      prisma.forumVote.count({
        where: { postId, type: 'DOWNVOTE' }
      })
    ]);

    let userVote = null;
    if (userId) {
      const existingVote = await prisma.forumVote.findUnique({
        where: {
          userId_postId: {
            userId,
            postId
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
    console.error('Error fetching vote data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote data' },
      { status: 500 }
    );
  }
}
