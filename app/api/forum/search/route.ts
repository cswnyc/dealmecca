import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const urgency = searchParams.get('urgency');
    const mediaType = searchParams.get('mediaType');
    const dealSize = searchParams.get('dealSize');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sort') || 'recent';
    
    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Text search across title and content
    if (query.trim()) {
      where.OR = [
        {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Category filter
    if (category) {
      where.category = {
        slug: category
      };
    }

    // Urgency filter
    if (urgency) {
      where.urgency = urgency;
    }

    // Deal size filter
    if (dealSize) {
      where.dealSize = dealSize;
    }

    // Media type filter (search within JSON array)
    if (mediaType) {
      where.mediaType = {
        contains: mediaType,
        mode: 'insensitive'
      };
    }

    // Build order by clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'popular':
        orderBy = [
          { upvotes: 'desc' },
          { views: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
      case 'trending':
        orderBy = [
          { lastActivityAt: 'desc' },
          { upvotes: 'desc' },
          { views: 'desc' }
        ];
        break;
      case 'recent':
      default:
        orderBy = [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
    }

    // Execute search
    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                  verified: true
                }
              }
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
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
                  verified: true
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
      }),
      prisma.forumPost.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    // Get search suggestions if query is provided
    const suggestions = query.trim() ? await getSearchSuggestions(query) : [];

    // Get trending topics for empty searches
    const trending = !query.trim() ? await getTrendingTopics() : [];

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      },
      suggestions,
      trending,
      filters: {
        category,
        urgency,
        mediaType,
        dealSize,
        sort: sortBy
      }
    });
  } catch (error) {
    console.error('Failed to search forum posts:', error);
    return NextResponse.json(
      { error: 'Failed to search posts' },
      { status: 500 }
    );
  }
}

// Helper function to get intelligent search suggestions
async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    // Get suggestions based on existing tags, categories, and common terms
    const suggestions: string[] = [];

    // Search in categories
    const categories = await prisma.forumCategory.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ],
        isActive: true
      },
      select: { name: true },
      take: 3
    });

    categories.forEach(cat => suggestions.push(cat.name));

    // Search in popular tags (extract from posts)
    const posts = await prisma.forumPost.findMany({
      where: {
        tags: { contains: query, mode: 'insensitive' }
      },
      select: { tags: true },
      take: 10
    });

    // Extract matching tags
    const tagMatches = new Set<string>();
    posts.forEach(post => {
      try {
        const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
        if (Array.isArray(tags)) {
          tags.forEach(tag => {
            if (typeof tag === 'string' && tag.toLowerCase().includes(query.toLowerCase())) {
              tagMatches.add(tag);
            }
          });
        }
      } catch {
        // Skip malformed tags
      }
    });

    Array.from(tagMatches).slice(0, 3).forEach(tag => suggestions.push(tag));

    return [...new Set(suggestions)].slice(0, 5);
  } catch (error) {
    console.error('Failed to get search suggestions:', error);
    return [];
  }
}

// Helper function to get trending topics
async function getTrendingTopics(): Promise<any[]> {
  try {
    // Get posts with recent activity and high engagement
    const trending = await prisma.forumPost.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: [
        { upvotes: 'desc' },
        { views: 'desc' },
        { lastActivityAt: 'desc' }
      ],
      take: 5,
      include: {
        category: {
          select: {
            name: true,
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

    return trending.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      category: post.category.name,
      categoryColor: post.category.color,
      upvotes: post.upvotes,
      views: post.views,
      comments: post._count.comments,
      urgency: post.urgency
    }));
  } catch (error) {
    console.error('Failed to get trending topics:', error);
    return [];
  }
} 