import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/requireAuth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user using Firebase token
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth; // Return error response

    const userId = auth.dbUserId;
    console.log('🔍 Profile API: Querying database for user ID:', userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
        updatedAt: true,
        lastDashboardVisit: true,
        dashboardVisits: true,
        searchesUsed: true,
        searchesThisMonth: true,
        achievementPoints: true,
        achievements: true,
        annualEventGoal: true,
        annualNetworkingGoal: true,
        annualRevenueGoal: true,
        subscriptionStatus: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        anonymousUsername: true,
        avatarSeed: true,
        isAnonymous: true,
        // Include some statistics
        _count: {
          select: {
            ForumPost: true,
            ForumComment: true,
            SavedSearch: true,
            EventAttendee: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Profile API: User not found in database:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ Profile API: Successfully fetched user:', user.email);

    // Transform data to match frontend expectations
    const profile = {
      id: user.id,
      email: user.email,
      name: user.name || 'Anonymous User',
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastDashboardVisit: user.lastDashboardVisit?.toISOString(),
      dashboardVisits: user.dashboardVisits,
      searchesUsed: user.searchesUsed,
      searchesThisMonth: user.searchesThisMonth,
      achievementPoints: user.achievementPoints,
      achievements: user.achievements,
      annualEventGoal: user.annualEventGoal,
      annualNetworkingGoal: user.annualNetworkingGoal,
      annualRevenueGoal: user.annualRevenueGoal,
      currentPeriodStart: user.currentPeriodStart?.toISOString(),
      currentPeriodEnd: user.currentPeriodEnd?.toISOString(),
      anonymousUsername: user.anonymousUsername,
      avatarSeed: user.avatarSeed,
      isAnonymous: user.isAnonymous,
      stats: {
        forumPosts: user._count.ForumPost,
        forumComments: user._count.ForumComment,
        savedSearches: user._count.SavedSearch,
        eventsAttended: user._count.EventAttendee
      }
    };

    return NextResponse.json(profile);

  } catch (error) {
    console.error('❌ Profile API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, annualEventGoal, annualNetworkingGoal, annualRevenueGoal } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        annualEventGoal,
        annualNetworkingGoal,
        annualRevenueGoal,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
        updatedAt: true,
        annualEventGoal: true,
        annualNetworkingGoal: true,
        annualRevenueGoal: true
      }
    });

    return NextResponse.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'This API endpoint is temporarily disabled during system optimization',
    message: 'Feature will be restored in upcoming updates'
  }, { status: 503 })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ 
    error: 'This API endpoint is temporarily disabled during system optimization',
    message: 'Feature will be restored in upcoming updates'
  }, { status: 503 })
}