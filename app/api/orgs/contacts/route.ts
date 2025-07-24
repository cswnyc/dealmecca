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
    verified: searchParams.get('verified') === 'true',
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
    const where: any = { 
      AND: [
        { isActive: true } // Only show active contacts
      ] 
    };

    // Text search across name and title
    if (params.q && typeof params.q === 'string') {
      if (params.q.length >= 2) {
        const searchTerm = params.q.toLowerCase();
        where.AND.push({
          OR: [
            { fullName: { startsWith: searchTerm } },
            { fullName: { endsWith: searchTerm } },
            { firstName: { startsWith: searchTerm } },
            { firstName: { endsWith: searchTerm } },
            { lastName: { startsWith: searchTerm } },
            { lastName: { endsWith: searchTerm } },
            { title: { startsWith: searchTerm } },
            { title: { endsWith: searchTerm } },
            { company: { name: { startsWith: searchTerm } } },
            { company: { name: { endsWith: searchTerm } } }
          ]
        });
      } else if (params.q.length > 0) {
        // If query is too short but not empty, return no results
        where.AND.push({ id: { equals: null } });
      }
    }

    // Company-specific filter
    if (params.companyId) {
      where.AND.push({
        companyId: params.companyId
      });
    }

    // Company type filter (via company relationship)
    if (params.companyType?.length) {
      where.AND.push({
        company: {
          companyType: { in: params.companyType }
        }
      });
    }

    // Department filter
    if (params.department?.length) {
      where.AND.push({
        department: { in: params.department }
      });
    }

    // Seniority filter
    if (params.seniority?.length) {
      where.AND.push({
        seniority: { in: params.seniority }
      });
    }

    // Location filters (via company)
    if (params.city?.length) {
      where.AND.push({
        company: {
          city: { in: params.city }
        }
      });
    }

    if (params.state?.length) {
      where.AND.push({
        company: {
          state: { in: params.state }
        }
      });
    }

    // Budget range filter
    if (params.budgetRange?.length) {
      where.AND.push({
        budgetRange: { in: params.budgetRange }
      });
    }

    // Verification filter
    if (params.verified !== undefined) {
      where.AND.push({
        verified: params.verified
      });
    }

    // Build order by
    let orderBy: any = [];
    switch (params.sortBy) {
      case 'name':
        orderBy = [{ lastName: 'asc' }, { firstName: 'asc' }];
        break;
      case 'title':
        orderBy = [{ title: 'asc' }, { lastName: 'asc' }];
        break;
      case 'company':
        orderBy = [{ company: { name: 'asc' } }, { lastName: 'asc' }];
        break;
      case 'seniority':
        orderBy = [{ seniority: 'desc' }, { lastName: 'asc' }];
        break;
      case 'recent':
        orderBy = [{ updatedAt: 'desc' }];
        break;
      default: // relevance
        orderBy = [
          { verified: 'desc' },
          { seniority: 'desc' },
          { lastName: 'asc' }
        ];
    }

    // Execute search
    const [contacts, totalCount] = await Promise.all([
      prisma.contact.findMany({
        where,
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
        },
        orderBy,
        take: params.limit,
        skip: params.offset
      }),
      prisma.contact.count({ where })
    ]);

    // Generate contact facets
    const facets = await generateContactFacets(where);

    // Track search analytics
    await prisma.search.create({
      data: {
        userId: userId,
        query: params.q || '',
        resultsCount: totalCount,
        searchType: 'contact'
      }
    });

    return NextResponse.json({
      contacts,
      totalCount,
      facets,
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
    return NextResponse.json(
      { error: 'Failed to search contacts' },
      { status: 500 }
    );
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