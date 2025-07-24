import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuthError, createInternalError } from '@/lib/api-responses';

export async function GET(request: NextRequest) {
  // Get user info from middleware headers
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const userTier = request.headers.get('x-user-tier');
  
  if (!userId) {
    return createAuthError();
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all'; // all, companies, contacts, locations

  if (!query || typeof query !== 'string' || query.length < 2) {
    return NextResponse.json({
      companies: [],
      contacts: [],
      locations: [],
      industries: [],
      titles: []
    });
  }

  try {
    const searchTerm = query.toLowerCase();
    const suggestions: any = {
      companies: [],
      contacts: [],
      locations: [],
      industries: [],
      titles: []
    };

    // Company suggestions
    if (type === 'all' || type === 'companies') {
      suggestions.companies = await prisma.company.findMany({
        where: {
          OR: [
            { name: { startsWith: searchTerm } },
            { name: { endsWith: searchTerm } },
            { city: { startsWith: searchTerm } },
            { city: { endsWith: searchTerm } }
          ]
        },
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          companyType: true,
          logoUrl: true,
          verified: true
        },
        orderBy: [
          { verified: 'desc' },
          { name: 'asc' }
        ],
        take: 5
      });
    }

    // Contact suggestions  
    if (type === 'all' || type === 'contacts') {
      suggestions.contacts = await prisma.contact.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { fullName: { startsWith: searchTerm } },
                { fullName: { endsWith: searchTerm } },
                { title: { startsWith: searchTerm } },
                { title: { endsWith: searchTerm } }
              ]
            }
          ]
        },
        select: {
          id: true,
          fullName: true,
          title: true,
          verified: true,
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true
            }
          }
        },
        orderBy: [
          { verified: 'desc' },
          { seniority: 'desc' },
          { fullName: 'asc' }
        ],
        take: 5
      });
    }

    // Location suggestions
    if (type === 'all' || type === 'locations') {
      const locationResults = await prisma.company.findMany({
        where: {
          OR: [
            { city: { startsWith: searchTerm } },
            { city: { endsWith: searchTerm } },
            { state: { startsWith: searchTerm } },
            { state: { endsWith: searchTerm } }
          ]
        },
        select: {
          city: true,
          state: true,
          _count: {
            select: { contacts: true }
          }
        },
        distinct: ['city', 'state'],
        take: 8
      });

      suggestions.locations = locationResults
        .filter(loc => loc.city && loc.state)
        .map(loc => ({
          location: `${loc.city}, ${loc.state}`,
          city: loc.city,
          state: loc.state,
          count: loc._count.contacts
        }));
    }

    // Industry suggestions
    if (type === 'all' || type === 'industries') {
      const industries = await prisma.company.findMany({
        where: {
          industry: { not: null }
        },
        select: { industry: true },
        distinct: ['industry']
      });

      suggestions.industries = industries
        .filter(ind => 
          ind.industry && 
          ind.industry.toLowerCase().includes(searchTerm)
        )
        .map(ind => ({
          industry: ind.industry,
          label: ind.industry!.replace(/_/g, ' ')
        }))
        .slice(0, 5);
    }

    // Job title suggestions
    if (type === 'all' || type === 'titles') {
      const titles = await prisma.contact.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { title: { startsWith: searchTerm } },
                { title: { endsWith: searchTerm } }
              ]
            }
          ]
        },
        select: { title: true },
        distinct: ['title'],
        take: 8
      });

      suggestions.titles = titles.map(t => ({
        title: t.title
      }));
    }

    return NextResponse.json(suggestions);

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({
      companies: [],
      contacts: [],
      locations: [],
      industries: [],
      titles: []
    });
  }
} 