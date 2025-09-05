import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware, RBAC_CONFIGS } from '@/middleware/rbac';
import { PrismaClient } from '@prisma/client';
import { getPerformanceMonitor } from '@/lib/performance-monitor';
import { logger } from '@/lib/logger';
import os from 'os';

const prisma = new PrismaClient();
const performanceMonitor = getPerformanceMonitor(prisma);

// GET /api/admin/performance - Get performance dashboard data
export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize admin access
    const protection = await rbacMiddleware.protect(request, RBAC_CONFIGS.SYSTEM_SETTINGS);
    
    if (!protection.success || !protection.user) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeWindow = parseInt(searchParams.get('timeWindow') || '24');
    const metricsType = searchParams.get('type') || 'summary';

    let responseData;

    switch (metricsType) {
      case 'summary':
        responseData = {
          summary: performanceMonitor.getPerformanceSummary(timeWindow),
          connectionPool: await performanceMonitor.getConnectionPoolStats(),
          systemInfo: {
            nodeVersion: process.version,
            platform: process.platform,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
          }
        };
        break;

      case 'queries':
        const limit = parseInt(searchParams.get('limit') || '100');
        responseData = {
          queries: performanceMonitor.getQueryMetrics(limit),
          summary: performanceMonitor.getPerformanceSummary(timeWindow).queries,
        };
        break;

      case 'apis':
        const apiLimit = parseInt(searchParams.get('limit') || '100');
        responseData = {
          apis: performanceMonitor.getAPIMetrics(apiLimit),
          summary: performanceMonitor.getPerformanceSummary(timeWindow).apis,
        };
        break;

      case 'alerts':
        const alertLimit = parseInt(searchParams.get('limit') || '50');
        responseData = {
          alerts: performanceMonitor.getPerformanceAlerts(alertLimit),
          summary: performanceMonitor.getPerformanceSummary(timeWindow).alerts,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid metrics type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
      timeWindow: `${timeWindow} hours`,
    });

  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}

// POST /api/admin/performance/alerts/:id/resolve - Resolve performance alert
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { alertId, action } = body;

    if (action === 'resolve' && alertId) {
      const resolved = performanceMonitor.resolveAlert(alertId);
      
      if (resolved) {
        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully',
        });
      } else {
        return NextResponse.json(
          { error: 'Alert not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action or missing alertId' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Performance alert action error:', error);
    return NextResponse.json(
      { error: 'Failed to process alert action' },
      { status: 500 }
    );
  }
}