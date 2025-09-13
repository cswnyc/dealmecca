import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

// Get all partnerships for a specific company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
  
  if (!session || request.headers.get('x-user-role') !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: companyId } = await params;
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause for partnerships where company is either agency or advertiser
    const where: any = {
      OR: [
        { agencyId: companyId },
        { advertiserId: companyId }
      ]
    };
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const partnerships = await prisma.companyPartnership.findMany({
      where,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            companyType: true,
            logoUrl: true,
            city: true,
            state: true,
            verified: true
          }
        },
        advertiser: {
          select: {
            id: true,
            name: true,
            companyType: true,
            logoUrl: true,
            city: true,
            state: true,
            verified: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    // Transform partnerships to show the "partner" company (the one that's not the current company)
    const transformedPartnerships = partnerships.map(partnership => {
      const isAgency = partnership.agencyId === companyId;
      const partner = isAgency ? partnership.advertiser : partnership.agency;
      const role = isAgency ? 'agency' : 'advertiser';
      
      return {
        ...partnership,
        partner,
        currentCompanyRole: role
      };
    });

    const total = await prisma.companyPartnership.count({ where });

    return NextResponse.json({
      success: true,
      partnerships: transformedPartnerships,
      total
    });

  } catch (error) {
    console.error('Error fetching company partnerships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company partnerships' },
      { status: 500 }
    );
  }
}

// Create a new partnership for this company
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
  
  if (!session || request.headers.get('x-user-role') !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: companyId } = await params;
    const data = await request.json();

    // Validate required fields
    if (!data.partnerId) {
      return NextResponse.json({ error: 'Partner company ID is required' }, { status: 400 });
    }

    if (!data.role) {
      return NextResponse.json({ error: 'Company role (agency or advertiser) is required' }, { status: 400 });
    }

    // Prevent self-partnerships
    if (companyId === data.partnerId) {
      return NextResponse.json({ error: 'A company cannot partner with itself' }, { status: 400 });
    }

    // Check if both companies exist
    const [currentCompany, partnerCompany] = await Promise.all([
      prisma.company.findUnique({ where: { id: companyId } }),
      prisma.company.findUnique({ where: { id: data.partnerId } })
    ]);

    if (!currentCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (!partnerCompany) {
      return NextResponse.json({ error: 'Partner company not found' }, { status: 404 });
    }

    // Determine agencyId and advertiserId based on role
    const agencyId = data.role === 'agency' ? companyId : data.partnerId;
    const advertiserId = data.role === 'agency' ? data.partnerId : companyId;

    // Create partnership
    const partnership = await prisma.companyPartnership.create({
      data: {
        agencyId,
        advertiserId,
        relationshipType: data.relationshipType || 'AGENCY_CLIENT',
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive !== false,
        notes: data.notes || null,
        contractValue: data.contractValue || null,
        primaryContact: data.primaryContact || null
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            companyType: true,
            logoUrl: true,
            city: true,
            state: true,
            verified: true
          }
        },
        advertiser: {
          select: {
            id: true,
            name: true,
            companyType: true,
            logoUrl: true,
            city: true,
            state: true,
            verified: true
          }
        }
      }
    });

    // Transform the response to show partner and role
    const partner = data.role === 'agency' ? partnership.advertiser : partnership.agency;
    const transformedPartnership = {
      ...partnership,
      partner,
      currentCompanyRole: data.role
    };

    return NextResponse.json({
      success: true,
      message: 'Partnership created successfully',
      partnership: transformedPartnership
    });

  } catch (error) {
    console.error('Error creating partnership:', error);
    
    if (error instanceof Error) {
      // Handle unique constraint violations
      if (error.message.includes('unique constraint')) {
        return NextResponse.json({ error: 'Partnership already exists between these companies' }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to create partnership' },
      { status: 500 }
    );
  }
}