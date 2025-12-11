import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Activity {
  id: string;
  type: 'CONTACT_JOINED' | 'CONTACT_UPDATED' | 'TEAM_ASSIGNED';
  title: string;
  description?: string;
  contactId: string;
  contactName: string;
  createdAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get all contacts for this company with their creation dates
    const contacts = await prisma.contact.findMany({
      where: { companyId: id },
      select: {
        id: true,
        fullName: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        ContactTeam: {
          select: {
            id: true,
            createdAt: true,
            team: {
              select: {
                id: true,
                name: true,
                clientCompany: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Build activity list
    const activities: Activity[] = [];

    for (const contact of contacts) {
      // Contact joined (created)
      activities.push({
        id: `joined-${contact.id}`,
        type: 'CONTACT_JOINED',
        title: `${contact.fullName} joined`,
        description: contact.title || undefined,
        contactId: contact.id,
        contactName: contact.fullName,
        createdAt: contact.createdAt
      });

      // Contact updated (if updatedAt is significantly different from createdAt)
      const timeDiff = contact.updatedAt.getTime() - contact.createdAt.getTime();
      if (timeDiff > 60000) { // More than 1 minute difference
        activities.push({
          id: `updated-${contact.id}-${contact.updatedAt.getTime()}`,
          type: 'CONTACT_UPDATED',
          title: `${contact.fullName} profile updated`,
          description: contact.title || undefined,
          contactId: contact.id,
          contactName: contact.fullName,
          createdAt: contact.updatedAt
        });
      }

      // Team assignments
      for (const ct of contact.ContactTeam) {
        const teamName = ct.team.clientCompany?.name
          ? `${ct.team.clientCompany.name} team`
          : ct.team.name;

        activities.push({
          id: `team-${ct.id}`,
          type: 'TEAM_ASSIGNED',
          title: `${contact.fullName} assigned to ${teamName}`,
          description: contact.title || undefined,
          contactId: contact.id,
          contactName: contact.fullName,
          createdAt: ct.createdAt
        });
      }
    }

    // Sort by date descending (most recent first)
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Get total count before pagination
    const total = activities.length;

    // Apply pagination
    const paginatedActivities = activities.slice(offset, offset + limit);

    return NextResponse.json({
      activities: paginatedActivities,
      total,
      limit,
      offset
    });

  } catch (error: any) {
    console.error('[COMPANY ACTIVITY API ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch company activity', details: error?.message },
      { status: 500 }
    );
  }
}
