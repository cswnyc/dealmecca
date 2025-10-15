import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        // Parent company relationship
        parentCompany: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true,
            industry: true,
            city: true,
            state: true,
            verified: true
          }
        },
        // Subsidiaries
        subsidiaries: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true,
            industry: true,
            city: true,
            state: true,
            verified: true
          }
        },
        // Contacts at this company
        contacts: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            title: true,
            email: true,
            phone: true,
            linkedinUrl: true,
            logoUrl: true,
            department: true,
            seniority: true,
            primaryRole: true,
            territories: true,
            accounts: true,
            isDecisionMaker: true,
            verified: true,
            dataQuality: true,
            communityScore: true,
            createdAt: true,
            updatedAt: true
          }
        },
        // Agency partnerships (when this company is an agency)
        CompanyPartnership_agencyIdToCompany: {
          include: {
            advertiser: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                companyType: true,
                industry: true,
                city: true,
                state: true,
                verified: true
              }
            }
          },
          orderBy: { startDate: 'desc' }
        },
        // Advertiser partnerships (when this company is an advertiser)
        CompanyPartnership_advertiserIdToCompany: {
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                companyType: true,
                industry: true,
                city: true,
                state: true,
                verified: true
              }
            }
          },
          orderBy: { startDate: 'desc' }
        },
        // Users associated with this company
        User: {
          where: { isActive: true },
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            contacts: true,
            subsidiaries: true,
            CompanyPartnership_agencyIdToCompany: true,
            CompanyPartnership_advertiserIdToCompany: true,
            User: true
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Format partnerships based on company type
    const formattedCompany = {
      id: company.id,
      name: company.name,
      logoUrl: company.logoUrl,
      website: company.website,
      description: company.description,
      companyType: company.companyType,
      industry: company.industry,
      hqAddress: company.hqAddress,
      city: company.city,
      state: company.state,
      country: company.country,
      zipCode: company.zipCode,
      phone: company.phone,
      email: company.email,
      linkedinUrl: company.linkedinUrl,
      employeeCount: company.employeeCount,
      revenue: company.revenue,
      yearFounded: company.yearFounded,
      verified: company.verified,
      dataQuality: company.dataQuality,
      lastVerified: company.lastVerified?.toISOString(),
      communityScore: company.communityScore,
      parentCompanyId: company.parentCompanyId,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),

      // Relationships
      parentCompany: company.parentCompany,
      subsidiaries: company.subsidiaries,
      contacts: company.contacts,
      users: company.User,

      // Partnerships (formatted based on company type)
      partnerships: company.companyType === 'AGENCY' || company.companyType === 'MEDIA_HOLDING_COMPANY'
        ? company.CompanyPartnership_agencyIdToCompany.map(p => ({
            id: p.id,
            relationshipType: p.relationshipType,
            isAOR: p.isAOR,
            services: p.services,
            startDate: p.startDate?.toISOString(),
            endDate: p.endDate?.toISOString(),
            isActive: p.isActive,
            contractValue: p.contractValue,
            notes: p.notes,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
            partner: p.advertiser,
            partnerRole: 'advertiser' as const
          }))
        : company.CompanyPartnership_advertiserIdToCompany.map(p => ({
            id: p.id,
            relationshipType: p.relationshipType,
            isAOR: p.isAOR,
            services: p.services,
            startDate: p.startDate?.toISOString(),
            endDate: p.endDate?.toISOString(),
            isActive: p.isActive,
            contractValue: p.contractValue,
            notes: p.notes,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
            partner: p.agency,
            partnerRole: 'agency' as const
          })),

      // Counts
      _count: {
        contacts: company._count.contacts,
        subsidiaries: company._count.subsidiaries,
        users: company._count.User,
        partnerships: company.companyType === 'AGENCY' || company.companyType === 'MEDIA_HOLDING_COMPANY'
          ? company._count.CompanyPartnership_agencyIdToCompany
          : company._count.CompanyPartnership_advertiserIdToCompany
      }
    };

    return NextResponse.json(formattedCompany);

  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const {
      name,
      logoUrl,
      website,
      description,
      companyType,
      industry,
      hqAddress,
      city,
      state,
      country,
      zipCode,
      phone,
      email,
      linkedinUrl,
      employeeCount,
      revenue,
      yearFounded,
      verified,
      parentCompanyId
    } = body;

    // If parent company is being changed, verify it exists
    if (parentCompanyId !== undefined && parentCompanyId !== null && parentCompanyId !== existingCompany.parentCompanyId) {
      const parentCompany = await prisma.company.findUnique({
        where: { id: parentCompanyId }
      });

      if (!parentCompany) {
        return NextResponse.json(
          { error: 'Parent company not found' },
          { status: 400 }
        );
      }

      // Prevent circular hierarchy
      if (parentCompanyId === id) {
        return NextResponse.json(
          { error: 'Company cannot be its own parent' },
          { status: 400 }
        );
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl || null }),
        ...(website !== undefined && { website: website || null }),
        ...(description !== undefined && { description: description || null }),
        ...(companyType !== undefined && { companyType }),
        ...(industry !== undefined && { industry: industry || null }),
        ...(hqAddress !== undefined && { hqAddress: hqAddress || null }),
        ...(city !== undefined && { city: city || null }),
        ...(state !== undefined && { state: state || null }),
        ...(country !== undefined && { country: country || null }),
        ...(zipCode !== undefined && { zipCode: zipCode || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(email !== undefined && { email: email || null }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl || null }),
        ...(employeeCount !== undefined && { employeeCount: employeeCount || null }),
        ...(revenue !== undefined && { revenue: revenue || null }),
        ...(yearFounded !== undefined && { yearFounded: yearFounded || null }),
        ...(verified !== undefined && { verified }),
        ...(parentCompanyId !== undefined && { parentCompanyId: parentCompanyId || null }),
        // Update verification timestamp if verified status changed
        ...(verified !== undefined && verified !== existingCompany.verified && {
          lastVerified: verified ? new Date() : null
        }),
        updatedAt: new Date()
      },
      include: {
        parentCompany: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true
          }
        },
        _count: {
          select: {
            contacts: true,
            subsidiaries: true,
            CompanyPartnership_agencyIdToCompany: true,
            CompanyPartnership_advertiserIdToCompany: true
          }
        }
      }
    });

    return NextResponse.json(updatedCompany);

  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            contacts: true,
            subsidiaries: true,
            CompanyPartnership_agencyIdToCompany: true,
            CompanyPartnership_advertiserIdToCompany: true,
            User: true
          }
        }
      }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if company has related data
    const hasRelatedData =
      existingCompany._count.contacts > 0 ||
      existingCompany._count.subsidiaries > 0 ||
      existingCompany._count.CompanyPartnership_agencyIdToCompany > 0 ||
      existingCompany._count.CompanyPartnership_advertiserIdToCompany > 0 ||
      existingCompany._count.User > 0;

    if (hasRelatedData) {
      return NextResponse.json(
        {
          error: 'Cannot delete company with existing relationships',
          message: 'This company has contacts, partnerships, subsidiaries, or users associated with it. Please remove these relationships first or mark the company as inactive.',
          counts: existingCompany._count
        },
        { status: 400 }
      );
    }

    // Safe to delete if no related data
    await prisma.company.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Company deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
