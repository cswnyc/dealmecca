import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get user data from middleware headers
    const userEmail = request.headers.get('x-user-email');
    const userId = request.headers.get('x-user-id');
    
    if (!userEmail || !userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { interactionType, companyId, contactId, metadata } = await request.json();

    // Validate required fields
    if (!interactionType) {
      return NextResponse.json(
        { error: 'Interaction type is required' },
        { status: 400 }
      );
    }

    // Validate interaction type
    const validTypes = [
      'FORUM_POST_CREATED',
      'FORUM_COMMENT_POSTED',
      'COMPANY_MENTIONED',
      'CONTACT_MENTIONED',
      'POST_BOOKMARKED',
      'USER_FOLLOWED',
      'PROFILE_VIEWED',
      'COMPANY_PROFILE_VIEWED',
      'CONTACT_PROFILE_VIEWED',
      'NETWORKING_EVENT_JOINED',
      'DISCUSSION_PARTICIPATED',
      'EXPERTISE_SHARED',
      'QUESTION_ANSWERED',
      'OPPORTUNITY_SHARED',
      'INTRODUCTION_MADE',
      'CONNECTION_REQUESTED',
      'MESSAGE_SENT'
    ];

    if (!validTypes.includes(interactionType)) {
      return NextResponse.json(
        { error: 'Invalid interaction type' },
        { status: 400 }
      );
    }

    // Prepare metadata object
    let activityMetadata: any = {};
    
    if (metadata) {
      activityMetadata = { ...metadata };
    }

    if (contactId) {
      activityMetadata.contactId = contactId;
    }

    // Create networking activity record
    const activity = await prisma.userNetworkingActivity.create({
      data: {
        userId: user.id,
        companyId: companyId || null,
        interactionType,
        metadata: Object.keys(activityMetadata).length > 0 
          ? JSON.stringify(activityMetadata) 
          : null
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            verified: true
          }
        }
      }
    });

    // Update user networking goal progress
    if (['COMPANY_PROFILE_VIEWED', 'CONTACT_PROFILE_VIEWED', 'NETWORKING_EVENT_JOINED', 'DISCUSSION_PARTICIPATED'].includes(interactionType)) {
      // Count unique companies interacted with this year
      const yearStart = new Date(new Date().getFullYear(), 0, 1);
      const uniqueCompanies = await prisma.userNetworkingActivity.groupBy({
        by: ['companyId'],
        where: {
          userId: user.id,
          companyId: { not: null },
          createdAt: { gte: yearStart },
          interactionType: {
            in: ['COMPANY_PROFILE_VIEWED', 'CONTACT_PROFILE_VIEWED', 'NETWORKING_EVENT_JOINED', 'DISCUSSION_PARTICIPATED']
          }
        }
      });

      // Update achievement points for networking activities
      const activityPoints = {
        'COMPANY_PROFILE_VIEWED': 1,
        'CONTACT_PROFILE_VIEWED': 2,
        'NETWORKING_EVENT_JOINED': 5,
        'DISCUSSION_PARTICIPATED': 3,
        'FORUM_POST_CREATED': 4,
        'COMPANY_MENTIONED': 2,
        'CONTACT_MENTIONED': 2
      };

      const points = activityPoints[interactionType as keyof typeof activityPoints] || 1;
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          achievementPoints: {
            increment: points
          }
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      activity: {
        id: activity.id,
        interactionType: activity.interactionType,
        companyId: activity.companyId,
        company: activity.company,
        createdAt: activity.createdAt
      }
    });
  } catch (error) {
    console.error('Failed to track networking activity:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user data from middleware headers
    const userEmail = request.headers.get('x-user-email');
    const userId = request.headers.get('x-user-id');
    
    if (!userEmail || !userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');

    // Build where clause
    const where: any = { userId: user.id };
    if (type) {
      where.interactionType = type;
    }

    // Get recent networking activities
    const activities = await prisma.userNetworkingActivity.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            verified: true,
            companyType: true,
            industry: true
          }
        }
      }
    });

    // Get activity summary stats
    const totalActivities = await prisma.userNetworkingActivity.count({
      where: { userId: user.id }
    });

    // Get this month's activities
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonthActivities = await prisma.userNetworkingActivity.count({
      where: {
        userId: user.id,
        createdAt: { gte: monthStart }
      }
    });

    // Get unique companies interacted with
    const uniqueCompanies = await prisma.userNetworkingActivity.groupBy({
      by: ['companyId'],
      where: {
        userId: user.id,
        companyId: { not: null }
      }
    });

    // Get activity breakdown by type
    const activityBreakdown = await prisma.userNetworkingActivity.groupBy({
      by: ['interactionType'],
      where: { userId: user.id },
      _count: { interactionType: true }
    });

    return NextResponse.json({
      activities: activities.map((activity: any) => ({
        ...activity,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null
      })),
      summary: {
        totalActivities,
        thisMonthActivities,
        uniqueCompanies: uniqueCompanies.length,
        activityBreakdown: activityBreakdown.map((item: any) => ({
          type: item.interactionType,
          count: item._count.interactionType
        }))
      }
    });
  } catch (error) {
    console.error('Failed to fetch networking activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
} 