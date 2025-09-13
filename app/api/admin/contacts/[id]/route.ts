import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

export async function GET(
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

    const contact = await prisma.contact.findUnique({
      where: { id },
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

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ contact });

  } catch (error) {
    console.error('Contact fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Validate required fields
    if (!data.firstName || !data.lastName) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }

    if (!data.title) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }

    if (!data.companyId) {
      return NextResponse.json({ error: 'Company association is required' }, { status: 400 });
    }

    if (!data.seniority) {
      return NextResponse.json({ error: 'Seniority level is required' }, { status: 400 });
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
      select: { id: true, name: true }
    });

    if (!company) {
      return NextResponse.json({ error: 'Invalid company selected' }, { status: 400 });
    }

    // Generate fullName
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;

    // Prepare update data
    const updateData = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      fullName,
      title: data.title.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      linkedinUrl: data.linkedinUrl?.trim() || null,
      logoUrl: data.logoUrl || null,
      personalEmail: data.personalEmail?.trim() || null,
      department: data.department || null,
      seniority: data.seniority,
      primaryRole: data.primaryRole || null,
      companyId: data.companyId,
      territories: data.territories?.trim() || null,
      accounts: data.accounts?.trim() || null,
      budgetRange: data.budgetRange || null,
      isDecisionMaker: Boolean(data.isDecisionMaker),
      verified: Boolean(data.verified),
      dataQuality: data.dataQuality || 'BASIC',
      isActive: data.isActive !== false, // Default to true
      preferredContact: data.preferredContact || null,
      lastVerified: data.verified !== undefined && data.verified ? new Date() : undefined,
      updatedAt: new Date()
    };

    const contact = await prisma.contact.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            companyType: true,
            city: true,
            state: true,
            logoUrl: true,
            verified: true
          }
        },
        _count: {
          select: {
            interactions: true,
            notes: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Contact updated successfully',
      contact
    });

  } catch (error) {
    console.error('Contact update error:', error);
    
    if (error instanceof Error) {
      // Handle unique constraint violations
      if (error.message.includes('unique constraint')) {
        if (error.message.includes('email')) {
          return NextResponse.json({ error: 'Email address already exists for another contact' }, { status: 400 });
        }
      }

      // Handle foreign key constraints
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json({ error: 'Invalid company association' }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

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

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...data,
        // Update lastVerified if we're changing verification status
        lastVerified: data.verified !== undefined && data.verified ? new Date() : undefined
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
    console.error('Contact update error:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.contact.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Contact deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
} 