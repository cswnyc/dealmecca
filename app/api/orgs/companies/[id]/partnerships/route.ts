import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createId } from '@paralleldrive/cuid2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id },
      select: { id: true, companyType: true }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get partnerships based on company type
    const AGENCY_TYPES = ['AGENCY', 'INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY', 'MEDIA_HOLDING_COMPANY'];

    const partnerships = AGENCY_TYPES.includes(company.companyType)
      ? await prisma.companyPartnership.findMany({
          where: { agencyId: id },
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
        })
      : await prisma.companyPartnership.findMany({
          where: { advertiserId: id },
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
        });

    // Format partnerships
    const formattedPartnerships = partnerships.map(p => ({
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
      partner: 'advertiser' in p ? p.advertiser : p.agency,
      partnerRole: 'advertiser' in p ? 'advertiser' as const : 'agency' as const
    }));

    return NextResponse.json(formattedPartnerships);

  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partnerships' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id },
      select: { id: true, companyType: true }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const {
      partnerId,
      relationshipType,
      isAOR,
      services,
      startDate,
      endDate,
      isActive,
      contractValue,
      notes
    } = body;

    if (!partnerId) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      );
    }

    // Verify partner company exists
    const partnerCompany = await prisma.company.findUnique({
      where: { id: partnerId },
      select: { id: true, companyType: true }
    });

    if (!partnerCompany) {
      return NextResponse.json(
        { error: 'Partner company not found' },
        { status: 404 }
      );
    }

    // Determine which is the agency and which is the advertiser
    const AGENCY_TYPES = ['AGENCY', 'INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY', 'MEDIA_HOLDING_COMPANY'];
    const ADVERTISER_TYPES = ['ADVERTISER', 'NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER'];

    let agencyId: string;
    let advertiserId: string;

    if (AGENCY_TYPES.includes(company.companyType)) {
      agencyId = id;
      advertiserId = partnerId;

      // Verify partner is an advertiser
      if (AGENCY_TYPES.includes(partnerCompany.companyType)) {
        return NextResponse.json(
          { error: 'Cannot create partnership between two agencies' },
          { status: 400 }
        );
      }
    } else {
      agencyId = partnerId;
      advertiserId = id;

      // Verify partner is an agency
      if (!AGENCY_TYPES.includes(partnerCompany.companyType)) {
        return NextResponse.json(
          { error: 'Partner must be an agency or media holding company' },
          { status: 400 }
        );
      }
    }

    // Check for existing partnership
    const existingPartnership = await prisma.companyPartnership.findFirst({
      where: {
        agencyId,
        advertiserId
      }
    });

    if (existingPartnership) {
      return NextResponse.json(
        { error: 'Partnership already exists between these companies' },
        { status: 400 }
      );
    }

    // Create partnership
    const partnership = await prisma.companyPartnership.create({
      data: {
        id: createId(),
        agencyId,
        advertiserId,
        relationshipType: relationshipType || 'AGENCY_CLIENT',
        isAOR: isAOR || false,
        services: services || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : true,
        contractValue: contractValue || null,
        notes: notes || null,
        updatedAt: new Date()
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true,
            industry: true
          }
        },
        advertiser: {
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

    return NextResponse.json(partnership, { status: 201 });

  } catch (error) {
    console.error('Error creating partnership:', error);
    return NextResponse.json(
      { error: 'Failed to create partnership' },
      { status: 500 }
    );
  }
}
