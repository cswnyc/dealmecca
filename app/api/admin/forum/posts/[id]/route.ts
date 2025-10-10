import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ForumCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            color: true,
            icon: true
          }
        },
        CompanyMention: {
          include: {
            companies: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        ContactMention: {
          include: {
            contacts: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            ForumComment: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Transform data to match frontend expectations
    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      slug: post.slug,
      status: post.status,
      authorId: post.authorId,
      categoryId: post.categoryId,
      upvotes: post.upvotes || 0,
      downvotes: post.downvotes || 0,
      views: post.views || 0,
      isFeatured: post.isFeatured || false,
      isLocked: post.isLocked || false,
      isPinned: post.isPinned || false,
      isAnonymous: post.isAnonymous || false,
      anonymousHandle: post.anonymousHandle,
      tags: post.tags ? post.tags.split(', ') : [],
      urgency: post.urgency,
      dealSize: post.dealSize,
      location: post.location,
      mediaType: post.mediaType,
      bookmarks: post.bookmarks || 0,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      lastActivityAt: post.lastActivityAt?.toISOString(),
      author: post.User,
      category: post.ForumCategory,
      companyMentions: post.CompanyMention,
      contactMentions: post.ContactMention,
      _count: {
        comments: post._count.ForumComment
      }
    };

    return NextResponse.json(formattedPost);

  } catch (error) {
    console.error('Error fetching forum post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forum post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      content,
      categoryId,
      status,
      isFeatured,
      isPinned,
      isLocked,
      isAnonymous,
      anonymousHandle,
      location,
      topicIds
    } = body;

    // Update the post
    const post = await prisma.forumPost.update({
      where: { id },
      data: {
        content,
        categoryId,
        status,
        isFeatured,
        isPinned,
        isLocked,
        isAnonymous,
        anonymousHandle,
        location,
        updatedAt: new Date()
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ForumCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        _count: {
          select: {
            ForumComment: true
          }
        }
      }
    });

    return NextResponse.json(post);

  } catch (error) {
    console.error('Error updating forum post:', error);
    return NextResponse.json(
      { error: 'Failed to update forum post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.forumPost.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting forum post:', error);
    return NextResponse.json(
      { error: 'Failed to delete forum post' },
      { status: 500 }
    );
  }
}
