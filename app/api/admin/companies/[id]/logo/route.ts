import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/server/requireAdmin';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
    if (!userId || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

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