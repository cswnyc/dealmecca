import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get trending tags (most used in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get recent posts for trending analysis
    const recentPosts = await prisma.forumPost.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      select: {
        id: true,
        tags: true,
        upvotes: true,
        downvotes: true,
        views: true,
        createdAt: true,
        _count: {
          select: { comments: true }
        }
      }
    });

    // Count tag frequency with engagement weighting
    const tagStats: Record<string, { count: number; engagement: number; posts: string[] }> = {};
    
    recentPosts.forEach(post => {
      const engagementScore = post.upvotes + (post.views * 0.1) + (post._count.comments * 2); // Weight comments more than views
      
      if (post.tags) {
        try {
          const tags = JSON.parse(post.tags);
          tags.forEach((tag: string) => {
            if (!tagStats[tag]) {
              tagStats[tag] = { count: 0, engagement: 0, posts: [] };
            }
            tagStats[tag].count += 1;
            tagStats[tag].engagement += engagementScore;
            tagStats[tag].posts.push(post.id);
          });
        } catch (e) {
          // Skip if JSON parsing fails
        }
      }
    });

    // Sort by trending score (combination of frequency and engagement)
    const trendingTags = Object.entries(tagStats)
      .map(([tag, stats]) => ({
        tag,
        count: stats.count,
        engagement: stats.engagement,
        score: stats.count * Math.log(stats.engagement + 1), // Logarithmic engagement scaling
        posts: stats.posts.length
      }))
      .filter(item => item.count >= 2) // Only show tags used in at least 2 posts
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Get trending posts (high engagement in last 48 hours)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const trendingPosts = await prisma.forumPost.findMany({
      where: {
        createdAt: { gte: twoDaysAgo }
      },
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
      },
      take: 20 // Get more for scoring
    });

    // Score trending posts based on multiple factors
    const scoredTrendingPosts = trendingPosts.map(post => {
      const hoursOld = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
      
      // Engagement score
      const engagementScore = post.upvotes + (post._count.comments * 2) + (post.views * 0.1);
      
      // Recency factor (newer posts get higher score)
      const recencyFactor = Math.max(0.1, 1 - (hoursOld / 48)); // Decay over 48 hours
      
      // Trending score
      const trendingScore = engagementScore * recencyFactor;
      
      return { ...post, trendingScore };
    });

    // Sort by trending score and take top 5
    const topTrendingPosts = scoredTrendingPosts
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 5)
      .map(({ trendingScore, ...post }) => post);

    // Get hot categories (most active in last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const hotCategories = await prisma.forumCategory.findMany({
      where: {
        isActive: true,
        posts: {
          some: {
            createdAt: { gte: oneDayAgo }
          }
        }
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                createdAt: { gte: oneDayAgo }
              }
            }
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Get rising posts (good engagement but not too old)
    const risingPosts = await prisma.forumPost.findMany({
      where: {
        createdAt: { 
          gte: sevenDaysAgo,
          lte: twoDaysAgo 
        },
        upvotes: { gte: 2 } // At least some engagement
      },
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
      },
      orderBy: [
        { upvotes: 'desc' },
        { views: 'desc' }
      ],
      take: 3
    });

    return NextResponse.json({
      trendingTags: trendingTags.slice(0, 8),
      trendingPosts: topTrendingPosts,
      hotCategories: hotCategories.slice(0, 5),
      risingPosts,
      stats: {
        totalRecentPosts: recentPosts.length,
        totalTags: Object.keys(tagStats).length,
        averageEngagement: recentPosts.reduce((sum, post) => 
          sum + post.upvotes + (post.views * 0.1) + (post._count.comments * 2), 0
        ) / recentPosts.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching trending content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending content' },
      { status: 500 }
    );
  }
} 