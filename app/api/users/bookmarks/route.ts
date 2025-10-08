import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { auth } from '@/lib/firebase-admin';

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

export async function GET(request: NextRequest) {
  try {
    // Verify Firebase token
    const firebaseAuth = await verifyFirebaseToken(request);
    if (!firebaseAuth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await getUserByFirebaseUid(firebaseAuth.uid);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get bookmarked posts
    const bookmarks = await prisma.forumBookmark.findMany({
      where: {
        userId: user.id
      },
      include: {
        ForumPost: {
          include: {
            author: {
              include: {
                company: true
              }
            },
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the expected format
    const transformedBookmarks = bookmarks.map(bookmark => ({
      id: bookmark.ForumPost.id,
      title: bookmark.ForumPost.title,
      content: bookmark.ForumPost.content,
      slug: bookmark.ForumPost.slug,
      isAnonymous: bookmark.ForumPost.isAnonymous,
      anonymousHandle: bookmark.ForumPost.anonymousHandle,
      urgency: bookmark.ForumPost.urgency,
      dealSize: bookmark.ForumPost.dealSize,
      location: bookmark.ForumPost.location,
      mediaType: bookmark.ForumPost.mediaType,
      views: bookmark.ForumPost.views,
      upvotes: bookmark.ForumPost.upvotes,
      downvotes: bookmark.ForumPost.downvotes,
      bookmarks: bookmark.ForumPost.bookmarks,
      isPinned: bookmark.ForumPost.isPinned,
      isLocked: bookmark.ForumPost.isLocked,
      isFeatured: bookmark.ForumPost.isFeatured,
      createdAt: bookmark.ForumPost.createdAt.toISOString(),
      updatedAt: bookmark.ForumPost.updatedAt.toISOString(),
      lastActivityAt: bookmark.ForumPost.lastActivityAt.toISOString(),
      author: {
        id: bookmark.ForumPost.author.id,
        name: bookmark.ForumPost.author.name,
        email: bookmark.ForumPost.author.email,
        company: bookmark.ForumPost.author.company ? {
          id: bookmark.ForumPost.author.company.id,
          name: bookmark.ForumPost.author.company.name,
          logoUrl: bookmark.ForumPost.author.company.logoUrl,
          verified: bookmark.ForumPost.author.company.verified,
          companyType: bookmark.ForumPost.author.company.companyType,
          industry: bookmark.ForumPost.author.company.industry,
          city: bookmark.ForumPost.author.company.city,
          state: bookmark.ForumPost.author.company.state,
        } : undefined
      },
      category: {
        id: bookmark.ForumPost.category.id,
        name: bookmark.ForumPost.category.name,
        slug: bookmark.ForumPost.category.slug,
        color: bookmark.ForumPost.category.color,
      }
    }));

    return NextResponse.json({
      success: true,
      bookmarks: transformedBookmarks
    });

  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}