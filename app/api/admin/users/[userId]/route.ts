import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware, withRBAC, RBAC_CONFIGS } from '@/middleware/rbac';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';
import { auditLogger } from '@/lib/audit-logger';

const prisma = new PrismaClient();

export const GET = withRBAC(RBAC_CONFIGS.USER_MANAGEMENT)(
  async (request: NextRequest, user, { params }: { params: { userId: string } }) => {
    try {
      const { userId } = params;

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          teamMemberships: {
            where: { isActive: true },
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  description: true
                }
              }
            }
          },
          _count: {
            select: {
              searches: true,
              exports: true,
              savedSearches: true
            }
          }
        }
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Get recent activity
      const recentActivity = await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 10,
        select: {
          id: true,
          action: true,
          timestamp: true,
          details: true
        }
      });

      const userDetails = {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        isActive: targetUser.isActive,
        createdAt: targetUser.createdAt.toISOString(),
        lastLoginAt: targetUser.lastLoginAt?.toISOString(),
        teams: targetUser.teamMemberships.map(tm => tm.team),
        usage: {
          searches: targetUser._count.searches,
          exports: targetUser._count.exports,
          savedSearches: targetUser._count.savedSearches
        },
        recentActivity: recentActivity.map(activity => ({
          id: activity.id,
          action: activity.action,
          timestamp: activity.timestamp.toISOString(),
          details: activity.details
        }))
      };

      logger.info('admin', 'User details accessed', {
        adminUserId: user.id,
        targetUserId: userId
      });

      return NextResponse.json({ user: userDetails });

    } catch (error) {
      logger.error('admin', 'Failed to fetch user details', { 
        error, 
        adminUserId: user.id,
        targetUserId: params.userId
      });
      return NextResponse.json(
        { error: 'Failed to fetch user details' },
        { status: 500 }
      );
    }
  }
);

export const PATCH = withRBAC(RBAC_CONFIGS.USER_MANAGEMENT)(
  async (request: NextRequest, user, { params }: { params: { userId: string } }) => {
    try {
      const { userId } = params;
      const body = await request.json();
      const { name, role, isActive } = body;

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, isActive: true }
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Prevent modification of super admin by non-super admin
      if (targetUser.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Insufficient permissions to modify super admin' },
          { status: 403 }
        );
      }

      const updateData: any = {};
      const changes: string[] = [];

      if (name !== undefined && name !== targetUser.name) {
        updateData.name = name;
        changes.push('name');
      }

      if (role !== undefined && role !== targetUser.role) {
        // Validate role change permissions
        if (role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
          return NextResponse.json(
            { error: 'Only super admin can assign super admin role' },
            { status: 403 }
          );
        }
        
        updateData.role = role;
        changes.push('role');
      }

      if (isActive !== undefined && isActive !== targetUser.isActive) {
        updateData.isActive = isActive;
        changes.push('status');
      }

      if (changes.length === 0) {
        return NextResponse.json(
          { error: 'No changes provided' },
          { status: 400 }
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      // Log the changes
      await auditLogger.logEvent({
        action: 'user_updated',
        userId: user.id,
        targetUserId: userId,
        details: {
          changes,
          oldValues: {
            role: targetUser.role,
            isActive: targetUser.isActive
          },
          newValues: {
            role: updatedUser.role,
            isActive: updatedUser.isActive
          }
        }
      });

      logger.info('admin', 'User updated', {
        adminUserId: user.id,
        targetUserId: userId,
        changes
      });

      return NextResponse.json({
        message: 'User updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          isActive: updatedUser.isActive
        }
      });

    } catch (error) {
      logger.error('admin', 'Failed to update user', { 
        error, 
        adminUserId: user.id,
        targetUserId: params.userId
      });
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withRBAC(RBAC_CONFIGS.USER_MANAGEMENT)(
  async (request: NextRequest, user, { params }: { params: { userId: string } }) => {
    try {
      const { userId } = params;

      if (userId === user.id) {
        return NextResponse.json(
          { error: 'Cannot delete your own account' },
          { status: 400 }
        );
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Prevent deletion of super admin by non-super admin
      if (targetUser.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Insufficient permissions to delete super admin' },
          { status: 403 }
        );
      }

      // Soft delete by deactivating instead of hard delete
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          isActive: false,
          deletedAt: new Date(),
          deletedBy: user.id
        }
      });

      await auditLogger.logEvent({
        action: 'user_deleted',
        userId: user.id,
        targetUserId: userId,
        details: {
          targetUserEmail: targetUser.email,
          targetUserRole: targetUser.role
        }
      });

      logger.info('admin', 'User deleted (soft delete)', {
        adminUserId: user.id,
        targetUserId: userId,
        targetUserEmail: targetUser.email
      });

      return NextResponse.json({
        message: 'User deleted successfully'
      });

    } catch (error) {
      logger.error('admin', 'Failed to delete user', { 
        error, 
        adminUserId: user.id,
        targetUserId: params.userId
      });
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }
  }
);