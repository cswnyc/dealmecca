import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('[COMPANY API] Querying company with id:', id);

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        parentCompany: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true
          }
        },
        subsidiaries: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true,
            verified: true
          },
          orderBy: {
            name: 'asc'
          }
        },
        contacts: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            title: true,
            email: true,
            phone: true,
            verified: true,
            seniority: true,
            department: true
          },
          orderBy: {
            lastName: 'asc'
          }
        },
        CompanyPartnership_agencyIdToCompany: {
          where: {
            isActive: true
          },
          include: {
            advertiser: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                companyType: true,
                industry: true,
                verified: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        CompanyPartnership_advertiserIdToCompany: {
          where: {
            isActive: true
          },
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                companyType: true,
                agencyType: true,
                verified: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        _count: {
          select: {
            contacts: {
              where: {
                isActive: true
              }
            },
            User: true,
            subsidiaries: true,
            CompanyPartnership_agencyIdToCompany: {
              where: {
                isActive: true
              }
            },
            CompanyPartnership_advertiserIdToCompany: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    });

    console.log('[COMPANY API] Found company:', company ? company.name : 'null');

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Format partnerships for frontend
    const partnerships = [
      ...company.CompanyPartnership_agencyIdToCompany.map(p => ({
        id: p.id,
        relationshipType: p.relationshipType,
        isAOR: p.isAOR,
        services: p.services,
        startDate: p.startDate?.toISOString() || null,
        endDate: p.endDate?.toISOString() || null,
        isActive: p.isActive,
        contractValue: p.contractValue,
        notes: p.notes,
        partner: p.advertiser,
        partnerRole: 'advertiser' as const
      })),
      ...company.CompanyPartnership_advertiserIdToCompany.map(p => ({
        id: p.id,
        relationshipType: p.relationshipType,
        isAOR: p.isAOR,
        services: p.services,
        startDate: p.startDate?.toISOString() || null,
        endDate: p.endDate?.toISOString() || null,
        isActive: p.isActive,
        contractValue: p.contractValue,
        notes: p.notes,
        partner: p.agency,
        partnerRole: 'agency' as const
      }))
    ];

    // Calculate partnership counts
    const partnershipCount = company.CompanyPartnership_agencyIdToCompany.length +
                            company.CompanyPartnership_advertiserIdToCompany.length;

    // Format response
    const formattedCompany = {
      ...company,
      partnerships,
      _count: {
        ...company._count,
        partnerships: partnershipCount
      }
    };

    // Remove the raw partnership arrays
    delete (formattedCompany as any).CompanyPartnership_agencyIdToCompany;
    delete (formattedCompany as any).CompanyPartnership_advertiserIdToCompany;

    return NextResponse.json(formattedCompany);

  } catch (error: any) {
    console.error('[COMPANY API ERROR] Full error:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch company',
        details: error?.message,
        code: error?.code
      },
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
      agencyType,
      advertisingModel,
      industry,
      address,
      city,
      state,
      region,
      country,
      zipCode,
      linkedinUrl,
      twitterHandle,
      headquarters,
      employeeCount,
      revenueRange,
      revenue,
      foundedYear,
      stockSymbol,
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
        ...(agencyType !== undefined && { agencyType: agencyType || null }),
        ...(advertisingModel !== undefined && { advertisingModel: advertisingModel || null }),
        ...(industry !== undefined && { industry: industry || null }),
        ...(address !== undefined && { address: address || null }),
        ...(city !== undefined && { city: city || null }),
        ...(state !== undefined && { state: state || null }),
        ...(region !== undefined && { region: region || null }),
        ...(country !== undefined && { country: country || null }),
        ...(zipCode !== undefined && { zipCode: zipCode || null }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl || null }),
        ...(twitterHandle !== undefined && { twitterHandle: twitterHandle || null }),
        ...(headquarters !== undefined && { headquarters: headquarters || null }),
        ...(employeeCount !== undefined && { employeeCount: employeeCount || null }),
        ...(revenueRange !== undefined && { revenueRange: revenueRange || null }),
        ...(revenue !== undefined && { revenue: revenue || null }),
        ...(foundedYear !== undefined && { foundedYear: foundedYear || null }),
        ...(stockSymbol !== undefined && { stockSymbol: stockSymbol || null }),
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
