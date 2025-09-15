import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Get all comments for this post with author information
    const comments = await prisma.forumComment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                verified: true
              }
            }
          }
        },
        _count: {
          select: {
            votes: true,
            replies: true
          }
        },
        votes: {
          select: {
            type: true,
            userId: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    logoUrl: true,
                    verified: true
                  }
                }
              }
            },
            _count: {
              select: {
                votes: true
              }
            },
            votes: {
              select: {
                type: true,
                userId: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate vote counts for each comment
    const formattedComments = comments.map(comment => {
      const upvotes = comment.votes.filter(vote => vote.type === 'UPVOTE').length;
      const downvotes = comment.votes.filter(vote => vote.type === 'DOWNVOTE').length;
      
      // Format replies with vote counts
      const formattedReplies = comment.replies.map(reply => {
        const replyUpvotes = reply.votes.filter(vote => vote.type === 'UPVOTE').length;
        const replyDownvotes = reply.votes.filter(vote => vote.type === 'DOWNVOTE').length;
        
        return {
          id: reply.id,
          content: reply.content,
          isAnonymous: reply.isAnonymous,
          anonymousHandle: reply.anonymousHandle,
          author: reply.author,
          upvotes: replyUpvotes,
          downvotes: replyDownvotes,
          createdAt: reply.createdAt.toISOString(),
          updatedAt: reply.updatedAt.toISOString()
        };
      });

      return {
        id: comment.id,
        content: comment.content,
        isAnonymous: comment.isAnonymous,
        anonymousHandle: comment.anonymousHandle,
        author: comment.author,
        upvotes,
        downvotes,
        replyCount: comment._count.replies,
        replies: formattedReplies,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString()
      };
    });

    return NextResponse.json({
      comments: formattedComments,
      total: formattedComments.length
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { content, authorId, isAnonymous, anonymousHandle, parentId } = body;

    if (!postId || !content || !authorId) {
      return NextResponse.json(
        { error: 'Post ID, content, and author ID are required' },
        { status: 400 }
      );
    }

    // Create the comment
    const comment = await prisma.forumComment.create({
      data: {
        content,
        authorId,
        postId,
        parentId: parentId || null,
        isAnonymous: isAnonymous || false,
        anonymousHandle: isAnonymous ? anonymousHandle : null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                verified: true
              }
            }
          }
        },
        _count: {
          select: {
            votes: true,
            replies: true
          }
        }
      }
    });

    // Update the post's comment count
    const commentCount = await prisma.forumComment.count({
      where: { postId }
    });

    await prisma.forumPost.update({
      where: { id: postId },
      data: {
        commentsCount: commentCount,
        lastActivityAt: new Date()
      }
    });

    const formattedComment = {
      id: comment.id,
      content: comment.content,
      isAnonymous: comment.isAnonymous,
      anonymousHandle: comment.anonymousHandle,
      author: comment.author,
      upvotes: 0,
      downvotes: 0,
      replyCount: 0,
      replies: [],
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      comment: formattedComment
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
