import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const type = searchParams.get('type');

    const where: any = {
      isActive: true
    };

    if (companyId) {
      where.companyId = companyId;
    }

    if (type) {
      where.type = type;
    }

    const teams = await prisma.team.findMany({
      where,
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
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, companyId, description, type } = body;

    if (!name || !companyId) {
      return NextResponse.json(
        { error: 'Name and companyId are required' },
        { status: 400 }
      );
    }

    // Check if team with same name already exists for this company
    const existing = await prisma.team.findUnique({
      where: {
        companyId_name: {
          companyId,
          name
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A team with this name already exists for this company' },
        { status: 400 }
      );
    }

    const team = await prisma.team.create({
      data: {
        name,
        companyId,
        description: description || null,
        type: type || 'INTERNAL_TEAM'
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true
          }
        }
      }
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
