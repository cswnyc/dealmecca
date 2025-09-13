import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware } from '@/middleware/rbac';
import { featureGates } from '@/lib/feature-gates';
import { UsageAction } from '@/lib/usage-tracker';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    // Authenticate user
    const authResult = await rbacMiddleware.protect(request, {});
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { action } = await params;
    const user = authResult.user;

    // Validate action
    const validActions: UsageAction[] = [
      'search:performed',
      'contact:viewed',
      'contact:exported',
      'company:viewed',
      'company:exported',
      'api:request',
      'search:saved',
      'team:invite_sent',
      'data:premium_access',
      'bulk:operation'
    ];

    if (!validActions.includes(action as UsageAction)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get usage data
    const usageData = await featureGates.getRemainingUsage(
      user.id,
      user.role,
      action as UsageAction
    );

    logger.info('usage', 'Usage data requested', {
      userId: user.id,
      action,
      current: usageData.current,
      limit: usageData.limit,
      unlimited: usageData.unlimited
    });

    return NextResponse.json(usageData);

  } catch (error) {
    logger.error('usage', 'Failed to get usage data', {
      error,
      action: params.action
    });

    return NextResponse.json(
      { error: 'Failed to retrieve usage data' },
      { status: 500 }
    );
  }
}