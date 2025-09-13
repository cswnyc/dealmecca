import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get user data from middleware headers
    const userEmail = request.headers.get('x-user-email');
    const userId = request.headers.get('x-user-id');
    
    console.log('🎯 Rewards API: Headers check:', { userEmail, userId });
    
    if (!userEmail || !userId) {
      console.log('🎯 Rewards API: No auth headers - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details for name (could optimize this with middleware passing more data)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    // For now, return mock data since we haven't implemented the full rewards schema
    const mockUserStats = {
      id: userId,
      name: user?.name || 'User',
      avatarUrl: undefined, // Could be added later from user profile
      gems: 150,
      rank: 8,
      contributions: 23,
      helpfulVotes: 47,
      streak: 5,
      totalViews: 1250,
      badges: [
        {
          id: 'helpful-contributor',
          name: 'Helpful Contributor',
          description: 'Received 50+ helpful votes',
          iconUrl: '/badges/helpful.svg'
        }
      ],
      tier: 'GOLD' as const,
      nextTierGems: 500,
      isVIP: false
    };

    // In a real implementation, you would query the database:
    /*
    const user = await prisma.user.findUnique({
      where: { id: request.headers.get('x-user-id') },
      select: {
        id: true,
        name: true,
        email: true,
        // Add gems, contributions, etc. to your user schema
        _count: {
          select: {
            forumPosts: true,
            forumComments: true,
            // Add other contribution types
          }
        }
      }
    });

    // Calculate gems, rank, etc. based on activities
    */

    return NextResponse.json(mockUserStats);

  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}