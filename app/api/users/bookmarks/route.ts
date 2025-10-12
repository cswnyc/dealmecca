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
            User: {
              include: {
                companies: true
              }
            },
            ForumCategory: true,
            CompanyMention: {
              include: {
                companies: true
              }
            },
            ContactMention: {
              include: {
                contacts: true
              }
            },
            _count: {
              select: {
                ForumComment: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch primary topics for posts
    const postsWithPrimaryTopics = await Promise.all(
      bookmarks.map(async (bookmark) => {
        let primaryTopic = null;
        if (bookmark.ForumPost.primaryTopicId && bookmark.ForumPost.primaryTopicType) {
          try {
            if (bookmark.ForumPost.primaryTopicType === 'contact') {
              const contact = await prisma.contacts.findUnique({
                where: { id: bookmark.ForumPost.primaryTopicId },
                select: { id: true, fullName: true, title: true }
              });
              if (contact) {
                primaryTopic = {
                  id: contact.id,
                  name: contact.fullName,
                  type: bookmark.ForumPost.primaryTopicType,
                  description: contact.title
                };
              }
            } else {
              const company = await prisma.companies.findUnique({
                where: { id: bookmark.ForumPost.primaryTopicId },
                select: { id: true, name: true, description: true }
              });
              if (company) {
                primaryTopic = {
                  id: company.id,
                  name: company.name,
                  type: bookmark.ForumPost.primaryTopicType,
                  description: company.description
                };
              }
            }
          } catch (error) {
            console.error('Error fetching primary topic:', error);
          }
        }
        return { bookmark, primaryTopic };
      })
    );

    // Transform the data to match the expected format
    const transformedBookmarks = postsWithPrimaryTopics.map(({ bookmark, primaryTopic }) => ({
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
      primaryTopicType: bookmark.ForumPost.primaryTopicType,
      primaryTopicId: bookmark.ForumPost.primaryTopicId,
      primaryTopic,
      createdAt: bookmark.ForumPost.createdAt.toISOString(),
      updatedAt: bookmark.ForumPost.updatedAt.toISOString(),
      lastActivityAt: bookmark.ForumPost.lastActivityAt.toISOString(),
      author: {
        id: bookmark.ForumPost.User.id,
        name: bookmark.ForumPost.User.name,
        email: bookmark.ForumPost.User.email,
        anonymousUsername: bookmark.ForumPost.User.anonymousUsername,
        publicHandle: bookmark.ForumPost.User.publicHandle,
        company: bookmark.ForumPost.User.companies ? {
          id: bookmark.ForumPost.User.companies.id,
          name: bookmark.ForumPost.User.companies.name,
          logoUrl: bookmark.ForumPost.User.companies.logoUrl,
          verified: bookmark.ForumPost.User.companies.verified,
          companyType: bookmark.ForumPost.User.companies.companyType,
          industry: bookmark.ForumPost.User.companies.industry,
          city: bookmark.ForumPost.User.companies.city,
          state: bookmark.ForumPost.User.companies.state,
        } : undefined
      },
      category: {
        id: bookmark.ForumPost.ForumCategory.id,
        name: bookmark.ForumPost.ForumCategory.name,
        slug: bookmark.ForumPost.ForumCategory.slug,
        color: bookmark.ForumPost.ForumCategory.color,
      },
      companyMentions: bookmark.ForumPost.CompanyMention?.map(cm => ({ company: cm.companies })) || [],
      contactMentions: bookmark.ForumPost.ContactMention?.map(cm => ({ contact: cm.contacts })) || [],
      _count: {
        comments: bookmark.ForumPost._count.ForumComment
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