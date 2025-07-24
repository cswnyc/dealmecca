import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ contacts: [] });
    }

    // Search contacts by name for mentions
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          {
            firstName: {
              contains: query,
            }
          },
          {
            lastName: {
              contains: query,
            }
          },
          {
            fullName: {
              contains: query,
            }
          }
        ],
        verified: true // Only show verified contacts in mentions
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        }
      },
      orderBy: [
        { verified: 'desc' }, // Verified contacts first
        { lastName: 'asc' },
        { firstName: 'asc' }
      ],
      take: 10 // Limit for autocomplete dropdown
    });

    // Format for mention autocomplete
    const mentionSuggestions = contacts.map((contact: any) => ({
      id: contact.id,
      name: contact.fullName,
      displayName: `${contact.fullName}${contact.title ? ` - ${contact.title}` : ''}`,
      title: contact.title,
      company: contact.company ? {
        id: contact.company.id,
        name: contact.company.name,
        logo: contact.company.logoUrl
      } : null,
      department: contact.department,
      seniority: contact.seniority,
      verified: contact.verified
    }));

    return NextResponse.json({ 
      contacts: mentionSuggestions,
      total: contacts.length 
    });
  } catch (error) {
    console.error('Failed to search contacts for mentions:', error);
    return NextResponse.json(
      { error: 'Failed to search contacts', contacts: [] },
      { status: 500 }
    );
  }
} 