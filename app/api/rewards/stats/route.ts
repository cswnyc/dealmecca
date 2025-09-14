import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Try multiple ways to get user ID:
    // 1. From session cookie (preferred)
    // 2. From query parameters 
    // 3. From headers
    const sessionUserId = request.cookies.get('dealmecca-session')?.value;
    const queryUserId = request.nextUrl.searchParams.get('userId');
    const headerUserId = request.headers.get('x-user-id');
    
    const userId = sessionUserId || queryUserId || headerUserId;
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User authentication required' 
      }, { status: 401 });
    }

    // Get user with forum activity counts
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            forumPosts: true,
            forumComments: true,
            forumVotes: true,
            forumBookmarks: true,
          }
        },
        forumPosts: {
          select: {
            views: true,
            upvotes: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Calculate user statistics
    const totalPosts = user._count.forumPosts;
    const totalComments = user._count.forumComments;
    const totalVotes = user._count.forumVotes;
    const totalBookmarks = user._count.forumBookmarks;
    
    // Calculate gems based on activity (simplified formula)
    const gems = (user.achievementPoints || 0) + 
                 (totalPosts * 10) + 
                 (totalComments * 5) + 
                 (totalVotes * 2) + 
                 (totalBookmarks * 3);

    // Calculate rank (simplified - you might want to implement proper ranking)
    const allUsersCount = await prisma.user.count();
    const usersWithHigherGems = await prisma.user.count({
      where: {
        achievementPoints: {
          gt: gems
        }
      }
    });
    const rank = usersWithHigherGems + 1;

    // Calculate tier based on gems
    let tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
    let nextTierGems: number;

    if (gems < 100) {
      tier = 'BRONZE';
      nextTierGems = 100;
    } else if (gems < 500) {
      tier = 'SILVER';
      nextTierGems = 500;
    } else if (gems < 1500) {
      tier = 'GOLD';
      nextTierGems = 1500;
    } else if (gems < 3000) {
      tier = 'PLATINUM';
      nextTierGems = 3000;
    } else {
      tier = 'DIAMOND';
      nextTierGems = gems + 1000; // For diamond users, set next milestone
    }

    // Calculate streak (days with activity in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = await prisma.$queryRaw`
      SELECT DISTINCT DATE(created_at) as activity_date
      FROM (
        SELECT created_at FROM "ForumPost" WHERE author_id = ${userId} AND created_at >= ${thirtyDaysAgo}
        UNION
        SELECT created_at FROM "ForumComment" WHERE author_id = ${userId} AND created_at >= ${thirtyDaysAgo}
        UNION  
        SELECT created_at FROM "ForumVote" WHERE user_id = ${userId} AND created_at >= ${thirtyDaysAgo}
      ) as activities
      ORDER BY activity_date DESC
    `;

    const streak = Array.isArray(recentActivity) ? recentActivity.length : 0;
    const contributions = totalPosts + totalComments;

    const stats = {
      gems,
      rank,
      contributions,
      streak,
      tier,
      nextTierGems,
      // Additional stats for the sidebar
      totalPosts,
      totalComments, 
      totalVotes,
      totalBookmarks,
      // Recent activity summary
      recentViews: user.forumPosts.reduce((sum, post) => sum + (post.views || 0), 0),
      recentUpvotes: user.forumPosts.reduce((sum, post) => sum + (post.upvotes || 0), 0)
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
