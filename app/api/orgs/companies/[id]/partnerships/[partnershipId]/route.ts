import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; partnershipId: string }> }
) {
  try {
    const { id, partnershipId } = await params;

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

    // Get partnership
    const partnership = await prisma.companyPartnership.findUnique({
      where: { id: partnershipId },
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
        },
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
      }
    });

    if (!partnership) {
      return NextResponse.json(
        { error: 'Partnership not found' },
        { status: 404 }
      );
    }

    // Verify this partnership belongs to the company
    if (partnership.agencyId !== id && partnership.advertiserId !== id) {
      return NextResponse.json(
        { error: 'Partnership does not belong to this company' },
        { status: 403 }
      );
    }

    return NextResponse.json(partnership);

  } catch (error) {
    console.error('Error fetching partnership:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partnership' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; partnershipId: string }> }
) {
  try {
    const { id, partnershipId } = await params;
    const body = await request.json();

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Verify partnership exists and belongs to this company
    const existingPartnership = await prisma.companyPartnership.findUnique({
      where: { id: partnershipId }
    });

    if (!existingPartnership) {
      return NextResponse.json(
        { error: 'Partnership not found' },
        { status: 404 }
      );
    }

    if (existingPartnership.agencyId !== id && existingPartnership.advertiserId !== id) {
      return NextResponse.json(
        { error: 'Partnership does not belong to this company' },
        { status: 403 }
      );
    }

    const {
      relationshipType,
      isAOR,
      services,
      startDate,
      endDate,
      isActive,
      contractValue,
      notes
    } = body;

    // Update partnership
    const updatedPartnership = await prisma.companyPartnership.update({
      where: { id: partnershipId },
      data: {
        ...(relationshipType !== undefined && { relationshipType }),
        ...(isAOR !== undefined && { isAOR }),
        ...(services !== undefined && { services: services || null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive }),
        ...(contractValue !== undefined && { contractValue: contractValue || null }),
        ...(notes !== undefined && { notes: notes || null }),
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

    return NextResponse.json(updatedPartnership);

  } catch (error) {
    console.error('Error updating partnership:', error);
    return NextResponse.json(
      { error: 'Failed to update partnership' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; partnershipId: string }> }
) {
  try {
    const { id, partnershipId } = await params;

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Verify partnership exists and belongs to this company
    const existingPartnership = await prisma.companyPartnership.findUnique({
      where: { id: partnershipId }
    });

    if (!existingPartnership) {
      return NextResponse.json(
        { error: 'Partnership not found' },
        { status: 404 }
      );
    }

    if (existingPartnership.agencyId !== id && existingPartnership.advertiserId !== id) {
      return NextResponse.json(
        { error: 'Partnership does not belong to this company' },
        { status: 403 }
      );
    }

    // Delete partnership
    await prisma.companyPartnership.delete({
      where: { id: partnershipId }
    });

    return NextResponse.json({
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
