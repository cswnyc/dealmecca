import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

// Get all partnerships with filtering
export async function GET(request: NextRequest) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role)
  const userId = request.headers.get('x-user-id');
  
  if (!userId || request.headers.get('x-user-role') !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const isActive = searchParams.get('isActive');
    const relationshipType = searchParams.get('relationshipType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    
    if (companyId) {
      where.OR = [
        { agencyId: companyId },
        { advertiserId: companyId }
      ];
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    
    if (relationshipType) {
      where.relationshipType = relationshipType;
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
      take: limit,
      skip: offset
    });

    const total = await prisma.companyPartnership.count({ where });

    return NextResponse.json({
      success: true,
      partnerships,
      total,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partnerships' },
      { status: 500 }
    );
  }
}

// Create new partnership
export async function POST(request: NextRequest) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role)
  const userId = request.headers.get('x-user-id');
  
  if (!userId || request.headers.get('x-user-role') !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.agencyId) {
      return NextResponse.json({ error: 'Agency ID is required' }, { status: 400 });
    }

    if (!data.advertiserId) {
      return NextResponse.json({ error: 'Advertiser ID is required' }, { status: 400 });
    }

    // Prevent self-partnerships
    if (data.agencyId === data.advertiserId) {
      return NextResponse.json({ error: 'A company cannot partner with itself' }, { status: 400 });
    }

    // Check if both companies exist
    const [agency, advertiser] = await Promise.all([
      prisma.company.findUnique({ where: { id: data.agencyId } }),
      prisma.company.findUnique({ where: { id: data.advertiserId } })
    ]);

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    if (!advertiser) {
      return NextResponse.json({ error: 'Advertiser not found' }, { status: 404 });
    }

    // Create partnership
    const partnership = await prisma.companyPartnership.create({
      data: {
        agencyId: data.agencyId,
        advertiserId: data.advertiserId,
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

    return NextResponse.json({
      success: true,
      message: 'Partnership created successfully',
      partnership
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