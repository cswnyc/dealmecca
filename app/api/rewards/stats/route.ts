import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// Gem tier thresholds
const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 100,
  GOLD: 500,
  PLATINUM: 1500,
  DIAMOND: 5000
};

function calculateTier(gems: number): 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' {
  if (gems >= TIER_THRESHOLDS.DIAMOND) return 'DIAMOND';
  if (gems >= TIER_THRESHOLDS.PLATINUM) return 'PLATINUM';
  if (gems >= TIER_THRESHOLDS.GOLD) return 'GOLD';
  if (gems >= TIER_THRESHOLDS.SILVER) return 'SILVER';
  return 'BRONZE';
}

function getNextTierGems(tier: string): number {
  switch (tier) {
    case 'BRONZE': return TIER_THRESHOLDS.SILVER;
    case 'SILVER': return TIER_THRESHOLDS.GOLD;
    case 'GOLD': return TIER_THRESHOLDS.PLATINUM;
    case 'PLATINUM': return TIER_THRESHOLDS.DIAMOND;
    case 'DIAMOND': return TIER_THRESHOLDS.DIAMOND;
    default: return TIER_THRESHOLDS.SILVER;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try to get firebaseUid from query params first (preferred method)
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebaseUid');

    let user = null;

    if (firebaseUid) {
      // Use Firebase UID to find user (most reliable method)
      console.log('[rewards/stats] Looking up user by firebaseUid:', firebaseUid);
      user = await prisma.user.findUnique({
        where: { firebaseUid },
        select: {
          id: true,
          _count: {
            select: {
              ForumPost: true,
              ForumComment: true,
              PostBookmark: true,
              PostFollow: true
            }
          }
        }
      });
    } else {
      // Fallback to session cookie method
      console.log('[rewards/stats] No firebaseUid in params, trying session cookie');
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('session');

      if (!sessionCookie) {
        console.log('[rewards/stats] No session cookie found');
        return NextResponse.json({
          gems: 0,
          tier: 'BRONZE',
          nextTierGems: 100,
          gemsToNextTier: 100,
          rank: 0,
          streak: 0,
          contributions: 0,
          totalPosts: 0,
          totalComments: 0,
          totalVotes: 0,
          totalBookmarks: 0
        });
      }

      // Parse session cookie to get user email
      let userEmail: string | null = null;
      try {
        const sessionData = JSON.parse(sessionCookie.value);
        userEmail = sessionData.email;
      } catch (e) {
        console.error('[rewards/stats] Failed to parse session cookie:', e);
      }

      if (!userEmail) {
        console.log('[rewards/stats] No email in session');
        return NextResponse.json({
          gems: 0,
          tier: 'BRONZE',
          nextTierGems: 100,
          gemsToNextTier: 100,
          rank: 0,
          streak: 0,
          contributions: 0,
          totalPosts: 0,
          totalComments: 0,
          totalVotes: 0,
          totalBookmarks: 0
        });
      }

      // Get user from database by email
      console.log('[rewards/stats] Looking up user by email:', userEmail);
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          _count: {
            select: {
              ForumPost: true,
              ForumComment: true,
              PostBookmark: true,
              PostFollow: true
            }
          }
        }
      });
    }

    if (!user) {
      console.log('[rewards/stats] User not found');
      return NextResponse.json({
        gems: 0,
        tier: 'BRONZE',
        nextTierGems: 100,
        gemsToNextTier: 100,
        rank: 0,
        streak: 0,
        contributions: 0,
        totalPosts: 0,
        totalComments: 0,
        totalVotes: 0,
        totalBookmarks: 0
      });
    }

    // Calculate gems using the standard formula
    // Posts: 10 gems each, Comments: 5 gems each
    const postCount = user._count.ForumPost;
    const commentCount = user._count.ForumComment;
    const gems = (postCount * 10) + (commentCount * 5);

    // Calculate tier and progress
    const tier = calculateTier(gems);
    const nextTierGems = getNextTierGems(tier);
    const gemsToNextTier = Math.max(0, nextTierGems - gems);

    // Calculate rank - get all users with their counts and calculate gems
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        _count: {
          select: {
            ForumPost: true,
            ForumComment: true
          }
        }
      }
    });

    // Calculate gems for all users and count how many have more
    let usersWithMoreGems = 0;
    for (const u of allUsers) {
      const userGems = (u._count.ForumPost * 10) + (u._count.ForumComment * 5);
      if (userGems > gems) {
        usersWithMoreGems++;
      }
    }

    const rank = usersWithMoreGems + 1;
    const contributions = postCount + commentCount;

    // Calculate streak (placeholder - would need activity tracking)
    const streak = 0;

    // Get vote counts
    const [totalVotes, totalBookmarks] = await Promise.all([
      prisma.forumVote.count({
        where: { userId: user.id }
      }),
      prisma.postBookmark.count({
        where: { userId: user.id }
      })
    ]);

    const stats = {
      gems,
      tier,
      nextTierGems,
      gemsToNextTier,
      rank,
      streak,
      contributions,
      totalPosts: postCount,
      totalComments: commentCount,
      totalVotes,
      totalBookmarks,
      breakdown: {
        posts: postCount,
        comments: commentCount,
        votes: totalVotes,
        bookmarks: totalBookmarks
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({
      error: 'Failed to fetch user stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}