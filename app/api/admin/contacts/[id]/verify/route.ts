import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
  
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  if (!userId || request.headers.get('x-user-role') !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();
    const { verified } = data;

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        verified,
        dataQuality: verified ? 'VERIFIED' : 'BASIC',
        lastVerified: verified ? new Date() : null
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            companyType: true
          }
        }
      }
    });

    return NextResponse.json({ contact });

  } catch (error) {
    console.error('Contact verification error:', error);
    return NextResponse.json(
      { error: 'Failed to update verification status' },
      { status: 500 }
    );
  }
} 