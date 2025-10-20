import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get('limit');
    const limitNum = limit ? parseInt(limit, 10) : undefined;

    // Fetch contacts from the company
    const contacts = await prisma.contact.findMany({
      where: {
        companyId: companyId,
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
        department: true,
        primaryRole: true,
        linkedinUrl: true
      },
      orderBy: [
        { verified: 'desc' }, // Verified contacts first
        { seniority: 'desc' }, // Higher seniority first
        { lastName: 'asc' }
      ],
      ...(limitNum && { take: limitNum })
    });

    return NextResponse.json({
      contacts,
      count: contacts.length
    });

  } catch (error: any) {
    console.error('[COMPANY CONTACTS API ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts', details: error?.message },
      { status: 500 }
    );
  }
}
