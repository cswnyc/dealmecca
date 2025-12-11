import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contactDuties = await prisma.contactDuty.findMany({
      where: { contactId: id },
      include: {
        duty: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true
          }
        }
      }
    });

    // Return just the duty objects
    const duties = contactDuties.map(cd => cd.duty);

    return NextResponse.json(duties);
  } catch (error) {
    console.error('Error fetching contact duties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact duties' },
      { status: 500 }
    );
  }
}
