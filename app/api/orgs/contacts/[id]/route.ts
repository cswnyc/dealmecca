import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true,
            industry: true,
            city: true,
            state: true,
            website: true
          }
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Recent interactions
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Recent notes
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        status: true,
        _count: {
          select: {
            interactions: true,
            notes: true,
            connections: true
          }
        }
      }
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedContact = {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      fullName: contact.fullName,
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
      linkedinUrl: contact.linkedinUrl,
      logoUrl: contact.logoUrl,
      personalEmail: contact.personalEmail,
      department: contact.department,
      seniority: contact.seniority,
      primaryRole: contact.primaryRole,
      companyId: contact.companyId,
      territories: contact.territories,
      accounts: contact.accounts,
      budgetRange: contact.budgetRange,
      isDecisionMaker: contact.isDecisionMaker,
      verified: contact.verified,
      dataQuality: contact.dataQuality,
      lastVerified: contact.lastVerified?.toISOString(),
      isActive: contact.isActive,
      preferredContact: contact.preferredContact,
      communityScore: contact.communityScore,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
      company: contact.company,
      recentInteractions: contact.interactions,
      recentNotes: contact.notes,
      status: contact.status,
      _count: contact._count
    };

    return NextResponse.json(formattedContact);

  } catch (error) {
    console.error('Error fetching contact:', error);
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
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id }
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const {
      firstName,
      lastName,
      title,
      email,
      phone,
      linkedinUrl,
      personalEmail,
      department,
      seniority,
      primaryRole,
      companyId,
      territories,
      accounts,
      budgetRange,
      isDecisionMaker,
      verified,
      isActive,
      preferredContact
    } = body;

    // If names are being updated, generate new fullName
    let fullName = existingContact.fullName;
    if (firstName || lastName) {
      const newFirstName = firstName || existingContact.firstName;
      const newLastName = lastName || existingContact.lastName;
      fullName = `${newFirstName} ${newLastName}`;
    }

    // If company is being changed, verify it exists
    if (companyId && companyId !== existingContact.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      });

      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 400 }
        );
      }

      // Check for duplicate contact at new company
      if (firstName || lastName) {
        const newFirstName = firstName || existingContact.firstName;
        const newLastName = lastName || existingContact.lastName;

        const duplicateContact = await prisma.contact.findFirst({
          where: {
            firstName: newFirstName,
            lastName: newLastName,
            companyId,
            id: { not: id }
          }
        });

        if (duplicateContact) {
          return NextResponse.json(
            { error: 'Contact with this name already exists at this company' },
            { status: 400 }
          );
        }
      }
    }

    const updatedContact = await prisma.contact.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(fullName !== existingContact.fullName && { fullName }),
        ...(title !== undefined && { title }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(personalEmail !== undefined && { personalEmail }),
        ...(department !== undefined && { department }),
        ...(seniority !== undefined && { seniority }),
        ...(primaryRole !== undefined && { primaryRole }),
        ...(companyId !== undefined && { companyId }),
        ...(territories !== undefined && { territories }),
        ...(accounts !== undefined && { accounts }),
        ...(budgetRange !== undefined && { budgetRange }),
        ...(isDecisionMaker !== undefined && { isDecisionMaker }),
        ...(verified !== undefined && { verified }),
        ...(isActive !== undefined && { isActive }),
        ...(preferredContact !== undefined && { preferredContact }),
        // Update verification timestamp if verified status changed
        ...(verified !== undefined && verified !== existingContact.verified && {
          lastVerified: verified ? new Date() : null
        })
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true,
            industry: true
          }
        }
      }
    });

    return NextResponse.json(updatedContact);

  } catch (error) {
    console.error('Error updating contact:', error);
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
  try {
    const { id } = await params;

    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            interactions: true,
            notes: true,
            connections: true
          }
        }
      }
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Check if contact has related data
    const hasRelatedData = existingContact._count.interactions > 0 ||
                          existingContact._count.notes > 0 ||
                          existingContact._count.connections > 0;

    if (hasRelatedData) {
      // Instead of deleting, mark as inactive
      const updatedContact = await prisma.contact.update({
        where: { id },
        data: {
          isActive: false,
          email: null, // Clear sensitive data
          phone: null,
          personalEmail: null
        }
      });

      return NextResponse.json({
        message: 'Contact deactivated due to existing interactions/notes',
        contact: updatedContact
      });
    } else {
      // Safe to delete if no related data
      await prisma.contact.delete({
        where: { id }
      });

      return NextResponse.json({
        message: 'Contact deleted successfully'
      });
    }

  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}