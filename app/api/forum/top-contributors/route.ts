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
        _count: {
          select: {
            ForumPost: Object.keys(dateFilter).length > 0
              ? { where: { createdAt: dateFilter } }
              : true,
            ForumComment: Object.keys(dateFilter).length > 0
              ? { where: { createdAt: dateFilter } }
              : true,
            ForumPostVote: true,
          }
        }
      },
      take: limit * 2 // Get more to calculate scores
    });

    // Calculate contribution score for each user
    const scoredContributors = await Promise.all(
      contributors.map(async (user) => {
        // Get additional metrics
        const [postsUpvoted, commentsUpvoted, helpfulVotes] = await Promise.all([
          // Posts the user created that were upvoted
          prisma.forumPostVote.count({
            where: {
              post: { authorId: user.id },
              voteType: 'UPVOTE'
            }
          }),
          // Comments the user created that were upvoted
          prisma.forumCommentVote.count({
            where: {
              comment: { userId: user.id },
              voteType: 'UPVOTE'
            }
          }),
          // Helpful votes on user's content
          prisma.forumComment.count({
            where: {
              userId: user.id,
              markedHelpful: true
            }
          })
        ]);

        // Calculate gems (contribution score)
        // Formula:
        // - Post created: 10 gems
        // - Comment created: 5 gems
        // - Post upvote received: 2 gems
        // - Comment upvote received: 1 gem
        // - Helpful vote: 5 gems
        const gems =
          (user._count.ForumPost * 10) +
          (user._count.ForumComment * 5) +
          (postsUpvoted * 2) +
          (commentsUpvoted * 1) +
          (helpfulVotes * 5);

        // Determine if user is VIP (PRO or ADMIN)
        const isVIP = user.role === 'PRO' || user.role === 'ADMIN';

        return {
          id: user.id,
          name: user.name || user.anonymousUsername || 'Anonymous User',
          email: user.email,
          avatarSeed: user.avatarSeed,
          gems,
          contributions: user._count.ForumPost + user._count.ForumComment,
          posts: user._count.ForumPost,
          comments: user._count.ForumComment,
          upvotes: postsUpvoted + commentsUpvoted,
          helpfulVotes,
          isVIP
        };
      })
    );

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
