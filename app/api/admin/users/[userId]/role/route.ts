import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware, withRBAC, RBAC_CONFIGS } from '@/middleware/rbac';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';
import { auditLogger } from '@/lib/audit-logger';
import { UserRole } from '@/lib/permissions';

const prisma = new PrismaClient();

export const PATCH = withRBAC(RBAC_CONFIGS.USER_MANAGEMENT)(
  async (request: NextRequest, user, { params }: { params: { userId: string } }) => {
    try {
      const { userId } = params;
      const { role } = await request.json();

      if (!role) {
        return NextResponse.json(
          { error: 'Role is required' },
          { status: 400 }
        );
      }

      // Validate role
      const validRoles: UserRole[] = ['FREE', 'PRO', 'TEAM', 'ENTERPRISE', 'ADMIN', 'SUPER_ADMIN'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        );
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, name: true }
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Permission checks
      if (targetUser.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Only super admin can modify super admin role' },
          { status: 403 }
        );
      }

      if (role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Only super admin can assign super admin role' },
          { status: 403 }
        );
      }

      if (role === 'ADMIN' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Only admin or super admin can assign admin role' },
          { status: 403 }
        );
      }

      // Prevent self-demotion from admin roles
      if (userId === user.id && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && 
          (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
        return NextResponse.json(
          { error: 'Cannot demote yourself from admin role' },
          { status: 400 }
        );
      }

      if (targetUser.role === role) {
        return NextResponse.json(
          { error: 'User already has this role' },
          { status: 400 }
        );
      }

      // Update user role
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role }
      });

      // Log the role change
      await auditLogger.logEvent({
        action: 'user_role_changed',
        userId: user.id,
        targetUserId: userId,
        details: {
          targetUserEmail: targetUser.email,
          targetUserName: targetUser.name,
          oldRole: targetUser.role,
          newRole: role,
          changedBy: user.email
        }
      });

      logger.info('admin', 'User role updated', {
        adminUserId: user.id,
        targetUserId: userId,
        targetUserEmail: targetUser.email,
        oldRole: targetUser.role,
        newRole: role
      });

      // If user was downgraded from a paid plan, reset their usage
      const downgradedFromPaid = ['PRO', 'TEAM', 'ENTERPRISE'].includes(targetUser.role) && 
                                role === 'FREE';
      
      if (downgradedFromPaid) {
        await prisma.usage.updateMany({
          where: { userId },
          data: { 
            count: 0,
            lastReset: new Date()
          }
        });

        logger.info('admin', 'Usage reset due to downgrade', {
          adminUserId: user.id,
          targetUserId: userId
        });
      }

      return NextResponse.json({
        message: 'User role updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role
        }
      });

    } catch (error) {
      logger.error('admin', 'Failed to update user role', { 
        error, 
        adminUserId: user.id,
        targetUserId: params.userId
      });
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }
  }
);