import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const authorId = searchParams.get('authorId');
    
    if (!query.trim()) {
      return NextResponse.json({ 
        posts: [], 
        pagination: { page, limit, total: 0, pages: 0 }
      });
    }

    const skip = (page - 1) * limit;
    
    // Build search filters
    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { tags: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (category) {
      where.category = { slug: category };
    }
    
    if (authorId) {
      where.authorId = authorId;
    }

    // Get total count for pagination
    const total = await prisma.forumPost.count({ where });
    const pages = Math.ceil(total / limit);

    // Search posts with full relationships
    const posts = await prisma.forumPost.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true }
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
          include: { company: true }
        },
        contactMentions: {
          include: { contact: true }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Format posts to match expected interface
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      slug: post.slug,
      authorId: post.authorId,
      isAnonymous: post.isAnonymous,
      anonymousHandle: post.anonymousHandle,
      categoryId: post.categoryId,
      tags: post.tags || '',
      eventId: post.eventId,
      urgency: post.urgency,
      dealSize: post.dealSize,
      location: post.location,
      mediaType: post.mediaType || 'TEXT',
      views: post.views || 0,
      upvotes: post.upvotes || 0,
      downvotes: post.downvotes || 0,
      bookmarks: post.bookmarks || 0,
      isPinned: post.isPinned || false,
      isLocked: post.isLocked || false,
      isFeatured: post.isFeatured || false,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      lastActivityAt: post.lastActivityAt?.toISOString() || post.updatedAt.toISOString(),
      author: post.author,
      category: post.category,
      companyMentions: post.companyMentions,
      contactMentions: post.contactMentions,
      _count: post._count
    }));

    return NextResponse.json({
      posts: formattedPosts,
      pagination: { page, limit, total, pages }
    });

  } catch (error) {
    console.error('Error searching forum posts:', error);
    return NextResponse.json(
      { error: 'Failed to search posts' }, 
      { status: 500 }
    );
  }
}
