import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orgs/teams/[teamId]/contacts - Get all contacts for a team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    const teamContacts = await prisma.contactTeam.findMany({
      where: { teamId },
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
    });

    return NextResponse.json(teamContacts);
  } catch (error: any) {
    console.error('[TEAM CONTACTS GET ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch team contacts', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/orgs/teams/[teamId]/contacts - Add a contact to a team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const body = await request.json();
    const { contactId, role, isPrimary } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
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

    // Check if contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: contactId }
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Check if already associated
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
        { error: 'Contact is already a member of this team' },
        { status: 400 }
      );
    }

    // If setting as primary, remove primary from others
    if (isPrimary) {
      await prisma.contactTeam.updateMany({
        where: {
          teamId,
          isPrimary: true
        },
        data: {
          isPrimary: false
        }
      });
    }

    // Create the association
    const teamContact = await prisma.contactTeam.create({
      data: {
        teamId,
        contactId,
        role: role || null,
        isPrimary: isPrimary || false
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            title: true,
            email: true,
            verified: true
          }
        }
      }
    });

    return NextResponse.json(teamContact, { status: 201 });
  } catch (error: any) {
    console.error('[TEAM CONTACTS POST ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to add contact to team', details: error.message },
      { status: 500 }
    );
  }
}
