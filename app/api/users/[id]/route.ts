import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user info from middleware headers
    const requestingUserId = request.headers.get('x-user-id');
    
    if (!requestingUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get user profile with counts and related data
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            eventAttendees: true,
            posts: true,
            comments: true,
            searches: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Try to find associated contact and company information
    let contact = null;
    let company = null;
    
    try {
      // Look for a contact record that might be associated with this user
      // This is based on email matching or manual association
      const userContact = await prisma.contact.findFirst({
        where: {
          OR: [
            { email: user.email },
            // Add other matching criteria as needed
          ]
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              companyType: true,
              industry: true,
              logoUrl: true
            }
          }
        }
      });

      if (userContact) {
        contact = {
          id: userContact.id,
          fullName: userContact.fullName,
          title: userContact.title,
          department: userContact.department,
          seniority: userContact.seniority
        };
        
        if (userContact.company) {
          company = userContact.company;
        }
      }
    } catch (error) {
      console.log('No contact found for user:', error);
      // This is okay, not all users will have contact records
    }

    // Only show email to the user themselves or admins
    const canViewEmail = requestingUserId === id || request.headers.get('x-user-role') === 'ADMIN';

    return NextResponse.json({
      ...user,
      email: canViewEmail ? user.email : undefined,
      contact,
      company
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
} 