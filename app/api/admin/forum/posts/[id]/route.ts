import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Mention {
  type: 'company' | 'contact' | 'category' | 'user';
  id: string;
  name: string;
}

function extractMentions(text: string): Mention[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^:]+):([^)]+)\)/g;
  const mentions: Mention[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    const [, name, type, id] = match;
    mentions.push({
      type: type as Mention['type'],
      id,
      name
    });
  }

  return mentions;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            color: true,
            icon: true
          }
        },
        companyMentions: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        contactMentions: {
          include: {
            contact: {
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
            comments: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Forum post not found' },
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
      author: post.author,
      category: post.category,
      companyMentions: post.companyMentions,
      contactMentions: post.contactMentions,
      _count: post._count
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      content,
      categoryId,
      tags = [],
      isFeatured = false,
      isPinned = false,
      isLocked = false,
      isAnonymous = false,
      anonymousHandle,
      location,
      status,
      approvedBy
    } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get existing post
    const existingPost = await prisma.forumPost.findUnique({
      where: { id },
      select: { title: true, slug: true }
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Forum post not found' },
        { status: 404 }
      );
    }

    // Parse mentions from content only (title is not being updated)
    const contentMentions = extractMentions(content);
    const allMentions = [...contentMentions];

    // Update the post (keeping existing title and slug)
    const updatedPost = await prisma.forumPost.update({
      where: { id },
      data: {
        content,
        categoryId,
        tags: Array.isArray(tags) ? tags.join(', ') : tags,
        isFeatured,
        isPinned,
        isLocked,
        isAnonymous,
        anonymousHandle,
        location,
        updatedAt: new Date(),
        ...(status && { status }),
        ...(status === 'APPROVED' && approvedBy && {
          approvedAt: new Date(),
          approvedBy
        })
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    // Handle mention relationships
    if (allMentions.length > 0) {
      // Clear existing mentions
      await Promise.all([
        prisma.forumPostCompanyMention.deleteMany({ where: { postId: id } }),
        prisma.forumPostContactMention.deleteMany({ where: { postId: id } })
      ]);

      // Create new mentions
      const companyMentions = allMentions.filter(m => m.type === 'company');
      const contactMentions = allMentions.filter(m => m.type === 'contact');

      if (companyMentions.length > 0) {
        await prisma.forumPostCompanyMention.createMany({
          data: companyMentions.map(mention => ({
            postId: id,
            companyId: mention.id
          })),
          skipDuplicates: true
        });
      }

      if (contactMentions.length > 0) {
        await prisma.forumPostContactMention.createMany({
          data: contactMentions.map(mention => ({
            postId: id,
            contactId: mention.id
          })),
          skipDuplicates: true
        });
      }
    }

    return NextResponse.json(updatedPost);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.forumPost.findUnique({
      where: { id }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Forum post not found' },
        { status: 404 }
      );
    }

    await prisma.forumPost.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Forum post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting forum post:', error);
    return NextResponse.json(
      { error: 'Failed to delete forum post' },
      { status: 500 }
    );
  }
}