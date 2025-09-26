import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'latest';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'APPROVED'
    };

    if (category) {
      where.category = {
        slug: category
      };
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Build order by clause
    let orderBy: any = {};
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'views':
        orderBy = { views: 'desc' };
        break;
      case 'engagement':
        orderBy = [
          { upvotes: 'desc' },
          { views: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Get posts with pagination
    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              anonymousUsername: true,
              email: true,
              isAnonymous: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          topicMentions: {
            include: {
              topic: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  context: true
                }
              }
            },
            orderBy: {
              order: 'asc'
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
              comments: true,
              votes: true
            }
          }
        }
      }),
      prisma.forumPost.count({ where })
    ]);

    // Format posts for frontend
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      approvedAt: post.approvedAt?.toISOString(),
      approvedBy: post.approvedBy,
      author: post.author,
      category: post.category,
      topicMentions: post.topicMentions,
      companyMentions: post.companyMentions,
      contactMentions: post.contactMentions,
      _count: post._count,
      tags: post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      views: post.views || 0,
      upvotes: post.upvotes || 0,
      downvotes: post.downvotes || 0
    }));

    return NextResponse.json({
      posts: formattedPosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching approved posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}