import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/requireAdmin';

// DELETE /api/admin/duties/[id] - Delete a duty
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    // Check if duty exists and get usage counts
    const duty = await prisma.duty.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            CompanyDuty: true,
            PartnershipDuty: true,
            ContactDuty: true
          }
        }
      }
    });

    if (!duty) {
      return NextResponse.json(
        { error: 'Duty not found' },
        { status: 404 }
      );
    }

    // Check if duty is in use
    const totalUsage = duty._count.CompanyDuty + duty._count.PartnershipDuty + duty._count.ContactDuty;
    if (totalUsage > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete duty "${duty.name}" because it is currently assigned to ${totalUsage} entities`,
          details: `This duty is assigned to ${duty._count.CompanyDuty} companies, ${duty._count.PartnershipDuty} partnerships, and ${duty._count.ContactDuty} contacts. Please remove these assignments before deleting the duty.`
        },
        { status: 400 }
      );
    }

    // Delete the duty
    await prisma.duty.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: `Duty "${duty.name}" deleted successfully`
    });
  } catch (error: any) {
    console.error('Error deleting duty:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Duty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete duty', details: error?.message },
      { status: 500 }
    );
  }
}

// GET /api/admin/duties/[id] - Get a single duty
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const duty = await prisma.duty.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            CompanyDuty: true,
            PartnershipDuty: true,
            ContactDuty: true
          }
        }
      }
    });

    if (!duty) {
      return NextResponse.json(
        { error: 'Duty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(duty);
  } catch (error: any) {
    console.error('Error fetching duty:', error);
    return NextResponse.json(
      { error: 'Failed to fetch duty', details: error?.message },
      { status: 500 }
    );
  }
}
