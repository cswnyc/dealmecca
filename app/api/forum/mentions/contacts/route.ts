import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim()) {
      return NextResponse.json({
        contacts: [],
        total: 0
      });
    }

    // Search for contacts that match the query
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ],
        // Only include active contacts
        isActive: true
      },
      select: {
        id: true,
        fullName: true,
        firstName: true,
        lastName: true,
        title: true,
        email: true,
        photoUrl: true,
        verified: true,
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            verified: true,
            industry: true,
            companyType: true
          }
        },
        _count: {
          select: {
            interactions: true
          }
        }
      },
      orderBy: [
        // Prioritize verified contacts
        { verified: 'desc' },
        // Then by interaction count (most active)
        { interactions: { _count: 'desc' } },
        // Then alphabetically by full name
        { fullName: 'asc' }
      ],
      take: limit
    });

    const total = await prisma.contact.count({
      where: {
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ],
        isActive: true
      }
    });

    // Format contacts for mention suggestions
    const formattedContacts = contacts.map(contact => ({
      id: contact.id,
      fullName: contact.fullName,
      firstName: contact.firstName,
      lastName: contact.lastName,
      title: contact.title,
      email: contact.email,
      photoUrl: contact.photoUrl,
      verified: contact.verified,
      company: contact.company,
      interactionCount: contact._count.interactions,
      // Mention-specific formatting
      mentionText: contact.fullName,
      displayText: contact.fullName,
      displaySubtext: contact.title && contact.company?.name 
        ? `${contact.title} at ${contact.company.name}`
        : contact.title || contact.company?.name || contact.email,
      metadata: {
        type: 'contact',
        verified: contact.verified,
        title: contact.title,
        company: contact.company?.name,
        industry: contact.company?.industry
      }
    }));

    return NextResponse.json({
      contacts: formattedContacts,
      total,
      query: query.trim()
    });

  } catch (error) {
    console.error('Error fetching contact mentions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact suggestions' },
      { status: 500 }
    );
  }
}
