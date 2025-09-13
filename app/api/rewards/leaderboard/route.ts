import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers

export async function GET(request: NextRequest) {
  try {
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock leaderboard data - in a real implementation, query from database
    const mockLeaderboard = [
      {
        rank: 1,
        name: 'Alex Rodriguez',
        avatarUrl: '/avatars/user1.jpg',
        gems: 2840,
        contributions: 156,
        tier: 'DIAMOND',
        isVIP: true,
        streak: 47
      },
      {
        rank: 2,
        name: 'Sarah Chen',
        avatarUrl: '/avatars/user2.jpg',
        gems: 2650,
        contributions: 134,
        tier: 'PLATINUM',
        isVIP: true,
        streak: 32
      },
      {
        rank: 3,
        name: 'Mike Johnson',
        avatarUrl: '/avatars/user3.jpg',
        gems: 2100,
        contributions: 89,
        tier: 'PLATINUM',
        isVIP: false,
        streak: 18
      },
      {
        rank: 4,
        name: 'Emily Davis',
        avatarUrl: '/avatars/user4.jpg',
        gems: 1890,
        contributions: 76,
        tier: 'GOLD',
        isVIP: false,
        streak: 25
      },
      {
        rank: 5,
        name: 'David Park',
        avatarUrl: '/avatars/user5.jpg',
        gems: 1650,
        contributions: 67,
        tier: 'GOLD',
        isVIP: false,
        streak: 12
      },
      {
        rank: 6,
        name: 'Lisa Wong',
        avatarUrl: '/avatars/user6.jpg',
        gems: 1420,
        contributions: 58,
        tier: 'GOLD',
        isVIP: false,
        streak: 9
      },
      {
        rank: 7,
        name: 'James Wilson',
        avatarUrl: '/avatars/user7.jpg',
        gems: 1200,
        contributions: 45,
        tier: 'SILVER',
        isVIP: false,
        streak: 7
      },
      {
        rank: 8,
        name: session.user.name || 'You',
        avatarUrl: session.user.image || undefined,
        gems: 980,
        contributions: 34,
        tier: 'SILVER',
        isVIP: false,
        streak: 5
      },
      {
        rank: 9,
        name: 'Karen Smith',
        avatarUrl: '/avatars/user9.jpg',
        gems: 850,
        contributions: 29,
        tier: 'SILVER',
        isVIP: false,
        streak: 3
      },
      {
        rank: 10,
        name: 'Tom Brown',
        avatarUrl: '/avatars/user10.jpg',
        gems: 720,
        contributions: 24,
        tier: 'BRONZE',
        isVIP: false,
        streak: 2
      }
    ];

    // In a real implementation, you would query the database:
    /*
    const leaderboard = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        gems: true,
        contributions: true,
        tier: true,
        isVIP: true,
        streak: true,
        _count: {
          select: {
            forumPosts: true,
            forumComments: true,
            // other activities
          }
        }
      },
      orderBy: {
        gems: 'desc'
      },
      take: 50
    });

    // Map and rank the results
    */

    return NextResponse.json(mockLeaderboard);

  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}