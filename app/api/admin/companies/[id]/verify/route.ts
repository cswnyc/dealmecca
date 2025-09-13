import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
  
  if (!session || request.headers.get('x-user-role') !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();
    const { verified } = data;

    const company = await prisma.company.update({
      where: { id },
      data: {
        verified,
        dataQuality: verified ? 'VERIFIED' : 'BASIC',
        lastVerified: verified ? new Date() : null,
        verifiedBy: verified ? request.headers.get('x-user-id') : null
      }
    });

    return NextResponse.json({ company });

  } catch (error) {
    console.error('Company verification error:', error);
    return NextResponse.json(
      { error: 'Failed to update verification status' },
      { status: 500 }
    );
  }
} 