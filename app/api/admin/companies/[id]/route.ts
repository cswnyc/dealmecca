import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

// Get single company with relationships
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
  
  const userRole = request.headers.get('x-user-role');
  if (!userRole || userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: companyId } = await params;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        parentCompany: {
          select: {
            id: true,
            name: true,
            companyType: true
          }
        },
        subsidiaries: {
          select: {
            id: true,
            name: true,
            companyType: true
          }
        },
        agencyPartnerships: {
          where: { isActive: true },
          include: {
            advertiser: {
              select: {
                id: true,
                name: true,
                companyType: true,
                logoUrl: true,
                city: true,
                state: true,
                verified: true
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        advertiserPartnerships: {
          where: { isActive: true },
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                companyType: true,
                logoUrl: true,
                city: true,
                state: true,
                verified: true
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            contacts: true,
            subsidiaries: true,
            agencyPartnerships: { where: { isActive: true } },
            advertiserPartnerships: { where: { isActive: true } }
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      company
    });

  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

// Update company
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
  
  const userRole = request.headers.get('x-user-role');
  if (!userRole || userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: companyId } = await params;
    const data = await request.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    if (!data.companyType) {
      return NextResponse.json({ error: 'Company type is required' }, { status: 400 });
    }

    // Check if parent company would create a circular reference
    if (data.parentCompanyId) {
      const wouldCreateCircle = await checkCircularReference(companyId, data.parentCompanyId);
      if (wouldCreateCircle) {
        return NextResponse.json({ 
          error: 'Invalid parent company: would create circular reference' 
        }, { status: 400 });
      }
    }

    // Generate new slug if name changed
    let slug = data.slug;
    if (!slug || slug === '') {
      slug = data.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Prepare update data
    const updateData = {
      name: data.name,
      slug,
      website: data.website || null,
      logoUrl: data.logoUrl || null,
      description: data.description || null,
      companyType: data.companyType,
      agencyType: data.agencyType || null,
      industry: data.industry || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      region: data.region || null,
      country: data.country || 'US',
      zipCode: data.zipCode || null,
      employeeCount: data.employeeCount || null,
      revenueRange: data.revenueRange || null,
      foundedYear: data.foundedYear || null,
      stockSymbol: data.stockSymbol || null,
      linkedinUrl: data.linkedinUrl || null,
      twitterHandle: data.twitterHandle || null,
      headquarters: data.headquarters || null,
      revenue: data.revenue || null,
      parentCompanyId: data.parentCompanyId || null,
      verified: Boolean(data.verified),
      dataQuality: data.dataQuality || 'BASIC',
      aiSummary: data.aiSummary || null,
      updatedAt: new Date()
    };

    // Update the company
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
      include: {
        parentCompany: {
          select: {
            id: true,
            name: true,
            companyType: true
          }
        },
        subsidiaries: {
          select: {
            id: true,
            name: true,
            companyType: true
          }
        },
        _count: {
          select: {
            contacts: true,
            subsidiaries: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Company updated successfully',
      company: updatedCompany
    });

  } catch (error) {
    console.error('Error updating company:', error);
    
    if (error instanceof Error) {
      // Handle unique constraint violations
      if (error.message.includes('unique constraint')) {
        if (error.message.includes('name')) {
          return NextResponse.json({ error: 'Company name already exists' }, { status: 400 });
        }
        if (error.message.includes('website')) {
          return NextResponse.json({ error: 'Website URL already exists' }, { status: 400 });
        }
        if (error.message.includes('slug')) {
          return NextResponse.json({ error: 'Company slug already exists' }, { status: 400 });
        }
      }
    }

    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}

// Delete company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
  
  const userRole = request.headers.get('x-user-role');
  if (!userRole || userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: companyId } = await params;

    // Check if company has contacts or subsidiaries
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            contacts: true,
            subsidiaries: true
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (company._count.contacts > 0) {
      return NextResponse.json({ 
        error: `Cannot delete company with ${company._count.contacts} associated contacts. Please reassign or delete contacts first.` 
      }, { status: 400 });
    }

    if (company._count.subsidiaries > 0) {
      return NextResponse.json({ 
        error: `Cannot delete company with ${company._count.subsidiaries} subsidiaries. Please reassign subsidiaries first.` 
      }, { status: 400 });
    }

    // Delete the company
    await prisma.company.delete({
      where: { id: companyId }
    });

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}

// Helper function to check for circular references
async function checkCircularReference(companyId: string, parentId: string): Promise<boolean> {
  // If trying to set self as parent
  if (companyId === parentId) {
    return true;
  }

  // Check if the proposed parent is already a descendant
  const checkDescendant = async (currentId: string): Promise<boolean> => {
    const children = await prisma.company.findMany({
      where: { parentCompanyId: currentId },
      select: { id: true }
    });

    for (const child of children) {
      if (child.id === parentId) {
        return true;
      }
      if (await checkDescendant(child.id)) {
        return true;
      }
    }
    return false;
  };

  return await checkDescendant(companyId);
}