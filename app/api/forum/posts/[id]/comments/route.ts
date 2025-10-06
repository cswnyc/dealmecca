import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/firebase-admin';
import { randomBytes } from 'crypto';

// Generate a random ID similar to CUID format
const generateId = () => {
  return `cmg${randomBytes(12).toString('base64url')}`;
};

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
            email: true
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
                email: true
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
          anonymousAvatarId: reply.anonymousAvatarId,
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
        anonymousAvatarId: comment.anonymousAvatarId,
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

async function verifyFirebaseToken(request: NextRequest): Promise<{ uid: string; email?: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    return { uid: decodedToken.uid, email: decodedToken.email };
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return null;
  }
}

async function getUserByFirebaseUid(firebaseUid: string) {
  return await prisma.user.findFirst({
    where: {
      OR: [
        { firebaseUid },
        { email: firebaseUid }
      ]
    }
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { content, authorId, isAnonymous, anonymousHandle, anonymousAvatarId, parentId } = body;

    // Try Firebase authentication first
    let user = null;
    const firebaseAuth = await verifyFirebaseToken(request);

    if (firebaseAuth) {
      // Find user by Firebase UID
      user = await getUserByFirebaseUid(firebaseAuth.uid);
    } else {
      // Fallback: Check for LinkedIn auth cookie
      const linkedInAuthCookie = request.cookies.get('linkedin-auth');
      if (linkedInAuthCookie) {
        const cookieValue = linkedInAuthCookie.value;
        if (cookieValue.startsWith('linkedin-')) {
          const userId = cookieValue.replace('linkedin-', '');
          console.log('📝 Comment API: Using LinkedIn auth, user ID:', userId);

          // Find user by ID from cookie
          user = await prisma.user.findUnique({
            where: { id: userId }
          });
        }
      }
    }

    if (!user) {
      console.log('❌ Comment API: No authenticated user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ Comment API: User authenticated:', user.id);

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      );
    }

    // Generate unique ID for comment
    const commentId = generateId();
    console.log('🆕 Creating comment with ID:', commentId);

    // Create the comment
    const comment = await prisma.forumComment.create({
      data: {
        id: commentId,
        content,
        authorId: user.id,
        postId,
        parentId: parentId || null,
        isAnonymous: isAnonymous || false,
        anonymousHandle: isAnonymous ? anonymousHandle : null,
        anonymousAvatarId: isAnonymous ? anonymousAvatarId : null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
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
      anonymousAvatarId: comment.anonymousAvatarId,
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
