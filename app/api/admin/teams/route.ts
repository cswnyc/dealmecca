import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
      
      if (!userId || userRole !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const search = searchParams.get('search') || '';

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get teams with member information
      const [teams, total] = await Promise.all([
        prisma.team.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            owner: {
              select: { email: true, name: true }
            },
            members: {
              where: { isActive: true },
              include: {
                user: {
                  select: { 
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    isActive: true
                  }
                }
              }
            },
            _count: {
              select: {
                members: { where: { isActive: true } }
              }
            }
          }
        }),
        prisma.team.count({ where })
      ]);

      const formattedTeams = teams.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        ownerEmail: team.owner.email,
        ownerName: team.owner.name || 'Unknown',
        memberCount: team._count.members,
        members: team.members.map(member => ({
          id: member.user.id,
          email: member.user.email,
          name: member.user.name,
          role: member.user.role,
          isActive: member.user.isActive,
          joinedAt: member.joinedAt.toISOString(),
          memberRole: member.role
        })),
        createdAt: team.createdAt.toISOString(),
        isActive: team.isActive
      }));

      console.log('Teams list accessed', {
        adminUserId: userId,
        totalTeams: total,
        filteredTeams: teams.length
      });

      return NextResponse.json({
        teams: formattedTeams,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Failed to fetch teams', error);
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
}