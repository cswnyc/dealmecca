import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { logoUrl } = await request.json();

    // Validate contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id }
    });

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Update contact logo
    const updatedContact = await prisma.contact.update({
      where: { id },
      data: { 
        logoUrl: logoUrl || null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      contact: {
        id: updatedContact.id,
        fullName: updatedContact.fullName,
        logoUrl: updatedContact.logoUrl
      }
    });

  } catch (error) {
    console.error('Error updating contact logo:', error);
    return NextResponse.json({ 
      error: 'Failed to update contact logo' 
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
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Remove contact logo
    const updatedContact = await prisma.contact.update({
      where: { id },
      data: { 
        logoUrl: null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Contact logo removed successfully'
    });

  } catch (error) {
    console.error('Error removing contact logo:', error);
    return NextResponse.json({ 
      error: 'Failed to remove contact logo' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}