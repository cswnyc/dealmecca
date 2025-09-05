import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware, withRBAC, RBAC_CONFIGS } from '@/middleware/rbac';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';
import { auditLogger } from '@/lib/audit-logger';
import { UserRole } from '@/lib/permissions';

const prisma = new PrismaClient();

interface BulkActionRequest {
  action: 'activate' | 'deactivate' | 'upgrade_to_pro' | 'reset_usage' | 'delete';
  userIds: string[];
}

export const POST = withRBAC(RBAC_CONFIGS.USER_MANAGEMENT)(
  async (request: NextRequest, user) => {
    try {
      const { action, userIds }: BulkActionRequest = await request.json();

      if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return NextResponse.json(
          { error: 'Action and userIds are required' },
          { status: 400 }
        );
      }

      if (userIds.length > 100) {
        return NextResponse.json(
          { error: 'Cannot process more than 100 users at once' },
          { status: 400 }
        );
      }

      // Validate action
      const validActions = ['activate', 'deactivate', 'upgrade_to_pro', 'reset_usage', 'delete'];
      if (!validActions.includes(action)) {
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
      }

      // Get target users
      const targetUsers = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, name: true, role: true, isActive: true }
      });

      if (targetUsers.length === 0) {
        return NextResponse.json(
          { error: 'No users found' },
          { status: 404 }
        );
      }

      // Security checks
      const hasCurrentUser = targetUsers.some(u => u.id === user.id);
      if (hasCurrentUser && (action === 'deactivate' || action === 'delete')) {
        return NextResponse.json(
          { error: 'Cannot deactivate or delete your own account' },
          { status: 400 }
        );
      }

      const hasSuperAdmin = targetUsers.some(u => u.role === 'SUPER_ADMIN');
      if (hasSuperAdmin && user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Only super admin can perform bulk actions on super admin accounts' },
          { status: 403 }
        );
      }

      let results: any = {
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Process bulk action
      switch (action) {
        case 'activate':
          try {
            const updateResult = await prisma.user.updateMany({
              where: { 
                id: { in: userIds },
                isActive: false
              },
              data: { isActive: true }
            });
            results.success = updateResult.count;
          } catch (error) {
            results.errors.push('Failed to activate some users');
          }
          break;

        case 'deactivate':
          try {
            const updateResult = await prisma.user.updateMany({
              where: { 
                id: { in: userIds },
                isActive: true,
                id: { not: user.id } // Exclude current user
              },
              data: { 
                isActive: false,
                deactivatedAt: new Date(),
                deactivatedBy: user.id
              }
            });
            results.success = updateResult.count;
          } catch (error) {
            results.errors.push('Failed to deactivate some users');
          }
          break;

        case 'upgrade_to_pro':
          try {
            const updateResult = await prisma.user.updateMany({
              where: { 
                id: { in: userIds },
                role: 'FREE'
              },
              data: { role: 'PRO' }
            });
            results.success = updateResult.count;
            
            // Reset usage for upgraded users
            if (updateResult.count > 0) {
              await prisma.usage.updateMany({
                where: { userId: { in: userIds } },
                data: { 
                  count: 0,
                  lastReset: new Date()
                }
              });
            }
          } catch (error) {
            results.errors.push('Failed to upgrade some users');
          }
          break;

        case 'reset_usage':
          try {
            const updateResult = await prisma.usage.updateMany({
              where: { userId: { in: userIds } },
              data: { 
                count: 0,
                lastReset: new Date()
              }
            });
            
            // Also reset any monthly tracking
            await prisma.usage.deleteMany({
              where: { 
                userId: { in: userIds },
                period: 'monthly',
                periodStart: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
              }
            });
            
            results.success = targetUsers.length;
          } catch (error) {
            results.errors.push('Failed to reset usage for some users');
          }
          break;

        case 'delete':
          try {
            // Soft delete
            const updateResult = await prisma.user.updateMany({
              where: { 
                id: { in: userIds },
                id: { not: user.id } // Exclude current user
              },
              data: { 
                isActive: false,
                deletedAt: new Date(),
                deletedBy: user.id
              }
            });
            results.success = updateResult.count;
          } catch (error) {
            results.errors.push('Failed to delete some users');
          }
          break;
      }

      // Log bulk action
      await auditLogger.logEvent({
        action: `bulk_${action}`,
        userId: user.id,
        details: {
          userCount: targetUsers.length,
          successCount: results.success,
          failedCount: results.failed,
          targetUserEmails: targetUsers.map(u => u.email)
        }
      });

      logger.info('admin', 'Bulk action completed', {
        adminUserId: user.id,
        action,
        targetUserCount: targetUsers.length,
        successCount: results.success,
        failedCount: results.failed
      });

      return NextResponse.json({
        message: `Bulk ${action} completed`,
        results
      });

    } catch (error) {
      logger.error('admin', 'Bulk action failed', { 
        error, 
        adminUserId: user.id
      });
      return NextResponse.json(
        { error: 'Bulk action failed' },
        { status: 500 }
      );
    }
  }
);