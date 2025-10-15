import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createId } from '@paralleldrive/cuid2';

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
    const partnerIndustry = searchParams.get('partnerIndustry');
    const hasActivePartnerships = searchParams.get('hasActivePartnerships');
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

    // Filter by partner industry (agencies with clients in specific industry)
    if (partnerIndustry) {
      where.CompanyPartnership_agencyIdToCompany = {
        some: {
          advertiser: {
            industry: partnerIndustry
          }
        }
      };
    }

    // Filter by companies with active partnerships
    if (hasActivePartnerships === 'true') {
      where.OR = [
        {
          CompanyPartnership_agencyIdToCompany: {
            some: { isActive: true }
          }
        },
        {
          CompanyPartnership_advertiserIdToCompany: {
            some: { isActive: true }
          }
        }
      ];
    }

    // Build orderBy clause
    let orderBy: any = { name: 'asc' }; // default to name
    
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
            contacts: true,
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

    // Transform data to match frontend expectations
    const formattedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      website: company.website,
      logoUrl: company.logoUrl,
      description: company.description,
      companyType: company.companyType,
      agencyType: company.agencyType,
      advertisingModel: company.advertisingModel,
      industry: company.industry,
      address: company.address,
      city: company.city,
      state: company.state,
      region: company.region,
      country: company.country,
      zipCode: company.zipCode,
      employeeCount: company.employeeCount,
      revenueRange: company.revenueRange,
      teamCount: company.teamCount,
      foundedYear: company.foundedYear,
      stockSymbol: company.stockSymbol,
      linkedinUrl: company.linkedinUrl,
      twitterHandle: company.twitterHandle,
      headquarters: company.headquarters,
      revenue: company.revenue,
      verified: company.verified,
      dataQuality: company.dataQuality,
      lastVerified: company.lastVerified?.toISOString(),
      verifiedBy: company.verifiedBy,
      aiSummary: company.aiSummary,
      lastInsightUpdate: company.lastInsightUpdate?.toISOString(),
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
      parentCompany: company.parentCompany ? {
        id: company.parentCompany.id,
        name: company.parentCompany.name,
        logoUrl: company.parentCompany.logoUrl
      } : null,
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
      }
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      website,
      description,
      companyType,
      agencyType,
      advertisingModel,
      industry,
      address,
      city,
      state,
      region = 'NATIONAL',
      country = 'US',
      zipCode,
      employeeCount,
      revenueRange,
      teamCount,
      foundedYear,
      stockSymbol,
      linkedinUrl,
      twitterHandle,
      headquarters,
      revenue,
      parentCompanyId,
      logoUrl,
      verified
    } = body;

    if (!name || !companyType) {
      return NextResponse.json(
        { error: 'Name and companyType are required' },
        { status: 400 }
      );
    }

    // Generate unique slug from name
    const baseSlug = name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure slug is unique
    while (await prisma.company.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const company = await prisma.Company.create({
      data: {
        id: createId(),
        name,
        slug,
        website,
        logoUrl,
        description,
        companyType,
        agencyType,
        advertisingModel,
        industry,
        address,
        city,
        state,
        region,
        country,
        zipCode,
        employeeCount,
        revenueRange,
        teamCount,
        foundedYear,
        stockSymbol,
        linkedinUrl,
        twitterHandle,
        headquarters,
        revenue,
        parentCompanyId,
        verified: verified || false,
        normalizedName: name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim(),
        normalizedWebsite: website?.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, ''),
        updatedAt: new Date()
      },
      include: {
        parentCompany: {
          select: {
            id: true,
            name: true,
            logoUrl: true
          }
        }
      }
    });

    return NextResponse.json(company, { status: 201 });

  } catch (error: any) {
    console.error('Error creating company:', error);

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';

      // Find the duplicate company to provide helpful details
      try {
        let duplicateCompany = null;

        if (field === 'name') {
          duplicateCompany = await prisma.Company.findUnique({
            where: { name },
            select: { id: true, name: true, companyType: true, website: true }
          });
        } else if (field === 'website' && website) {
          duplicateCompany = await prisma.Company.findUnique({
            where: { website },
            select: { id: true, name: true, companyType: true, website: true }
          });
        }

        if (duplicateCompany) {
          return NextResponse.json(
            {
              error: `A company with this ${field} already exists`,
              duplicateField: field,
              duplicateValue: field === 'name' ? name : website,
              existingCompany: {
                id: duplicateCompany.id,
                name: duplicateCompany.name,
                companyType: duplicateCompany.companyType,
                website: duplicateCompany.website
              }
            },
            { status: 409 }
          );
        }
      } catch (lookupError) {
        console.error('Error looking up duplicate:', lookupError);
      }

      // Fallback to generic error if lookup fails
      return NextResponse.json(
        { error: `A company with this ${field} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create company' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Use the specific company ID endpoint for updates: /api/orgs/companies/[id]',
    message: 'This endpoint handles listing and creating companies only'
  }, { status: 405 })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Use the specific company ID endpoint for deletion: /api/orgs/companies/[id]',
    message: 'This endpoint handles listing and creating companies only'
  }, { status: 405 })
}
