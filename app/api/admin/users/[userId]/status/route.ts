import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware, withRBAC, RBAC_CONFIGS } from '@/middleware/rbac';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';
import { auditLogger } from '@/lib/audit-logger';

const prisma = new PrismaClient();

export const PATCH = withRBAC(RBAC_CONFIGS.USER_MANAGEMENT)(
  async (request: NextRequest, user, { params }: { params: { userId: string } }) => {
    try {
      const { userId } = params;
      const { isActive } = await request.json();

      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { error: 'isActive must be a boolean' },
          { status: 400 }
        );
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, isActive: true }
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Prevent self-deactivation
      if (userId === user.id && !isActive) {
        return NextResponse.json(
          { error: 'Cannot deactivate your own account' },
          { status: 400 }
        );
      }

      // Prevent deactivation of super admin by non-super admin
      if (targetUser.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN' && !isActive) {
        return NextResponse.json(
          { error: 'Only super admin can deactivate super admin accounts' },
          { status: 403 }
        );
      }

      if (targetUser.isActive === isActive) {
        return NextResponse.json(
          { error: `User is already ${isActive ? 'active' : 'inactive'}` },
          { status: 400 }
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          isActive,
          ...(isActive ? {} : { deactivatedAt: new Date(), deactivatedBy: user.id })
        }
      });

      // Log the status change
      await auditLogger.logEvent({
        action: isActive ? 'user_activated' : 'user_deactivated',
        userId: user.id,
        targetUserId: userId,
        details: {
          targetUserEmail: targetUser.email,
          targetUserName: targetUser.name,
          targetUserRole: targetUser.role,
          changedBy: user.email,
          previousStatus: targetUser.isActive
        }
      });

      logger.info('admin', `User ${isActive ? 'activated' : 'deactivated'}`, {
        adminUserId: user.id,
        targetUserId: userId,
        targetUserEmail: targetUser.email,
        newStatus: isActive
      });

      return NextResponse.json({
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          isActive: updatedUser.isActive
        }
      });

    } catch (error) {
      logger.error('admin', 'Failed to update user status', { 
        error, 
        adminUserId: user.id,
        targetUserId: params.userId
      });
      return NextResponse.json(
        { error: 'Failed to update user status' },
        { status: 500 }
      );
    }
  }
);