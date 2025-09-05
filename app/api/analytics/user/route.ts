import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware, RBAC_CONFIGS } from '@/middleware/rbac';
import { simpleAnalytics } from '@/lib/simple-analytics';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and check permissions
    const protection = await rbacMiddleware.protect(request, RBAC_CONFIGS.VIEW_PREMIUM_DATA);
    
    if (!protection.success || !protection.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = protection.user;
    const searchParams = request.nextUrl.searchParams;
    
    // Parse date range
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    
    let dateRange: { start: Date; end: Date } | undefined;
    
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    // Get user analytics
    const analytics = await simpleAnalytics.getUserAnalytics(user.id, dateRange);

    logger.info('analytics', 'User analytics requested', {
      userId: user.id,
      dateRange: dateRange ? `${dateRange.start.toISOString()} to ${dateRange.end.toISOString()}` : 'all time',
      totalSearches: analytics.summary.totalSearches
    });

    return NextResponse.json(analytics);

  } catch (error) {
    logger.error('analytics', 'Failed to get user analytics', { error });
    return NextResponse.json(
      { error: 'Failed to retrieve analytics data' },
      { status: 500 }
    );
  }
}