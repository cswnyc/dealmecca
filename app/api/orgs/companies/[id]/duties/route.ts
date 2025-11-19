import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orgs/companies/[id]/duties - Get all duties for a company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = {
      companyId: id
    };

    if (category) {
      where.duty = {
        category
      };
    }

    const companyDuties = await prisma.companyDuty.findMany({
      where,
      include: {
        duty: true
      },
      orderBy: {
        duty: {
          name: 'asc'
        }
      }
    });

    // Group by category
    const grouped = companyDuties.reduce((acc, cd) => {
      const category = cd.duty.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(cd.duty);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      duties: companyDuties.map(cd => cd.duty),
      grouped,
      total: companyDuties.length
    });
  } catch (error: any) {
    console.error('Error fetching company duties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company duties', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/orgs/companies/[id]/duties - Add duties to a company
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { dutyIds } = body;

    if (!Array.isArray(dutyIds) || dutyIds.length === 0) {
      return NextResponse.json(
        { error: 'dutyIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // Create company duties
    const companyDuties = await prisma.$transaction(
      dutyIds.map((dutyId: string) =>
        prisma.companyDuty.upsert({
          where: {
            companyId_dutyId: {
              companyId: id,
              dutyId
            }
          },
          create: {
            companyId: id,
            dutyId
          },
          update: {}
        })
      )
    );

    return NextResponse.json({ success: true, count: companyDuties.length });
  } catch (error: any) {
    console.error('Error adding company duties:', error);
    return NextResponse.json(
      { error: 'Failed to add company duties', details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE /api/orgs/companies/[id]/duties - Remove a duty from a company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const dutyId = searchParams.get('dutyId');

    if (!dutyId) {
      return NextResponse.json(
        { error: 'dutyId is required' },
        { status: 400 }
      );
    }

    await prisma.companyDuty.delete({
      where: {
        companyId_dutyId: {
          companyId: id,
          dutyId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing company duty:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Company duty not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to remove company duty', details: error?.message },
      { status: 500 }
    );
  }
}
