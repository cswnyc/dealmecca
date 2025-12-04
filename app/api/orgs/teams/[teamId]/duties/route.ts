import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orgs/teams/[teamId]/duties - Get all duties for a team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    const teamDuties = await prisma.teamDuty.findMany({
      where: { teamId },
      include: {
        duty: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Flatten the nested duty objects for the component
    const duties = teamDuties.map(td => td.duty);
    return NextResponse.json(duties);
  } catch (error: any) {
    console.error('[TEAM DUTIES GET ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch team duties', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/orgs/teams/[teamId]/duties - Add duties to a team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const body = await request.json();
    const { dutyIds } = body;

    if (!Array.isArray(dutyIds) || dutyIds.length === 0) {
      return NextResponse.json(
        { error: 'dutyIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Verify all duties exist
    const duties = await prisma.duty.findMany({
      where: {
        id: { in: dutyIds }
      }
    });

    if (duties.length !== dutyIds.length) {
      return NextResponse.json(
        { error: 'One or more duty IDs are invalid' },
        { status: 400 }
      );
    }

    // Get existing duty associations
    const existing = await prisma.teamDuty.findMany({
      where: {
        teamId,
        dutyId: { in: dutyIds }
      }
    });

    const existingDutyIds = new Set(existing.map(td => td.dutyId));
    const newDutyIds = dutyIds.filter(id => !existingDutyIds.has(id));

    // Create new associations
    if (newDutyIds.length > 0) {
      await prisma.teamDuty.createMany({
        data: newDutyIds.map(dutyId => ({
          teamId,
          dutyId
        }))
      });
    }

    // Fetch all team duties
    const teamDuties = await prisma.teamDuty.findMany({
      where: { teamId },
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
    });

    return NextResponse.json({
      message: `Added ${newDutyIds.length} new duties, ${existingDutyIds.size} already existed`,
      duties: teamDuties
    }, { status: 201 });
  } catch (error: any) {
    console.error('[TEAM DUTIES POST ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to add duties to team', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/orgs/teams/[teamId]/duties - Remove duties from a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);
    const dutyIdsParam = searchParams.get('dutyIds');

    if (!dutyIdsParam) {
      return NextResponse.json(
        { error: 'dutyIds query parameter is required' },
        { status: 400 }
      );
    }

    const dutyIds = dutyIdsParam.split(',');

    // Delete the associations
    const result = await prisma.teamDuty.deleteMany({
      where: {
        teamId,
        dutyId: { in: dutyIds }
      }
    });

    return NextResponse.json({
      message: `Removed ${result.count} duties from team`,
      count: result.count
    });
  } catch (error: any) {
    console.error('[TEAM DUTIES DELETE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to remove duties from team', details: error.message },
      { status: 500 }
    );
  }
}
