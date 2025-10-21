import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const period = searchParams.get('period') || 'all'; // 'all', 'month', 'week'

    // Calculate date range for period
    let dateFilter = {};
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { gte: monthAgo };
    }

    // Get top contributors based on multiple metrics
    const contributors = await prisma.user.findMany({
      where: {
        // Only include users with activity
        OR: [
          { ForumPost: { some: {} } },
          { ForumComment: { some: {} } },
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarSeed: true,
        anonymousUsername: true,
        role: true,
        ForumPost: Object.keys(dateFilter).length > 0
          ? {
              where: { createdAt: dateFilter },
              select: { id: true }
            }
          : {
              select: { id: true }
            },
        ForumComment: Object.keys(dateFilter).length > 0
          ? {
              where: { createdAt: dateFilter },
              select: { id: true }
            }
          : {
              select: { id: true }
            }
      },
      take: limit * 2 // Get more to calculate scores
    });

    // Calculate contribution score for each user
    const scoredContributors = contributors.map((user) => {
      // Calculate gems (contribution score)
      // Formula: Posts = 10 gems, Comments = 5 gems
      // (Aligned with admin backend calculation)
      const postCount = user.ForumPost?.length || 0;
      const commentCount = user.ForumComment?.length || 0;

      const gems = (postCount * 10) + (commentCount * 5);

      // Determine if user is VIP (PRO or ADMIN)
      const isVIP = user.role === 'PRO' || user.role === 'ADMIN';

      return {
        id: user.id,
        name: user.anonymousUsername || user.name || 'Anonymous User',
        email: user.email,
        avatarSeed: user.avatarSeed,
        gems,
        contributions: postCount + commentCount,
        posts: postCount,
        comments: commentCount,
        isVIP
      };
    });

    // Sort by gems and assign ranks
    const rankedContributors = scoredContributors
      .sort((a, b) => b.gems - a.gems)
      .slice(0, limit)
      .map((contributor, index) => ({
        ...contributor,
        rank: index + 1
      }));

    return NextResponse.json({
      contributors: rankedContributors,
      period,
      limit,
      total: scoredContributors.length
    });

  } catch (error) {
    console.error('Error fetching top contributors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top contributors' },
      { status: 500 }
    );
  }
}
