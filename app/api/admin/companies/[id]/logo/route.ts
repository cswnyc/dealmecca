import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    if (!session?.user || request.headers.get('x-user-role') !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { logoUrl } = await request.json();

    // Validate company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Update company logo
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: { 
        logoUrl: logoUrl || null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        logoUrl: updatedCompany.logoUrl
      }
    });

  } catch (error) {
    console.error('Error updating company logo:', error);
    return NextResponse.json({ 
      error: 'Failed to update company logo' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
    if (!session?.user || request.headers.get('x-user-role') !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Remove company logo
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: { 
        logoUrl: null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Company logo removed successfully'
    });

  } catch (error) {
    console.error('Error removing company logo:', error);
    return NextResponse.json({ 
      error: 'Failed to remove company logo' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}