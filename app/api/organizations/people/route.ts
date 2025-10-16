import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fixed Prisma schema validation - using ContactInteraction and ContactNote
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const company = searchParams.get('company') || '';
    const role = searchParams.get('role') || '';
    const seniority = searchParams.get('seniority') || '';

    // Build where clause
    const where: any = {
      isActive: true
    };

    // Add search filter if provided
    if (search) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    // Add company filter if provided
    if (company && company !== 'all') {
      where.companyId = company;
    }

    // Add role filter if provided
    if (role && role !== 'all') {
      where.primaryRole = { equals: role, mode: 'insensitive' };
    }

    // Add seniority filter if provided
    if (seniority && seniority !== 'all') {
      where.seniority = { equals: seniority, mode: 'insensitive' };
    }

    // Fetch contacts from database
    const contacts = await prisma.contact.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        title: true,
        email: true,
        phone: true,
        linkedinUrl: true,
        primaryRole: true,
        seniority: true,
        department: true,
        isDecisionMaker: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            companyType: true,
            industry: true,
            logoUrl: true,
            verified: true,
            city: true,
            state: true
          }
        },
        _count: {
          select: {
            ContactInteraction: true,
            ContactNote: true
          }
        }
      },
      orderBy: [
        { updatedAt: 'desc' }
      ],
      take: 500 // Limit to 500 contacts for performance
    });

    // Transform to match expected format
    const transformedContacts = contacts.map(contact => {
      // Calculate last activity (for now, use updatedAt)
      const lastActivityDate = new Date(contact.updatedAt);
      const now = new Date();
      const diffMs = now.getTime() - lastActivityDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      let lastActivity = '24+ hrs';
      if (diffHours < 1) {
        lastActivity = '< 1 hr';
      } else if (diffHours < 24) {
        lastActivity = `${diffHours} hr${diffHours > 1 ? 's' : ''}`;
      } else if (diffDays < 7) {
        lastActivity = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else {
        lastActivity = `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
      }

      return {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        fullName: `${contact.firstName} ${contact.lastName}`,
        title: contact.title || '',
        email: contact.email || '',
        phone: contact.phone || '',
        linkedinUrl: contact.linkedinUrl || undefined,
        primaryRole: contact.primaryRole || '',
        seniority: contact.seniority || '',
        department: contact.department || '',
        isDecisionMaker: contact.isDecisionMaker,
        lastActivity,
        company: {
          id: contact.company.id,
          name: contact.company.name,
          companyType: contact.company.companyType,
          industry: contact.company.industry || '',
          logoUrl: contact.company.logoUrl || undefined,
          verified: contact.company.verified,
          city: contact.company.city || '',
          state: contact.company.state || ''
        },
        interactionCount: contact._count.ContactInteraction,
        noteCount: contact._count.ContactNote
      };
    });

    return NextResponse.json({
      success: true,
      contacts: transformedContacts,
      total: transformedContacts.length
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
