import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'company' | 'team' | 'businessLine' | 'contact';
  category: string;
  icon: string;
  metadata?: {
    verified?: boolean;
    location?: string;
    description?: string;
  };
}

interface SearchResults {
  suggestions: SearchSuggestion[];
  categories: {
    company: number;
    team: number;
    businessLine: number;
    contact: number;
  };
  totalResults: number;
  seeAllQuery: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '8');

    if (query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        categories: { company: 0, team: 0, businessLine: 0, contact: 0 },
        totalResults: 0,
        seeAllQuery: ''
      });
    }

    const suggestions: SearchSuggestion[] = [];
    let totalResults = 0;
    const categories = { company: 0, team: 0, businessLine: 0, contact: 0 };

    // Search Companies (limit 3)
    try {
      const companies = await prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { website: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          city: true,
          state: true,
          verified: true,
          logoUrl: true
        },
        take: 3,
        orderBy: [
          { verified: 'desc' },
          { name: 'asc' }
        ]
      });

      companies.forEach(company => {
        const location = [company.city, company.state].filter(Boolean).join(', ');
        suggestions.push({
          id: company.id,
          title: company.name,
          type: 'company',
          category: 'Company',
          icon: company.logoUrl || '🏢',
          metadata: {
            verified: company.verified,
            location: location || undefined,
            description: company.description || undefined
          }
        });
      });

      categories.company = companies.length;
      totalResults += companies.length;
    } catch (error) {
      console.error('Error searching companies:', error);
    }

    // Search Contacts (limit 3)
    try {
      const contacts = await prisma.contact.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { fullName: { contains: query, mode: 'insensitive' } },
            { title: { contains: query, mode: 'insensitive' } },
            { company: { name: { contains: query, mode: 'insensitive' } } }
          ]
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              verified: true
            }
          }
        },
        take: 3,
        orderBy: [
          { verified: 'desc' },
          { fullName: 'asc' }
        ]
      });

      contacts.forEach(contact => {
        suggestions.push({
          id: contact.id,
          title: `${contact.fullName}${contact.company ? ` @ ${contact.company.name}` : ''}`,
          type: 'contact',
          category: 'Person',
          icon: '👤',
          metadata: {
            verified: contact.verified,
            description: contact.title || undefined,
            location: contact.company?.name || undefined
          }
        });
      });

      categories.contact = contacts.length;
      totalResults += contacts.length;
    } catch (error) {
      console.error('Error searching contacts:', error);
    }

    // Search Forum Categories as "Media Types" (limit 2)
    try {
      const forumCategories = await prisma.forumCategory.findMany({
        where: {
          AND: [
            { isActive: true },
            { name: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          icon: true,
          color: true
        },
        take: 2,
        orderBy: {
          name: 'asc'
        }
      });

      forumCategories.forEach(category => {
        suggestions.push({
          id: category.id,
          title: category.name,
          type: 'businessLine', // Using businessLine type for media types
          category: 'Media Types',
          icon: category.icon || '📺',
          metadata: {
            description: category.description || undefined
          }
        });
      });

      categories.businessLine = forumCategories.length;
      totalResults += forumCategories.length;
    } catch (error) {
      console.error('Error searching forum categories:', error);
    }

    // TODO: Add Teams search when we find the teams data source
    // For now, we could search company departments or other team-like entities

    return NextResponse.json({
      suggestions: suggestions.slice(0, limit),
      categories,
      totalResults,
      seeAllQuery: query
    });

  } catch (error) {
    console.error('Error in search suggestions:', error);
    return NextResponse.json(
      { error: 'Search suggestions failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}