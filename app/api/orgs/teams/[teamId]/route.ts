import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orgs/teams/[teamId] - Get a single team with all details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true
          }
        },
        ContactTeam: {
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                fullName: true,
                title: true,
                email: true,
                phone: true,
                verified: true,
                seniority: true,
                department: true,
                primaryRole: true
              }
            }
          },
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        TeamDuty: {
          include: {
            duty: {
              select: {
                id: true,
                name: true,
                category: true,
                description: true
              }
            }
          }
        },
        _count: {
          select: {
            ContactTeam: true,
            PartnershipTeam: true,
            TeamDuty: true
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } catch (error: any) {
    console.error('[TEAM GET ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch team', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/orgs/teams/[teamId] - Update a team
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const body = await request.json();
    const { name, description, type, isActive } = body;

    // Check if team exists
    const existing = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // If changing name, check for duplicates
    if (name && name !== existing.name) {
      const duplicate = await prisma.team.findUnique({
        where: {
          companyId_name: {
            companyId: existing.companyId,
            name
          }
        }
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'A team with this name already exists for this company' },
          { status: 400 }
        );
      }
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(type !== undefined && { type }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true
          }
        },
        ContactTeam: {
          include: {
            contact: true
          }
        },
        TeamDuty: {
          include: {
            duty: true
          }
        },
        _count: {
          select: {
            ContactTeam: true,
            PartnershipTeam: true,
            TeamDuty: true
          }
        }
      }
    });

    return NextResponse.json(team);
  } catch (error: any) {
    console.error('[TEAM UPDATE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update team', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/orgs/teams/[teamId] - Delete a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        _count: {
          select: {
            ContactTeam: true,
            PartnershipTeam: true,
            TeamDuty: true
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Delete the team (cascade will handle ContactTeam, PartnershipTeam, TeamDuty)
    await prisma.team.delete({
      where: { id: teamId }
    });

    return NextResponse.json({
      message: 'Team deleted successfully',
      deletedCounts: team._count
    });
  } catch (error: any) {
    console.error('[TEAM DELETE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to delete team', details: error.message },
      { status: 500 }
    );
  }
}
