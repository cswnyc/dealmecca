import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const companyType = searchParams.get('companyType');
    const industry = searchParams.get('industry');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const region = searchParams.get('region');
    const verified = searchParams.get('verified');
    const parentCompanyId = searchParams.get('parentCompanyId');
    const hasParent = searchParams.get('hasParent');
    const hasSubsidiaries = searchParams.get('hasSubsidiaries');
    const sortBy = searchParams.get('sortBy') || 'name';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { website: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (companyType) {
      where.companyType = companyType;
    }

    if (industry) {
      where.industry = industry;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (state) {
      where.state = state;
    }

    if (region) {
      where.region = region;
    }

    if (verified !== null && verified !== undefined) {
      where.verified = verified === 'true';
    }

    if (parentCompanyId) {
      where.parentCompanyId = parentCompanyId;
    }

    if (hasParent === 'true') {
      where.parentCompanyId = { not: null };
    } else if (hasParent === 'false') {
      where.parentCompanyId = null;
    }

    if (hasSubsidiaries === 'true') {
      where.subsidiaries = { some: {} };
    }

    // Build orderBy clause
    let orderBy: any = { name: 'asc' };

    switch (sortBy) {
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'created':
        orderBy = { createdAt: 'desc' };
        break;
      case 'updated':
        orderBy = { updatedAt: 'desc' };
        break;
      case 'verified':
        orderBy = { verified: 'desc' };
        break;
      case 'employees':
        orderBy = { employeeCount: 'desc' };
        break;
      default:
        orderBy = { name: 'asc' };
    }

    // Get companies with relationships
    const companies = await prisma.company.findMany({
      where,
      include: {
        parentCompany: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        },
        _count: {
          select: {
            contacts: { where: { isActive: true } },
            User: true,
            subsidiaries: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.company.count({ where });
    const pages = Math.ceil(total / limit);

    // Get admin statistics (not affected by pagination)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total verified companies
    const verifiedCount = await prisma.company.count({
      where: { ...where, verified: true }
    });

    // Get total contacts across ALL companies (not just filtered)
    const totalContactsResult = await prisma.contact.aggregate({
      _count: {
        id: true
      },
      where: {
        isActive: true,
        company: where // Apply same filters as companies
      }
    });

    // Get companies created this month
    const companiesThisMonth = await prisma.company.count({
      where: {
        ...where,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    // Get type distribution
    const typeDistribution = await prisma.company.groupBy({
      by: ['companyType'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Get industry distribution
    const industryDistribution = await prisma.company.groupBy({
      by: ['industry'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Transform data
    const formattedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      website: company.website,
      logoUrl: company.logoUrl,
      description: company.description,
      companyType: company.companyType,
      agencyType: company.agencyType,
      industry: company.industry,
      city: company.city,
      state: company.state,
      country: company.country,
      employeeCount: company.employeeCount,
      revenueRange: company.revenueRange,
      verified: company.verified,
      dataQuality: company.dataQuality,
      lastVerified: company.lastVerified?.toISOString(),
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
      _count: {
        contacts: company._count.contacts,
        users: company._count.User,
        subsidiaries: company._count.subsidiaries
      }
    }));

    return NextResponse.json({
      companies: formattedCompanies,
      pagination: {
        page,
        limit,
        total,
        pages
      },
      adminStats: {
        totalCompanies: total,
        verifiedCount,
        totalContacts: totalContactsResult._count.id,
        companiesThisMonth,
        typeDistribution: typeDistribution.map(t => ({
          type: t.companyType || 'Unknown',
          count: t._count.id
        })),
        industryDistribution: industryDistribution.map(i => ({
          industry: i.industry || 'Unknown',
          count: i._count.id
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching admin companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle bulk operations
    if (body.operation === 'bulk') {
      const { action, companyIds } = body;

      switch (action) {
        case 'verify':
          await prisma.company.updateMany({
            where: {
              id: {
                in: companyIds
              }
            },
            data: {
              verified: true,
              lastVerified: new Date()
            }
          });

          return NextResponse.json({
            message: `${companyIds.length} compan${companyIds.length !== 1 ? 'ies' : 'y'} verified successfully`
          });

        case 'unverify':
          await prisma.company.updateMany({
            where: {
              id: {
                in: companyIds
              }
            },
            data: {
              verified: false,
              lastVerified: null
            }
          });

          return NextResponse.json({
            message: `${companyIds.length} compan${companyIds.length !== 1 ? 'ies' : 'y'} unverified successfully`
          });

        case 'delete':
          await prisma.company.deleteMany({
            where: {
              id: {
                in: companyIds
              }
            }
          });

          return NextResponse.json({
            message: `${companyIds.length} compan${companyIds.length !== 1 ? 'ies' : 'y'} deleted successfully`
          });

        default:
          return NextResponse.json(
            { error: 'Invalid bulk action' },
            { status: 400 }
          );
      }
    }

    // Delegate regular POST to main companies API
    const response = await fetch(`${request.nextUrl.origin}/api/orgs/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error in admin companies POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({
    error: 'Use the specific company ID endpoint for updates: /api/admin/companies/[id]',
    message: 'This endpoint handles listing and creating companies only'
  }, { status: 405 })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    error: 'Use the specific company ID endpoint for deletion: /api/admin/companies/[id]',
    message: 'This endpoint handles listing and creating companies only'
  }, { status: 405 })
}
