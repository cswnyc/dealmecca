import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
        post: {
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
      id: bookmark.post.id,
      title: bookmark.post.title,
      content: bookmark.post.content,
      slug: bookmark.post.slug,
      isAnonymous: bookmark.post.isAnonymous,
      anonymousHandle: bookmark.post.anonymousHandle,
      urgency: bookmark.post.urgency,
      dealSize: bookmark.post.dealSize,
      location: bookmark.post.location,
      mediaType: bookmark.post.mediaType,
      views: bookmark.post.views,
      upvotes: bookmark.post.upvotes,
      downvotes: bookmark.post.downvotes,
      bookmarks: bookmark.post.bookmarks,
      isPinned: bookmark.post.isPinned,
      isLocked: bookmark.post.isLocked,
      isFeatured: bookmark.post.isFeatured,
      createdAt: bookmark.post.createdAt.toISOString(),
      updatedAt: bookmark.post.updatedAt.toISOString(),
      lastActivityAt: bookmark.post.lastActivityAt.toISOString(),
      author: {
        id: bookmark.post.author.id,
        name: bookmark.post.author.name,
        email: bookmark.post.author.email,
        company: bookmark.post.author.company ? {
          id: bookmark.post.author.company.id,
          name: bookmark.post.author.company.name,
          logoUrl: bookmark.post.author.company.logoUrl,
          verified: bookmark.post.author.company.verified,
          companyType: bookmark.post.author.company.companyType,
          industry: bookmark.post.author.company.industry,
          city: bookmark.post.author.company.city,
          state: bookmark.post.author.company.state,
        } : undefined
      },
      category: {
        id: bookmark.post.category.id,
        name: bookmark.post.category.name,
        slug: bookmark.post.category.slug,
        color: bookmark.post.category.color,
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