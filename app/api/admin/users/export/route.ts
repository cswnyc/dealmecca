import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware, withRBAC, RBAC_CONFIGS } from '@/middleware/rbac';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';
import { auditLogger } from '@/lib/audit-logger';

const prisma = new PrismaClient();

export const GET = withRBAC(RBAC_CONFIGS.USER_MANAGEMENT)(
  async (request: NextRequest, user) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const format = searchParams.get('format') || 'csv';
      const includeInactive = searchParams.get('includeInactive') === 'true';

      if (format !== 'csv' && format !== 'json') {
        return NextResponse.json(
          { error: 'Invalid format. Supported: csv, json' },
          { status: 400 }
        );
      }

      // Get all users with their details
      const users = await prisma.user.findMany({
        where: includeInactive ? {} : { isActive: true },
        include: {
          teamMemberships: {
            where: { isActive: true },
            include: {
              team: {
                select: { name: true }
              }
            },
            take: 1
          },
          _count: {
            select: {
              searches: true,
              exports: true,
              savedSearches: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const userData = users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name || '',
        role: user.role,
        status: user.isActive ? 'Active' : 'Inactive',
        teamName: user.teamMemberships[0]?.team.name || '',
        searchCount: user._count.searches,
        exportCount: user._count.exports,
        savedSearchCount: user._count.savedSearches,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() || '',
        createdBy: user.createdBy || '',
        deactivatedAt: user.deactivatedAt?.toISOString() || '',
        deletedAt: user.deletedAt?.toISOString() || ''
      }));

      // Log export action
      await auditLogger.logEvent({
        action: 'users_exported',
        userId: user.id,
        details: {
          format,
          userCount: userData.length,
          includeInactive
        }
      });

      logger.info('admin', 'Users exported', {
        adminUserId: user.id,
        format,
        userCount: userData.length,
        includeInactive
      });

      if (format === 'json') {
        return NextResponse.json({
          users: userData,
          exportedAt: new Date().toISOString(),
          exportedBy: user.email,
          totalUsers: userData.length
        });
      }

      // Generate CSV
      const headers = [
        'ID',
        'Email',
        'Name',
        'Role',
        'Status',
        'Team',
        'Search Count',
        'Export Count',
        'Saved Searches',
        'Created At',
        'Last Login',
        'Created By',
        'Deactivated At',
        'Deleted At'
      ];

      const csvRows = [
        headers.join(','),
        ...userData.map(user => [
          user.id,
          `"${user.email}"`,
          `"${user.name}"`,
          user.role,
          user.status,
          `"${user.teamName}"`,
          user.searchCount,
          user.exportCount,
          user.savedSearchCount,
          user.createdAt,
          user.lastLoginAt,
          user.createdBy,
          user.deactivatedAt,
          user.deletedAt
        ].join(','))
      ];

      const csv = csvRows.join('\n');
      const timestamp = new Date().toISOString().split('T')[0];

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users_export_${timestamp}.csv"`
        }
      });

    } catch (error) {
      logger.error('admin', 'Failed to export users', { 
        error, 
        adminUserId: user.id
      });
      return NextResponse.json(
        { error: 'Failed to export users' },
        { status: 500 }
      );
    }
  }
);