import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // all, companies, contacts, categories, advertisers
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const results: any[] = [];

    // Search companies
    if (type === 'all' || type === 'companies') {
      const companies = await prisma.company.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          industry: true
        },
        take: limit
      });

      companies.forEach(company => {
        results.push({
          id: company.id,
          type: 'company',
          name: company.name,
          slug: company.slug,
          avatar: company.logoUrl,
          subtitle: company.industry,
          mentionText: `@${company.name}`,
          url: `/companies/${company.slug}`
        });
      });
    }

    // Search contacts
    if (type === 'all' || type === 'contacts') {
      const contacts = await prisma.contact.findMany({
        where: {
          OR: [
            {
              firstName: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              lastName: {
                contains: query,
                mode: 'insensitive'
              }
            }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          title: true,
          company: {
            select: {
              name: true
            }
          }
        },
        take: limit
      });

      contacts.forEach(contact => {
        const fullName = `${contact.firstName} ${contact.lastName}`.trim();
        results.push({
          id: contact.id,
          type: 'contact',
          name: fullName,
          slug: contact.id,
          avatar: null,
          subtitle: `${contact.title || 'Contact'}${contact.company ? ` at ${contact.company.name}` : ''}`,
          mentionText: `@${fullName}`,
          url: `/contacts/${contact.id}`
        });
      });
    }

    // Search categories
    if (type === 'all' || type === 'categories') {
      const categories = await prisma.forumCategory.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          color: true,
          icon: true
        },
        take: limit
      });

      categories.forEach(category => {
        results.push({
          id: category.id,
          type: 'category',
          name: category.name,
          slug: category.slug,
          avatar: null,
          subtitle: category.description,
          mentionText: `@${category.name}`,
          url: `/forum/categories/${category.slug}`,
          color: category.color,
          icon: category.icon
        });
      });
    }

    // Search users (as advertisers/contributors)
    if (type === 'all' || type === 'advertisers' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        },
        take: limit
      });

      users.forEach(user => {
        results.push({
          id: user.id,
          type: 'user',
          name: user.name || user.email,
          slug: user.id,
          avatar: null,
          subtitle: user.role || 'User',
          mentionText: `@${user.name || user.email}`,
          url: `/users/${user.id}`
        });
      });
    }

    // Sort results by relevance (exact matches first, then starts with, then contains)
    const sortedResults = results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const queryLower = query.toLowerCase();

      // Exact match
      if (aName === queryLower && bName !== queryLower) return -1;
      if (bName === queryLower && aName !== queryLower) return 1;

      // Starts with
      if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
      if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;

      // Alphabetical for equal relevance
      return aName.localeCompare(bName);
    });

    return NextResponse.json(sortedResults.slice(0, limit));

  } catch (error) {
    console.error('Error searching mentions:', error);
    return NextResponse.json(
      { error: 'Failed to search mentions' },
      { status: 500 }
    );
  }
}