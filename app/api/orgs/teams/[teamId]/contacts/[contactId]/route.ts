import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/orgs/teams/[teamId]/contacts/[contactId] - Update contact role/isPrimary
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; contactId: string }> }
) {
  try {
    const { teamId, contactId } = await params;
    const body = await request.json();
    const { role, isPrimary } = body;

    // Check if association exists
    const existing = await prisma.contactTeam.findUnique({
      where: {
        contactId_teamId: {
          contactId,
          teamId
        }
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contact is not a member of this team' },
        { status: 404 }
      );
    }

    // If setting as primary, remove primary from others
    if (isPrimary) {
      await prisma.contactTeam.updateMany({
        where: {
          teamId,
          isPrimary: true,
          id: { not: existing.id }
        },
        data: {
          isPrimary: false
        }
      });
    }

    // Update the association
    const updated = await prisma.contactTeam.update({
      where: { id: existing.id },
      data: {
        ...(role !== undefined && { role: role || null }),
        ...(isPrimary !== undefined && { isPrimary })
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

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[TEAM CONTACT UPDATE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update contact', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/orgs/teams/[teamId]/contacts/[contactId] - Remove contact from team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; contactId: string }> }
) {
  try {
    const { teamId, contactId } = await params;

    // Check if association exists
    const existing = await prisma.contactTeam.findUnique({
      where: {
        contactId_teamId: {
          contactId,
          teamId
        }
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Contact is not a member of this team' },
        { status: 404 }
      );
    }

    // Delete the association
    await prisma.contactTeam.delete({
      where: { id: existing.id }
    });

    return NextResponse.json({ message: 'Contact removed from team successfully' });
  } catch (error: any) {
    console.error('[TEAM CONTACT DELETE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to remove contact from team', details: error.message },
      { status: 500 }
    );
  }
}
