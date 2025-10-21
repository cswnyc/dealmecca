import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Advanced search endpoint with multi-criteria filtering
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query = '',
      entityType = 'all', // 'agencies', 'advertisers', 'people', 'all'
      filters = {},
      sort = { field: 'name', order: 'asc' },
      pagination = { page: 1, limit: 50 }
    } = body;

    const results: any = {
      agencies: [],
      advertisers: [],
      people: [],
      total: 0
    };

    // Search Agencies
    if (entityType === 'all' || entityType === 'agencies') {
      const agencyWhere: any = {
        OR: [
          { companyType: 'AGENCY' },
          { companyType: 'INDEPENDENT_AGENCY' },
          { companyType: 'HOLDING_COMPANY_AGENCY' },
          { companyType: 'MEDIA_HOLDING_COMPANY' }
        ]
      };

      // Add search query
      if (query) {
        agencyWhere.AND = agencyWhere.AND || [];
        agencyWhere.AND.push({
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { state: { contains: query, mode: 'insensitive' } }
          ]
        });
      }

      // Add filters
      if (filters.agencyType && filters.agencyType.length > 0) {
        agencyWhere.AND = agencyWhere.AND || [];
        agencyWhere.AND.push({
          OR: filters.agencyType.map((type: string) => ({ companyType: type }))
        });
      }

      if (filters.states && filters.states.length > 0) {
        agencyWhere.AND = agencyWhere.AND || [];
        agencyWhere.AND.push({
          OR: filters.states.map((state: string) => ({ state }))
        });
      }

      if (filters.cities && filters.cities.length > 0) {
        agencyWhere.AND = agencyWhere.AND || [];
        agencyWhere.AND.push({
          OR: filters.cities.map((city: string) => ({ city }))
        });
      }

      if (filters.verified !== undefined) {
        agencyWhere.verified = filters.verified;
      }

      const agencies = await prisma.company.findMany({
        where: agencyWhere,
        select: {
          id: true,
          name: true,
          companyType: true,
          agencyType: true,
          city: true,
          state: true,
          verified: true,
          logoUrl: true,
          _count: {
            select: {
              contacts: { where: { isActive: true } }
            }
          }
        },
        orderBy: { [sort.field]: sort.order },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit
      });

      results.agencies = agencies;
    }

    // Search Advertisers
    if (entityType === 'all' || entityType === 'advertisers') {
      const advertiserWhere: any = {
        companyType: 'ADVERTISER'
      };

      if (query) {
        advertiserWhere.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { state: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } }
        ];
      }

      // Add filters
      if (filters.industry && filters.industry.length > 0) {
        advertiserWhere.AND = advertiserWhere.AND || [];
        advertiserWhere.AND.push({
          OR: filters.industry.map((ind: string) => ({ industry: ind }))
        });
      }

      if (filters.states && filters.states.length > 0) {
        advertiserWhere.AND = advertiserWhere.AND || [];
        advertiserWhere.AND.push({
          OR: filters.states.map((state: string) => ({ state }))
        });
      }

      if (filters.verified !== undefined) {
        advertiserWhere.verified = filters.verified;
      }

      const advertisers = await prisma.company.findMany({
        where: advertiserWhere,
        select: {
          id: true,
          name: true,
          industry: true,
          city: true,
          state: true,
          verified: true,
          logoUrl: true,
          _count: {
            select: {
              contacts: { where: { isActive: true } }
            }
          }
        },
        orderBy: { [sort.field]: sort.order },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit
      });

      results.advertisers = advertisers;
    }

    // Search People
    if (entityType === 'all' || entityType === 'people') {
      const peopleWhere: any = {
        isActive: true
      };

      if (query) {
        peopleWhere.OR = [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { primaryRole: { contains: query, mode: 'insensitive' } },
          { company: { name: { contains: query, mode: 'insensitive' } } }
        ];
      }

      // Add filters
      if (filters.seniority && filters.seniority.length > 0) {
        peopleWhere.AND = peopleWhere.AND || [];
        peopleWhere.AND.push({
          OR: filters.seniority.map((sen: string) => ({ seniority: sen }))
        });
      }

      if (filters.department && filters.department.length > 0) {
        peopleWhere.AND = peopleWhere.AND || [];
        peopleWhere.AND.push({
          OR: filters.department.map((dept: string) => ({ department: dept }))
        });
      }

      if (filters.company && filters.company.length > 0) {
        peopleWhere.companyId = { in: filters.company };
      }

      if (filters.isDecisionMaker !== undefined) {
        peopleWhere.isDecisionMaker = filters.isDecisionMaker;
      }

      const people = await prisma.contact.findMany({
        where: peopleWhere,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          title: true,
          email: true,
          seniority: true,
          department: true,
          primaryRole: true,
          isDecisionMaker: true,
          company: {
            select: {
              id: true,
              name: true,
              companyType: true,
              industry: true,
              logoUrl: true,
              verified: true
            }
          }
        },
        orderBy: { [sort.field]: sort.order },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit
      });

      results.people = people;
    }

    results.total =
      (results.agencies?.length || 0) +
      (results.advertisers?.length || 0) +
      (results.people?.length || 0);

    return NextResponse.json({
      success: true,
      results,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: results.total
      }
    });
  } catch (error) {
    console.error('Error in advanced search:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
