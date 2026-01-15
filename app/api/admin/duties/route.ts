import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/requireAdmin';

// GET /api/admin/duties - List all duties
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isGlobal = searchParams.get('isGlobal');

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (isGlobal !== null) {
      where.isGlobal = isGlobal === 'true';
    }

    const duties = await prisma.duty.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ],
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

    return NextResponse.json(duties);
  } catch (error: any) {
    console.error('Error fetching duties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch duties', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/duties - Create a new duty
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const body = await request.json();
    const { name, category, description, isGlobal } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    const duty = await prisma.duty.create({
      data: {
        name,
        category,
        description,
        isGlobal: isGlobal ?? true
      }
    });

    return NextResponse.json(duty, { status: 201 });
  } catch (error: any) {
    console.error('Error creating duty:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A duty with this name and category already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create duty', details: error?.message },
      { status: 500 }
    );
  }
}
