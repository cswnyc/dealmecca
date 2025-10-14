import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'latest';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { User: { name: { contains: search, mode: 'insensitive' } } },
        { User: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.ForumCategory = {
        slug: category
      };
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }; // default to latest

    switch (sortBy) {
      case 'popular':
        orderBy = { upvotes: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'most-comments':
        orderBy = { comments: { _count: 'desc' } };
        break;
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Get posts with relationships
    const posts = await prisma.forumPost.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            anonymousUsername: true,
            anonymousHandle: true,
            publicHandle: true
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
            company: {
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
            ForumComment: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.forumPost.count({ where });

    // Get stats for dashboard with new status field
    const statusCounts = await prisma.forumPost.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const stats = {
      total: statusCounts.reduce((sum, item) => sum + item._count.status, 0),
      approved: statusCounts.find(item => item.status === 'APPROVED')?._count.status || 0,
      pending: statusCounts.find(item => item.status === 'PENDING')?._count.status || 0,
      rejected: statusCounts.find(item => item.status === 'REJECTED')?._count.status || 0,
      draft: statusCounts.find(item => item.status === 'DRAFT')?._count.status || 0
    };

    // Transform data to match frontend expectations (matching the existing forum structure)
    const formattedPosts = posts.map(post => ({
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
      _count: post._count
    }));

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats
    });

  } catch (error) {
    console.error('Error fetching forum posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forum posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      categoryId,
      status = 'DRAFT',
      tags = [],
      isFeatured = false,
      isPinned = false,
      authorId
    } = body;

    if (!title || !content || !categoryId || !authorId) {
      return NextResponse.json(
        { error: 'Title, content, category, and author are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug already exists
    const existingPost = await prisma.forumPost.findFirst({
      where: { slug }
    });

    const finalSlug = existingPost ? `${slug}-${Date.now()}` : slug;

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        slug: finalSlug,
        categoryId,
        authorId,
        status,
        tags,
        isFeatured,
        isPinned,
        upvotes: 0,
        downvotes: 0
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            anonymousUsername: true,
            anonymousHandle: true,
            publicHandle: true
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

    return NextResponse.json(post, { status: 201 });

  } catch (error) {
    console.error('Error creating forum post:', error);
    return NextResponse.json(
      { error: 'Failed to create forum post' },
      { status: 500 }
    );
  }
}