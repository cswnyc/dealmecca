import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get current date boundaries
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // Run queries in parallel for better performance
    const [activeUsers, todaysPosts, onlineNow] = await Promise.all([
      // Active users: users who have posted or commented in the last 30 days
      prisma.user.count({
        where: {
          OR: [
            {
              ForumPost: {
                some: {
                  createdAt: {
                    gte: thirtyDaysAgo
                  }
                }
              }
            },
            {
              ForumComment: {
                some: {
                  createdAt: {
                    gte: thirtyDaysAgo
                  }
                }
              }
            },
            {
              lastDashboardVisit: {
                gte: thirtyDaysAgo
              }
            }
          ]
        }
      }),

      // Today's posts: forum posts created today
      prisma.forumPost.count({
        where: {
          createdAt: {
            gte: todayStart
          }
        }
      }),

      // Online now: users with recent activity in last 15 minutes
      // Using lastDashboardVisit as a proxy for online status
      prisma.user.count({
        where: {
          lastDashboardVisit: {
            gte: fifteenMinutesAgo
          }
        }
      })
    ]);

    return NextResponse.json({
      activeUsers,
      todaysPosts,
      onlineNow
    });

  } catch (error) {
    console.error('Error fetching community stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch community stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
