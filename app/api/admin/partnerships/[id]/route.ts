import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

// Get single partnership
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role)
  const userId = request.headers.get('x-user-id');
  
  if (!userId || request.headers.get('x-user-role') !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const partnership = await prisma.companyPartnership.findUnique({
      where: { id },
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

    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      partnership
    });

  } catch (error) {
    console.error('Error fetching partnership:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partnership' },
      { status: 500 }
    );
  }
}

// Update partnership
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role)
  const userId = request.headers.get('x-user-id');
  
  if (!userId || request.headers.get('x-user-role') !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();

    // Validate that partnership exists
    const existingPartnership = await prisma.companyPartnership.findUnique({
      where: { id }
    });

    if (!existingPartnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    // If changing company IDs, validate the new companies exist
    if (data.agencyId && data.agencyId !== existingPartnership.agencyId) {
      const agency = await prisma.company.findUnique({ where: { id: data.agencyId } });
      if (!agency) {
        return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
      }
    }

    if (data.advertiserId && data.advertiserId !== existingPartnership.advertiserId) {
      const advertiser = await prisma.company.findUnique({ where: { id: data.advertiserId } });
      if (!advertiser) {
        return NextResponse.json({ error: 'Advertiser not found' }, { status: 404 });
      }
    }

    // Prevent self-partnerships if changing company IDs
    const newAgencyId = data.agencyId || existingPartnership.agencyId;
    const newAdvertiserId = data.advertiserId || existingPartnership.advertiserId;
    
    if (newAgencyId === newAdvertiserId) {
      return NextResponse.json({ error: 'A company cannot partner with itself' }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (data.agencyId !== undefined) updateData.agencyId = data.agencyId;
    if (data.advertiserId !== undefined) updateData.advertiserId = data.advertiserId;
    if (data.relationshipType !== undefined) updateData.relationshipType = data.relationshipType;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.contractValue !== undefined) updateData.contractValue = data.contractValue;
    if (data.primaryContact !== undefined) updateData.primaryContact = data.primaryContact;

    const partnership = await prisma.companyPartnership.update({
      where: { id },
      data: updateData,
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
      message: 'Partnership updated successfully',
      partnership
    });

  } catch (error) {
    console.error('Error updating partnership:', error);
    
    if (error instanceof Error) {
      // Handle unique constraint violations
      if (error.message.includes('unique constraint')) {
        return NextResponse.json({ error: 'Partnership already exists between these companies' }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to update partnership' },
      { status: 500 }
    );
  }
}

// Delete partnership
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role)
  const userId = request.headers.get('x-user-id');
  
  if (!userId || request.headers.get('x-user-role') !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Check if partnership exists
    const partnership = await prisma.companyPartnership.findUnique({
      where: { id }
    });

    if (!partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    // Delete the partnership
    await prisma.companyPartnership.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Partnership deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting partnership:', error);
    return NextResponse.json(
      { error: 'Failed to delete partnership' },
      { status: 500 }
    );
  }
}