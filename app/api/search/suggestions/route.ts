import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'company' | 'team' | 'businessLine' | 'contact' | 'forumPost' | 'event' | 'forumCategory';
  category: string;
  icon: string;
  metadata?: {
    verified?: boolean;
    location?: string;
    description?: string;
    slug?: string;
  };
}

interface SearchResults {
  suggestions: SearchSuggestion[];
  categories: {
    company: number;
    team: number;
    businessLine: number;
    contact: number;
    forumPost: number;
    event: number;
  };
  totalResults: number;
  seeAllQuery: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '8');

    if (query.length < 1) {
      return NextResponse.json({
        suggestions: [],
        categories: { company: 0, team: 0, businessLine: 0, contact: 0, forumPost: 0, event: 0 },
        totalResults: 0,
        seeAllQuery: ''
      });
    }

    const suggestions: SearchSuggestion[] = [];
    let totalResults = 0;
    const categories = { company: 0, team: 0, businessLine: 0, contact: 0, forumPost: 0, event: 0 };

    // Search Companies (agencies, advertisers, industries, DSP/SSP, Adtech - limit 3)
    try {
      const companies = await prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { website: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { state: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          city: true,
          state: true,
          verified: true,
          logoUrl: true,
          companyType: true,
          agencyType: true
        },
        take: 3,
        orderBy: [
          { verified: 'desc' },
          { name: 'asc' }
        ]
      });

      companies.forEach(company => {
        const location = [company.city, company.state].filter(Boolean).join(', ');

        // Determine category based on companyType
        let category = 'Company';
        if (company.companyType === 'AGENCY' || company.companyType === 'INDEPENDENT_AGENCY' || company.companyType === 'HOLDING_COMPANY_AGENCY') {
          category = 'Agency';
        } else if (company.companyType === 'ADVERTISER' || company.companyType === 'NATIONAL_ADVERTISER' || company.companyType === 'LOCAL_ADVERTISER') {
          category = 'Advertiser';
        } else if (company.companyType === 'INDUSTRY') {
          category = 'Industry';
        } else if (company.companyType === 'DSP_SSP') {
          category = 'DSP/SSP';
        } else if (company.companyType === 'ADTECH' || company.companyType === 'ADTECH_VENDOR') {
          category = 'Adtech';
        }

        suggestions.push({
          id: company.id,
          title: company.name,
          type: 'company',
          category,
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

    // Search Contacts/People (limit 3)
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
          slug: true,
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
          type: 'forumCategory',
          category: 'Forum Category',
          icon: category.icon || '📺',
          metadata: {
            description: category.description || undefined,
            slug: category.slug
          }
        });
      });

      categories.businessLine = forumCategories.length;
      totalResults += forumCategories.length;
    } catch (error) {
      console.error('Error searching forum categories:', error);
    }

    // Search Forum Posts (limit 2)
    try {
      const forumPosts = await prisma.forumPost.findMany({
        where: {
          AND: [
            { status: 'APPROVED' }, // Only show approved posts
            {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
                { tags: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: {
          id: true,
          title: true,
          slug: true,
          ForumCategory: {
            select: {
              name: true,
              icon: true
            }
          },
          _count: {
            select: {
              ForumComment: true
            }
          }
        },
        take: 2,
        orderBy: {
          createdAt: 'desc'
        }
      });

      forumPosts.forEach(post => {
        suggestions.push({
          id: post.id,
          title: post.title,
          type: 'forumPost',
          category: 'Forum Post',
          icon: post.ForumCategory?.icon || '💬',
          metadata: {
            description: `${post._count.ForumComment} comments`
          }
        });
      });

      categories.forumPost = forumPosts.length;
      totalResults += forumPosts.length;
    } catch (error) {
      console.error('Error searching forum posts:', error);
    }

    // Search Events (limit 2)
    try {
      const events = await prisma.event.findMany({
        where: {
          AND: [
            { status: 'PUBLISHED' },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { location: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          location: true,
          isVirtual: true,
          isHybrid: true
        },
        take: 2,
        orderBy: {
          startDate: 'asc'
        }
      });

      events.forEach(event => {
        const eventType = event.isVirtual ? 'Virtual Event' : event.isHybrid ? 'Hybrid Event' : 'In-Person Event';
        suggestions.push({
          id: event.id,
          title: event.name,
          type: 'event',
          category: 'Event',
          icon: '📅',
          metadata: {
            description: eventType,
            location: event.location || undefined
          }
        });
      });

      categories.event = events.length;
      totalResults += events.length;
    } catch (error) {
      console.error('Error searching events:', error);
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