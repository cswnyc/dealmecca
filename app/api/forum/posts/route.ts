import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const authorId = searchParams.get('authorId');
    const company = searchParams.get('company');
    const event = searchParams.get('event');
    const sortBy = searchParams.get('sortBy') || 'latest';
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = {
        slug: category
      };
    }
    
    if (authorId) {
      where.authorId = authorId;
    }
    
    if (company) {
      where.companyMentions = {
        some: {
          company: {
            id: company
          }
        }
      };
    }
    
    if (event) {
      where.eventId = event;
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }; // default to latest
    
    switch (sortBy) {
      case 'popular':
        orderBy = { upvotes: 'desc' };
        break;
      case 'trending':
        orderBy = { views: 'desc' };
        break;
      case 'activity':
        orderBy = { lastActivityAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get posts with all relationships
    const posts = await prisma.forumPost.findMany({
      where,
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
                logoUrl: true,
                verified: true,
                companyType: true,
                industry: true,
                city: true,
                state: true
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
                title: true,
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
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.forumPost.count({ where });
    const pages = Math.ceil(total / limit);

    // Transform data to match frontend expectations
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      slug: post.slug,
      isAnonymous: post.isAnonymous,
      anonymousHandle: post.anonymousHandle,
      tags: post.tags,
      urgency: post.urgency,
      dealSize: post.dealSize,
      location: post.location,
      mediaType: post.mediaType,
      views: post.views,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      bookmarks: post.bookmarks,
      isPinned: post.isPinned,
      isLocked: post.isLocked,
      isFeatured: post.isFeatured,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      lastActivityAt: post.lastActivityAt.toISOString(),
      author: {
        id: post.author.id,
        name: post.author.name || 'Anonymous User',
        email: post.author.email
      },
      category: {
        id: post.category.id,
        name: post.category.name,
        slug: post.category.slug,
        description: post.category.description,
        color: post.category.color,
        icon: post.category.icon
      },
      companyMentions: post.companyMentions.map(mention => ({
        company: {
          id: mention.company.id,
          name: mention.company.name,
          logoUrl: mention.company.logoUrl,
          verified: mention.company.verified,
          companyType: mention.company.companyType,
          industry: mention.company.industry,
          city: mention.company.city,
          state: mention.company.state
        }
      })),
      contactMentions: post.contactMentions.map(mention => ({
        contact: {
          id: mention.contact.id,
          fullName: `${mention.contact.firstName} ${mention.contact.lastName}`,
          title: mention.contact.title,
          company: mention.contact.company ? {
            id: mention.contact.company.id,
            name: mention.contact.company.name,
            logoUrl: mention.contact.company.logoUrl
          } : null
        }
      })),
      _count: {
        comments: post._count.comments
      }
    }));

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });

  } catch (error) {
    console.error('Error fetching forum posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
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
      authorId,
      tags = '',
      isAnonymous = false,
      anonymousHandle,
      urgency = 'MEDIUM',
      dealSize,
      location,
      mediaType = 'text'
    } = body;

    if (!title || !content || !categoryId || !authorId) {
      return NextResponse.json(
        { error: 'Title, content, categoryId, and authorId are required' },
        { status: 400 }
      );
    }

    // Generate unique slug from title
    const baseSlug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure slug is unique
    while (await prisma.forumPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        slug,
        categoryId,
        authorId,
        tags,
        isAnonymous,
        anonymousHandle,
        urgency,
        dealSize,
        location,
        mediaType
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    });

    return NextResponse.json(post, { status: 201 });

  } catch (error) {
    console.error('Error creating forum post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}