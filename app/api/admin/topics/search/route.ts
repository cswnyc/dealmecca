import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface EntitySuggestion {
  id: string;
  name: string;
  type: 'company' | 'contact' | 'topic' | 'category';
  description?: string;
  confidence: number;
  metadata?: {
    title?: string;
    industry?: string;
    companyType?: string;
    verified?: boolean;
    city?: string;
    state?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 20 } = await request.json();

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const searchTerm = query.toLowerCase().trim();
    const suggestions: EntitySuggestion[] = [];

    // Search Companies - simplified query first
    const companies = await prisma.Company.findMany({
      where: {
        name: { contains: searchTerm, mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        industry: true,
        companyType: true,
        verified: true,
        city: true,
        state: true
      },
      take: Math.floor(limit / 4)
    });

    // Add company suggestions
    companies.forEach(company => {
      let confidence = 0.9;

      // Boost confidence for exact matches
      if (company.name.toLowerCase() === searchTerm) {
        confidence = 1.0;
      } else if (company.name.toLowerCase().includes(searchTerm)) {
        confidence = 0.85;
      }

      // Boost for verified companies
      if (company.verified) {
        confidence = Math.min(1.0, confidence + 0.1);
      }

      suggestions.push({
        id: company.id,
        name: company.name,
        type: 'company',
        confidence,
        metadata: {
          industry: company.industry,
          companyType: company.companyType,
          verified: company.verified,
          city: company.city,
          state: company.state
        }
      });
    });

    // Search Contacts
    const contacts = await prisma.Contact.findMany({
      where: {
        firstName: { contains: searchTerm, mode: 'insensitive' }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        title: true
      },
      take: Math.floor(limit / 4)
    });

    // Add contact suggestions
    contacts.forEach(contact => {
      const fullName = `${contact.firstName} ${contact.lastName}`.trim();
      let confidence = 0.8;

      if (fullName.toLowerCase().includes(searchTerm)) {
        confidence = 0.85;
      }

      if (contact.title?.toLowerCase().includes(searchTerm)) {
        confidence = Math.min(1.0, confidence + 0.1);
      }

      suggestions.push({
        id: contact.id,
        name: fullName,
        type: 'contact',
        confidence,
        description: contact.title,
        metadata: {
          title: contact.title
        }
      });
    });

    // Search Existing Topics
    const topics = await prisma.Topic.findMany({
      where: {
        name: { contains: searchTerm, mode: 'insensitive' },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        context: true
      },
      take: Math.floor(limit / 4)
    });

    // Add topic suggestions
    topics.forEach(topic => {
      let confidence = 0.9;

      if (topic.name.toLowerCase() === searchTerm) {
        confidence = 1.0;
      } else if (topic.name.toLowerCase().includes(searchTerm)) {
        confidence = 0.9;
      }

      suggestions.push({
        id: topic.id,
        name: topic.name,
        type: 'topic',
        confidence,
        description: topic.description || topic.context
      });
    });

    // Search Categories
    const categories = await prisma.ForumCategory.findMany({
      where: {
        name: { contains: searchTerm, mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        description: true
      },
      take: Math.floor(limit / 4)
    });

    // Add category suggestions
    categories.forEach(category => {
      let confidence = 0.7;

      if (category.name.toLowerCase().includes(searchTerm)) {
        confidence = 0.8;
      }

      suggestions.push({
        id: category.id,
        name: category.name,
        type: 'category',
        confidence,
        description: category.description
      });
    });

    // Sort by confidence and limit results
    const sortedSuggestions = suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);

    return NextResponse.json({
      suggestions: sortedSuggestions,
      query: searchTerm,
      totalFound: suggestions.length
    });

  } catch (error) {
    console.error('Error searching entities:', error);
    return NextResponse.json(
      { error: 'Failed to search entities' },
      { status: 500 }
    );
  }
}