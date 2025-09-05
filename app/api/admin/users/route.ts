import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware, withRBAC, RBAC_CONFIGS } from '@/middleware/rbac';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

export const GET = withRBAC(RBAC_CONFIGS.USER_MANAGEMENT)(
  async (request: NextRequest, user) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const search = searchParams.get('search') || '';
      const role = searchParams.get('role') || '';
      const status = searchParams.get('status') || '';

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (role && role !== 'all') {
        where.role = role;
      }

      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }

      // Get users with team information
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            teamMemberships: {
              where: { isActive: true },
              include: {
                team: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              },
              take: 1
            },
            _count: {
              select: {
                searches: true,
                exports: true
              }
            }
          }
        }),
        prisma.user.count({ where })
      ]);

      const formattedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString(),
        teamId: user.teamMemberships[0]?.team.id,
        teamName: user.teamMemberships[0]?.team.name,
        searchCount: user._count.searches,
        exportCount: user._count.exports
      }));

      logger.info('admin', 'Users list accessed', {
        adminUserId: user.id,
        totalUsers: total,
        filteredUsers: users.length,
        filters: { search, role, status }
      });

      return NextResponse.json({
        users: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('admin', 'Failed to fetch users', { error, adminUserId: user.id });
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }
  }
);

export const POST = withRBAC(RBAC_CONFIGS.USER_MANAGEMENT)(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const { email, name, role, isActive = true } = body;

      if (!email || !role) {
        return NextResponse.json(
          { error: 'Email and role are required' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        );
      }

      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          role,
          isActive,
          createdBy: user.id
        }
      });

      logger.info('admin', 'User created', {
        adminUserId: user.id,
        newUserId: newUser.id,
        newUserEmail: email,
        newUserRole: role
      });

      return NextResponse.json({
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt.toISOString()
        }
      });

    } catch (error) {
      logger.error('admin', 'Failed to create user', { error, adminUserId: user.id });
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }
  }
);