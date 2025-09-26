import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Temporarily return mock data to fix database issues and focus on Stripe testing
    const stats = {
      gems: 420,
      tier: 'SILVER',
      nextTierGems: 1500,
      gemsToNextTier: 1080,
      streak: 7,
      contributions: 23,
      breakdown: {
        posts: 5,
        comments: 18,
        votes: 45,
        bookmarks: 8
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