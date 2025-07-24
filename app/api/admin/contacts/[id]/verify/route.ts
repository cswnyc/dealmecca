import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
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