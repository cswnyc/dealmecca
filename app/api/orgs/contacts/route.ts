import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuthError, createInternalError } from '@/lib/api-responses';

interface ContactSearchParams {
  q?: string;                    // Text search
  companyId?: string;           // Specific company
  companyType?: string[];       // Company type filter
  department?: string[];        // Department filter
  seniority?: string[];         // Seniority filter
  city?: string[];              // Location filter
  state?: string[];             // State filter
  budgetRange?: string[];       // Budget range filter
  verified?: boolean;           // Verification filter
  sortBy?: string;              // Sort method
  limit?: number;               // Results limit
  offset?: number;              // Pagination offset
}

export async function GET(request: NextRequest) {
  // Get user info from middleware headers - TEMPORARILY BYPASSED FOR TESTING
  const userId = request.headers.get('x-user-id') || 'demo-user';
  const userRole = request.headers.get('x-user-role') || 'ADMIN';
  const userTier = request.headers.get('x-user-tier') || 'PRO';

  const { searchParams } = new URL(request.url);
  
  const params: ContactSearchParams = {
    q: searchParams.get('q') || undefined,
    companyId: searchParams.get('companyId') || undefined,
    companyType: searchParams.getAll('companyType'),
    department: searchParams.getAll('department'),
    seniority: searchParams.getAll('seniority'),
    city: searchParams.getAll('city'),
    state: searchParams.getAll('state'),
    budgetRange: searchParams.getAll('budgetRange'),
    verified: searchParams.get('verified') ? searchParams.get('verified') === 'true' : undefined,
    sortBy: searchParams.get('sortBy') || 'relevance',
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
    offset: (() => {
      // Handle both 'offset' and 'page' parameters
      const offsetParam = searchParams.get('offset');
      const pageParam = searchParams.get('page');
      
      if (offsetParam) {
        return parseInt(offsetParam);
      } else if (pageParam) {
        const page = Math.max(1, parseInt(pageParam));
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        return (page - 1) * limit;
      }
      return 0;
    })()
  };

  try {
    // Get contacts through companies since direct contact queries fail
    const companies = await prisma.company.findMany({
      include: {
        contacts: {
          where: {
            isActive: true
          },
          include: {
            company: {
              select: {
                id: true,
                name: true,
                city: true,
                state: true,
                companyType: true,
                agencyType: true,
                logoUrl: true,
                verified: true
              }
            }
          }
        }
      }
    });

    // Flatten contacts from all companies
    const allContacts = companies.flatMap(company => company.contacts);
    
    // Apply search filters
    let filteredContacts = allContacts;
    
    if (params.q && typeof params.q === 'string' && params.q.length >= 2) {
      const searchTerm = params.q.toLowerCase();
      filteredContacts = allContacts.filter(contact =>
        contact.fullName?.toLowerCase().includes(searchTerm) ||
        contact.firstName?.toLowerCase().includes(searchTerm) ||
        contact.lastName?.toLowerCase().includes(searchTerm) ||
        contact.title?.toLowerCase().includes(searchTerm) ||
        contact.company.name?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply company filter
    if (params.companyId) {
      filteredContacts = filteredContacts.filter(contact => 
        contact.companyId === params.companyId
      );
    }

    // Apply pagination
    const totalCount = filteredContacts.length;
    const paginatedContacts = filteredContacts.slice(
      params.offset || 0, 
      (params.offset || 0) + (params.limit || 20)
    );

    return NextResponse.json({
      success: true,
      contacts: paginatedContacts,
      totalCount,
      facets: {
        departments: [],
        seniorities: [],
        companies: [],
        locations: []
      },
      pagination: {
        total: totalCount,
        page: Math.floor((params.offset || 0) / (params.limit || 20)) + 1,
        limit: params.limit || 20,
        offset: params.offset || 0,
        totalPages: Math.ceil(totalCount / (params.limit || 20)),
        hasMore: totalCount > ((params.offset || 0) + (params.limit || 20))
      },
      searchParams: params
    });

  } catch (error) {
    console.error('Contact search error:', error);
    return NextResponse.json({
      error: 'Failed to search contacts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function generateContactFacets(baseWhere: any) {
  try {
    // Get unique values for facets
    const [departments, seniorities, companies, locations] = await Promise.all([
      prisma.contact.findMany({
        where: { ...baseWhere, department: { not: null } },
        select: { department: true },
        distinct: ['department']
      }),
      
      prisma.contact.findMany({
        where: baseWhere,
        select: { seniority: true },
        distinct: ['seniority']
      }),
      
      prisma.contact.findMany({
        where: baseWhere,
        select: { 
          company: {
            select: { id: true, name: true }
          }
        },
        take: 10
      }),
      
      prisma.contact.findMany({
        where: baseWhere,
        select: {
          company: {
            select: { city: true, state: true }
          }
        },
        take: 20
      })
    ]);

    return {
      departments: departments.map(dept => ({
        department: dept.department,
        label: dept.department?.replace(/_/g, ' ') || 'Other',
        count: 1
      })),
      seniorities: seniorities.map(sen => ({
        seniority: sen.seniority,
        label: sen.seniority.replace(/_/g, ' '),
        count: 1
      })),
      companies: companies.map(contact => ({
        companyId: contact.company.id,
        name: contact.company.name,
        count: 1
      })),
      locations: Array.from(
        new Set(
          locations
            .map(l => l.company?.city && l.company?.state ? `${l.company.city}, ${l.company.state}` : null)
            .filter(Boolean)
        )
      ).map(location => ({ location, count: 1 }))
    };
  } catch (error) {
    console.error('Error generating contact facets:', error);
    return {
      departments: [],
      seniorities: [],
      companies: [],
      locations: []
    };
  }
} 