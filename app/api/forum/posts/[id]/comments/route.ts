import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    // Fetch comments for this post
    const comments = await prisma.forumComment.findMany({
      where: { 
        postId: postId,
        isDeleted: false
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
      },
      orderBy: [
        { createdAt: 'asc' }
      ],
      take: 20 // Limit to first 20 comments for expandable view
    });

    return NextResponse.json({ 
      comments,
      total: comments.length
    });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
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
    // Get user info from middleware headers or allow anonymous posting
    const userId = request.headers.get('x-user-id');
    
    const body = await request.json();
    const { content, isAnonymous, anonymousHandle, authorId } = body;
    
    // For anonymous posts, use a default user ID or the provided authorId
    const effectiveUserId = userId || authorId || 'cmejqubg80002s8j0jjcbxug0'; // Default user for anonymous posts
    const { id: postId } = await params;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Check if post exists and is not locked
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true, isLocked: true }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.isLocked) {
      return NextResponse.json(
        { error: 'This post is locked and cannot accept new comments' },
        { status: 403 }
      );
    }

    // Create the comment
    const comment = await prisma.forumComment.create({
      data: {
        content: content.trim(),
        authorId: effectiveUserId,
        postId: postId,
        isAnonymous: Boolean(isAnonymous),
        anonymousHandle: isAnonymous || !userId ? (anonymousHandle || `User${Math.random().toString(36).substr(2, 6)}`) : null
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

    // Track networking activity (only for real users)
    if (userId) {
      await prisma.userNetworkingActivity.create({
        data: {
          userId,
          interactionType: 'FORUM_COMMENT_POSTED',
          metadata: JSON.stringify({
            postId: postId,
            commentId: comment.id
          })
        },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
