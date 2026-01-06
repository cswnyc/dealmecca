import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const subscriptionTier = searchParams.get('subscriptionTier') || '';
    const subscriptionStatus = searchParams.get('subscriptionStatus') || '';
    const includeStats = searchParams.get('include_stats') === 'true';

    // Build filter conditions
    const whereConditions: any = {};

    if (search) {
      whereConditions.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { anonymousUsername: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      whereConditions.role = role;
    }

    if (subscriptionTier) {
      whereConditions.subscriptionTier = subscriptionTier;
    }

    if (subscriptionStatus) {
      whereConditions.subscriptionStatus = subscriptionStatus;
    }

    // Get total count for pagination
    const totalUsers = await prisma.user.count({
      where: whereConditions
    });

    // Get paginated users
    const skip = (page - 1) * limit;
    const users = await prisma.user.findMany({
      where: whereConditions,
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        firebaseUid: true,
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        isAnonymous: true,
        anonymousUsername: true,
        searchesUsed: true,
        dashboardVisits: true,
        searchesThisMonth: true,
        achievementPoints: true,
        stripeCustomerId: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        createdAt: true,
        updatedAt: true,
        lastDashboardVisit: true,
        companyId: true,
        provider: true,
        verifiedSeller: true,
        accountStatus: true,
        approvedAt: true,
        approvalNotes: true,
        company: {
          select: {
            id: true,
            name: true
          }
        },
        // Include related data counts
        _count: {
          select: {
            ForumComment: true,
            ForumPost: true,
            PostBookmark: true,
            PostFollow: true,
            Comment: true,
            Post: true
          }
        }
      }
    });

    // Enhance users with verification status and simplified gem calculation
    const usersWithGems = users.map((user) => {
      // Simple gem calculation based on counts (10 per post, 5 per comment)
      const postCount = user._count?.ForumPost || 0;
      const commentCount = user._count?.ForumComment || 0;
      const forumGems = (postCount * 10) + (commentCount * 5);

      // Check verification status
      const emailVerified = !!user.email && !!user.firebaseUid;
      const linkedinVerified = user.provider === 'linkedin';

      return {
        ...user,
        forumGems,
        forumContributions: postCount + commentCount,
        emailVerified,
        linkedinVerified,
        linkedinUrl: linkedinVerified ? `https://www.linkedin.com/` : undefined,
        _count: {
          ...user._count,
          comments: user._count?.Comment || 0,
          posts: user._count?.Post || 0,
          bookmarks: user._count?.PostBookmark || 0,
          follows: user._count?.PostFollow || 0
        }
      };
    });

    // Prepare response
    const response: any = {
      users: usersWithGems,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    };

    // Include statistics if requested
    if (includeStats) {
      const [
        totalCount,
        activeUsers,
        verifiedUsers,
        roleStats,
        subscriptionStats,
        statusStats
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            lastDashboardVisit: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        }),
        prisma.user.count({
          where: {
            AND: [
              { email: { not: null } },
              { firebaseUid: { not: null } }
            ]
          }
        }),
        prisma.user.groupBy({
          by: ['role'],
          _count: { role: true }
        }),
        prisma.user.groupBy({
          by: ['subscriptionTier'],
          _count: { subscriptionTier: true }
        }),
        prisma.user.groupBy({
          by: ['subscriptionStatus'],
          _count: { subscriptionStatus: true }
        })
      ]);

      // Calculate total forum gems across all users
      const totalForumGems = usersWithGems.reduce((sum, user) => sum + user.forumGems, 0);

      response.stats = {
        total: totalCount,
        activeUsers: activeUsers,
        verifiedUsers: verifiedUsers,
        totalForumGems: totalForumGems,
        byRole: roleStats.reduce((acc, stat) => {
          acc[stat.role] = stat._count.role;
          return acc;
        }, {} as Record<string, number>),
        bySubscriptionTier: subscriptionStats.reduce((acc, stat) => {
          acc[stat.subscriptionTier] = stat._count.subscriptionTier;
          return acc;
        }, {} as Record<string, number>),
        bySubscriptionStatus: statusStats.reduce((acc, stat) => {
          acc[stat.subscriptionStatus] = stat._count.subscriptionStatus;
          return acc;
        }, {} as Record<string, number>)
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userIds } = body;

    if (action === 'export') {
      // Handle CSV export
      const users = await prisma.user.findMany({
        where: userIds ? { id: { in: userIds } } : {},
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          isAnonymous: true,
          anonymousUsername: true,
          searchesUsed: true,
          searchesThisMonth: true,
          dashboardVisits: true,
          achievementPoints: true,
          createdAt: true,
          lastDashboardVisit: true
        }
      });

      return NextResponse.json({ users });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to process user action:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Update user (for admin operations like role changes)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json(
        { error: 'User ID and updates are required' },
        { status: 400 }
      );
    }

    // Only allow specific fields to be updated
    const allowedUpdates: any = {};
    if (updates.role) allowedUpdates.role = updates.role;
    if (updates.subscriptionTier) allowedUpdates.subscriptionTier = updates.subscriptionTier;
    if (updates.subscriptionStatus) allowedUpdates.subscriptionStatus = updates.subscriptionStatus;
    if (updates.verifiedSeller !== undefined) allowedUpdates.verifiedSeller = updates.verifiedSeller;
    if (updates.accountStatus) {
      allowedUpdates.accountStatus = updates.accountStatus;
      if (updates.accountStatus === 'APPROVED' && !updates.approvedAt) {
        allowedUpdates.approvedAt = new Date();
      }
    }
    if (updates.approvalNotes !== undefined) allowedUpdates.approvalNotes = updates.approvalNotes;
    if (updates.approvedByUserId) allowedUpdates.approvedByUserId = updates.approvedByUserId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...allowedUpdates,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        accountStatus: true,
        approvedAt: true,
        approvalNotes: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}