import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    
    // Get the current post
    const currentPost = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: {
        tags: true,
        categoryId: true,
        location: true,
        dealSize: true,
        mediaType: true,
        urgency: true
      }
    });

    if (!currentPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Parse JSON fields
    const currentTags = currentPost.tags ? JSON.parse(currentPost.tags) : [];
    const currentMediaTypes = currentPost.mediaType ? JSON.parse(currentPost.mediaType) : [];

    // Find related posts using multiple criteria with scoring
    const relatedPosts = await prisma.forumPost.findMany({
      where: {
        id: { not: postId }, // Exclude current post
        OR: [
          // Same category (highest priority)
          { categoryId: currentPost.categoryId },
          // Same location
          currentPost.location ? {
            OR: [
              { location: { startsWith: currentPost.location } },
              { location: { endsWith: currentPost.location } }
            ]
          } : {},
          // Same deal size
          currentPost.dealSize ? {
            dealSize: currentPost.dealSize
          } : {},
          // Same urgency level
          { urgency: currentPost.urgency }
        ].filter(condition => Object.keys(condition).length > 0)
      },
      orderBy: [
        { upvotes: 'desc' },
        { views: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 20, // Get more than needed for scoring
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true,
        _count: {
          select: { comments: true }
        }
      }
    });

    // Score posts based on similarity
    const scoredPosts = relatedPosts.map(post => {
      let score = 0;
      
      // Category match (highest weight)
      if (post.categoryId === currentPost.categoryId) score += 50;
      
      // Location match
      if (post.location && currentPost.location && 
          post.location.toLowerCase().includes(currentPost.location.toLowerCase())) {
        score += 30;
      }
      
      // Deal size match
      if (post.dealSize === currentPost.dealSize) score += 25;
      
      // Urgency match
      if (post.urgency === currentPost.urgency) score += 20;
      
      // Tag overlap
      if (post.tags) {
        try {
          const postTags = JSON.parse(post.tags);
          const commonTags = currentTags.filter((tag: string) => 
            postTags.includes(tag)
          );
          score += commonTags.length * 10;
        } catch (e) {
          // Skip tag scoring if JSON parsing fails
        }
      }
      
      // Media type overlap
      if (post.mediaType) {
        try {
          const postMediaTypes = JSON.parse(post.mediaType);
          const commonMediaTypes = currentMediaTypes.filter((type: string) => 
            postMediaTypes.includes(type)
          );
          score += commonMediaTypes.length * 15;
        } catch (e) {
          // Skip media type scoring if JSON parsing fails
        }
      }
      
      // Engagement boost
      score += Math.log(post.upvotes + 1) * 2;
      score += Math.log(post.views + 1) * 1;
      
      return { ...post, score };
    });

    // Sort by score and take top 5
    const topRelatedPosts = scoredPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ score, ...post }) => post); // Remove score from response

    return NextResponse.json({ 
      relatedPosts: topRelatedPosts,
      total: topRelatedPosts.length
    });
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related posts' },
      { status: 500 }
    );
  }
} 