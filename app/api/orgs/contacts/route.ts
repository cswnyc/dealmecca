import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createId } from '@paralleldrive/cuid2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const companyId = searchParams.get('companyId');
    const companyType = searchParams.get('companyType');
    const industry = searchParams.get('industry');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const department = searchParams.get('department');
    const seniority = searchParams.get('seniority');
    const primaryRole = searchParams.get('primaryRole');
    const verified = searchParams.get('verified');
    const isActive = searchParams.get('isActive');
    const isDecisionMaker = searchParams.get('isDecisionMaker');
    const territory = searchParams.get('territory');
    const account = searchParams.get('account');
    const budgetRange = searchParams.get('budgetRange');
    const agencyPartner = searchParams.get('agencyPartner');
    const sortBy = searchParams.get('sortBy') || 'fullName';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (companyId) {
      where.companyId = companyId;
    }

    // Filter by company type (agency or advertiser)
    if (companyType) {
      where.company = {
        ...where.company,
        companyType: companyType
      };
    }

    // Filter by company industry
    if (industry) {
      where.company = {
        ...where.company,
        industry: industry
      };
    }

    // Filter by company city
    if (city) {
      where.company = {
        ...where.company,
        city: { contains: city, mode: 'insensitive' }
      };
    }

    // Filter by company state
    if (state) {
      where.company = {
        ...where.company,
        state: state
      };
    }

    if (department) {
      where.department = department;
    }

    if (seniority) {
      where.seniority = seniority;
    }

    if (primaryRole) {
      where.primaryRole = primaryRole;
    }

    if (verified !== null && verified !== undefined) {
      where.verified = verified === 'true';
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (isDecisionMaker !== null && isDecisionMaker !== undefined) {
      where.isDecisionMaker = isDecisionMaker === 'true';
    }

    // Filter by territory (JSON field)
    if (territory) {
      where.territories = {
        contains: territory
      };
    }

    // Filter by account (JSON field)
    if (account) {
      where.accounts = {
        contains: account
      };
    }

    if (budgetRange) {
      where.budgetRange = budgetRange;
    }

    // Filter contacts at advertisers by their agency partner
    if (agencyPartner) {
      where.company = {
        ...where.company,
        CompanyPartnership_advertiserIdToCompany: {
          some: {
            agencyId: agencyPartner,
            isActive: true
          }
        }
      };
    }

    // Build orderBy clause
    let orderBy: any = { fullName: 'asc' }; // default to fullName

    switch (sortBy) {
      case 'firstName':
        orderBy = { firstName: 'asc' };
        break;
      case 'lastName':
        orderBy = { lastName: 'asc' };
        break;
      case 'fullName':
        orderBy = { fullName: 'asc' };
        break;
      case 'title':
        orderBy = { title: 'asc' };
        break;
      case 'company':
        orderBy = { company: { name: 'asc' } };
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
      case 'department':
        orderBy = { department: 'asc' };
        break;
      case 'seniority':
        orderBy = { seniority: 'asc' };
        break;
      default:
        orderBy = { fullName: 'asc' };
    }

    // Get contacts with relationships
    const contacts = await prisma.contact.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true,
            industry: true,
            city: true,
            state: true
          }
        },
        _count: {
          select: {
            ContactInteraction: true,
            ContactNote: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.contact.count({ where });
    const pages = Math.ceil(total / limit);

    // Transform data to match frontend expectations
    const formattedContacts = contacts.map(contact => ({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      fullName: contact.fullName,
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
      linkedinUrl: contact.linkedinUrl,
      logoUrl: contact.logoUrl,
      personalEmail: contact.personalEmail,
      department: contact.department,
      seniority: contact.seniority,
      primaryRole: contact.primaryRole,
      companyId: contact.companyId,
      territories: contact.territories,
      accounts: contact.accounts,
      budgetRange: contact.budgetRange,
      isDecisionMaker: contact.isDecisionMaker,
      verified: contact.verified,
      dataQuality: contact.dataQuality,
      lastVerified: contact.lastVerified?.toISOString(),
      isActive: contact.isActive,
      preferredContact: contact.preferredContact,
      communityScore: contact.communityScore,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
      company: contact.company,
      _count: {
        interactions: contact._count.ContactInteraction,
        notes: contact._count.ContactNote
      }
    }));

    return NextResponse.json({
      contacts: formattedContacts,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
    const {
      firstName,
      lastName,
      title,
      email,
      phone,
      linkedinUrl,
      personalEmail,
      department,
      seniority,
      primaryRole,
      companyId,
      territories,
      accounts,
      budgetRange,
      isDecisionMaker = false,
      preferredContact
    } = body;

    if (!firstName || !lastName || !title || !companyId || !seniority) {
      return NextResponse.json(
        { error: 'First name, last name, title, company, and seniority are required' },
        { status: 400 }
      );
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 400 }
      );
    }

    // Generate full name
    const fullName = `${firstName} ${lastName}`;

    // Check for existing contact with same name at same company
    const existingContact = await prisma.contact.findFirst({
      where: {
        firstName,
        lastName,
        companyId
      }
    });

    if (existingContact) {
      return NextResponse.json(
        { error: 'Contact with this name already exists at this company' },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        id: createId(),
        firstName,
        lastName,
        fullName,
        title,
        email: email || null,
        phone: phone || null,
        linkedinUrl: linkedinUrl || null,
        personalEmail: personalEmail || null,
        department: department || null,
        seniority,
        primaryRole: primaryRole || null,
        companyId,
        territories: territories || null,
        accounts: accounts || null,
        budgetRange: budgetRange || null,
        isDecisionMaker,
        preferredContact: preferredContact || null,
        updatedAt: new Date()
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true,
            industry: true
          }
        }
      }
    });

    return NextResponse.json(contact, { status: 201 });

  } catch (error: any) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      {
        error: 'Failed to create contact',
        details: error?.message || String(error),
        body: JSON.stringify(body)
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({
    error: 'Use the specific contact ID endpoint for updates: /api/orgs/contacts/[id]',
    message: 'This endpoint handles listing and creating contacts only'
  }, { status: 405 })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    error: 'Use the specific contact ID endpoint for deletion: /api/orgs/contacts/[id]',
    message: 'This endpoint handles listing and creating contacts only'
  }, { status: 405 })
}