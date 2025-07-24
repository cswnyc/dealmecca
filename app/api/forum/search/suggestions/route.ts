import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query || query.length < 2) {
    return NextResponse.json({
      companies: [],
      locations: [],
      tags: []
    });
  }

  try {
    // ✅ FIXED: SQLite-compatible search queries
    const locationSuggestions = await prisma.forumPost.findMany({
      where: {
        OR: [
          {
            location: {
              startsWith: query.toLowerCase()
            }
          },
          {
            location: {
              endsWith: query.toLowerCase()
            }
          }
        ]
      },
      select: {
        location: true
      },
      distinct: ['location'],
      take: 8
    });

    // Company suggestions from post content
    const companySuggestions = await prisma.forumPost.findMany({
      where: {
        OR: [
          {
            title: {
              startsWith: query.toLowerCase()
            }
          },
          {
            title: {
              endsWith: query.toLowerCase()
            }
          },
          {
            content: {
              startsWith: query.toLowerCase()
            }
          },
          {
            content: {
              endsWith: query.toLowerCase()
            }
          }
        ]
      },
      select: {
        title: true,
        content: true
      },
      take: 10
    });

    // Extract unique companies from content
    const uniqueCompanies = new Set<string>();
    const commonCompanies = [
      'Nike', 'Coca-Cola', 'McDonald\'s', 'Amazon', 'Google', 'Meta', 'Apple',
      'Netflix', 'Disney', 'Warner Bros', 'NBCUniversal', 'Fox', 'CBS',
      'Spotify', 'Hulu', 'HBO', 'Paramount', 'Sony', 'Universal', 'Microsoft',
      'Tesla', 'Ford', 'Toyota', 'BMW', 'Mercedes', 'Audi', 'Honda',
      'Walmart', 'Target', 'Costco', 'Home Depot', 'Lowe\'s', 'Best Buy',
      'Starbucks', 'Dunkin\'', 'Subway', 'KFC', 'Taco Bell', 'Pizza Hut'
    ];

    commonCompanies.forEach(company => {
      if (company.toLowerCase().includes(query.toLowerCase())) {
        uniqueCompanies.add(company);
      }
    });

    // Tag suggestions from posts
    const tagSuggestions = await prisma.forumPost.findMany({
      where: {
        OR: [
          {
            tags: {
              startsWith: query.toLowerCase()
            }
          },
          {
            tags: {
              endsWith: query.toLowerCase()
            }
          }
        ]
      },
      select: {
        tags: true
      },
      take: 10
    });

    // Extract unique tags from JSON strings
    const uniqueTags = new Set<string>();
    tagSuggestions.forEach(post => {
      try {
        const tags = JSON.parse(post.tags || '[]');
        tags.forEach((tag: string) => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            uniqueTags.add(tag);
          }
        });
      } catch (e) {
        // Skip if JSON parsing fails
      }
    });

    return NextResponse.json({
      companies: Array.from(uniqueCompanies).slice(0, 8),
      locations: locationSuggestions.map(l => l.location).filter(Boolean),
      tags: Array.from(uniqueTags).slice(0, 8)
    });

  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get suggestions',
        companies: [],
        locations: [],
        tags: []
      },
      { status: 500 }
    );
  }
} 