import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contactTeams = await prisma.contactTeam.findMany({
      where: {
        contactId: id
      },
      include: {
        team: {
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
        }
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(contactTeams);
  } catch (error) {
    console.error('Error fetching contact teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contactId } = await params;
    const body = await request.json();
    const { teamId, role, isPrimary } = body;

    if (!teamId) {
      return NextResponse.json(
        { error: 'teamId is required' },
        { status: 400 }
      );
    }

    // Check if already exists
    const existing = await prisma.contactTeam.findUnique({
      where: {
        contactId_teamId: {
          contactId,
          teamId
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Contact is already in this team' },
        { status: 400 }
      );
    }

    // If isPrimary is true, unset other primary teams
    if (isPrimary) {
      await prisma.contactTeam.updateMany({
        where: {
          contactId,
          isPrimary: true
        },
        data: {
          isPrimary: false
        }
      });
    }

    const contactTeam = await prisma.contactTeam.create({
      data: {
        contactId,
        teamId,
        role: role || null,
        isPrimary: isPrimary || false
      },
      include: {
        team: {
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
        }
      }
    });

    return NextResponse.json(contactTeam, { status: 201 });
  } catch (error) {
    console.error('Error adding contact to team:', error);
    return NextResponse.json(
      { error: 'Failed to add contact to team' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contactId } = await params;
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'teamId is required' },
        { status: 400 }
      );
    }

    await prisma.contactTeam.delete({
      where: {
        contactId_teamId: {
          contactId,
          teamId
        }
      }
    });

    return NextResponse.json({ message: 'Contact removed from team successfully' });
  } catch (error) {
    console.error('Error removing contact from team:', error);
    return NextResponse.json(
      { error: 'Failed to remove contact from team' },
      { status: 500 }
    );
  }
}
