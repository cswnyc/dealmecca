import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createAuthError, createInternalError } from '@/lib/api-responses'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { Prisma } from '@prisma/client';
import { findContactDuplicates } from '@/lib/bulk-import/duplicate-detection';

// Enum mapping functions
function mapDepartmentValue(inputDepartment?: string): string | undefined {
  if (!inputDepartment) return undefined;
  
  const departmentMappings: Record<string, string> = {
    'media planning': 'MEDIA_PLANNING',
    'media buying': 'MEDIA_BUYING', 
    'digital marketing': 'DIGITAL_MARKETING',
    'programmatic': 'PROGRAMMATIC',
    'social media': 'SOCIAL_MEDIA',
    'search marketing': 'SEARCH_MARKETING',
    'strategy planning': 'STRATEGY_PLANNING',
    'strategy': 'STRATEGY_PLANNING',
    'analytics insights': 'ANALYTICS_INSIGHTS',
    'analytics': 'ANALYTICS_INSIGHTS',
    'creative services': 'CREATIVE_SERVICES',
    'creative': 'CREATIVE_SERVICES',
    'account management': 'ACCOUNT_MANAGEMENT',
    'account': 'ACCOUNT_MANAGEMENT',
    'business development': 'BUSINESS_DEVELOPMENT',
    'operations': 'OPERATIONS',
    'technology': 'TECHNOLOGY',
    'tech': 'TECHNOLOGY',
    'finance': 'FINANCE',
    'leadership': 'LEADERSHIP',
    'marketing': 'DIGITAL_MARKETING'
  };
  
  const normalized = inputDepartment.toLowerCase().trim();
  return departmentMappings[normalized] || undefined;
}

function mapSeniorityValue(inputSeniority?: string): string | undefined {
  if (!inputSeniority) return undefined;
  
  const seniorityMappings: Record<string, string> = {
    'intern': 'INTERN',
    'coordinator': 'COORDINATOR',
    'specialist': 'SPECIALIST',
    'senior specialist': 'SENIOR_SPECIALIST',
    'manager': 'MANAGER',
    'senior manager': 'SENIOR_MANAGER',
    'director': 'DIRECTOR',
    'senior director': 'SENIOR_DIRECTOR',
    'vp': 'VP',
    'vice president': 'VP',
    'svp': 'SVP',
    'evp': 'EVP',
    'c level': 'C_LEVEL',
    'c-level': 'C_LEVEL',
    'ceo': 'C_LEVEL',
    'cmo': 'C_LEVEL',
    'cfo': 'C_LEVEL',
    'founder owner': 'FOUNDER_OWNER',
    'founder': 'FOUNDER_OWNER',
    'owner': 'FOUNDER_OWNER',
    'unknown': 'SPECIALIST' // Default fallback
  };
  
  const normalized = inputSeniority.toLowerCase().trim();
  return seniorityMappings[normalized] || 'SPECIALIST'; // Always provide a fallback
}

// GET /api/admin/contacts - Get all contacts (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return createAuthError()
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    // Remove pagination limits for admin - show all contacts
    // const limit = parseInt(searchParams.get('limit') || '20')
    // const offset = parseInt(searchParams.get('offset') || '0')

    const where = query
      ? {
          OR: [
            { fullName: { contains: query, mode: 'insensitive' as const } },
            { firstName: { contains: query, mode: 'insensitive' as const } },
            { lastName: { contains: query, mode: 'insensitive' as const } },
            { title: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } },
            { 
              company: {
                name: { contains: query, mode: 'insensitive' as const }
              }
            }
          ]
        }
      : {}

    const [contacts, totalCount] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              companyType: true
            }
          }
        },
        orderBy: [
          { verified: 'desc' },
          { isActive: 'desc' },
          { fullName: 'asc' }
        ]
        // Remove pagination for admin - show all contacts
        // take: limit,
        // skip: offset
      }),
      prisma.contact.count({ where })
    ]);

    return createSuccessResponse({
      contacts,
      totalCount,
      pagination: {
        limit: totalCount, // Return all records
        offset: 0,
        hasMore: false // No more pages since we return all
      }
    });

  } catch (error) {
    console.error('Admin contacts fetch error:', error);
    return createInternalError({
      message: 'Failed to fetch contacts'
    });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.title || !data.companyId || !data.seniority) {
      return NextResponse.json(
        { error: 'First name, last name, title, company, and seniority level are required' },
        { status: 400 }
      );
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: data.companyId }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 400 }
      );
    }

    // Check for duplicates using smart detection
    const existingContact = await findContactDuplicates({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      companyId: data.companyId
    });

    if (existingContact) {
      // Check if user wants to update existing contact
      if (data.forceUpdate) {
        // Update existing contact with new data
        const updateData: any = {
          updatedAt: new Date()
        };

        // Only update fields that have new/better data
        if (data.email && (!existingContact.email || data.email !== existingContact.email)) {
          updateData.email = data.email;
        }
        if (data.phone && (!existingContact.phone || data.phone !== existingContact.phone)) {
          updateData.phone = data.phone;
        }
        if (data.title && data.title !== existingContact.title) {
          updateData.title = data.title;
        }
        if (data.department && mapDepartmentValue(data.department) !== existingContact.department) {
          updateData.department = mapDepartmentValue(data.department) as any;
        }
        if (data.seniority && mapSeniorityValue(data.seniority) !== existingContact.seniority) {
          updateData.seniority = mapSeniorityValue(data.seniority) as any;
        }
        if (data.linkedinUrl && (!existingContact.linkedinUrl || data.linkedinUrl !== existingContact.linkedinUrl)) {
          updateData.linkedinUrl = data.linkedinUrl;
        }
        if (data.personalEmail && (!existingContact.personalEmail || data.personalEmail !== existingContact.personalEmail)) {
          updateData.personalEmail = data.personalEmail;
        }
        if (data.preferredContact && data.preferredContact !== existingContact.preferredContact) {
          updateData.preferredContact = data.preferredContact;
        }
        if (typeof data.isDecisionMaker === 'boolean' && data.isDecisionMaker !== existingContact.isDecisionMaker) {
          updateData.isDecisionMaker = data.isDecisionMaker;
        }
        if (data.verified && !existingContact.verified) {
          updateData.verified = true;
          updateData.lastVerified = new Date();
          updateData.dataQuality = 'VERIFIED';
        }

        // Only update if there are actual changes
        if (Object.keys(updateData).length > 1) { // More than just updatedAt
          const updatedContact = await prisma.contact.update({
            where: { id: existingContact.id },
            data: updateData,
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
          
          return NextResponse.json({ 
            contact: updatedContact, 
            action: 'updated',
            message: 'Contact updated with new information'
          }, { status: 200 });
        } else {
          return NextResponse.json({ 
            contact: existingContact, 
            action: 'no_changes',
            message: 'No new information to update'
          }, { status: 200 });
        }
      } else {
        // Return duplicate with options for user
        return NextResponse.json({
          error: 'duplicate_found',
          message: 'A similar contact already exists',
          existingContact: {
            id: existingContact.id,
            firstName: existingContact.firstName,
            lastName: existingContact.lastName,
            email: existingContact.email,
            title: existingContact.title,
            companyId: existingContact.companyId
          },
          suggestions: {
            update: 'Add forceUpdate: true to update the existing contact',
            merge: 'Consider merging data with the existing contact'
          }
        }, { status: 409 });
      }
    }

    // Create the contact with enum mapping
    const contact = await prisma.contact.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.fullName || `${data.firstName} ${data.lastName}`,
        title: data.title,
        email: data.email || null,
        phone: data.phone || null,
        linkedinUrl: data.linkedinUrl || null,
        personalEmail: data.personalEmail || null,
        department: mapDepartmentValue(data.department) as any,
        seniority: (mapSeniorityValue(data.seniority) || 'SPECIALIST') as any, // Always provide a valid fallback
        isDecisionMaker: data.isDecisionMaker || false,
        preferredContact: data.preferredContact || null,
        verified: data.verified || false,
        isActive: data.isActive !== false, // Default to true unless explicitly false
        companyId: data.companyId,
        lastVerified: data.verified ? new Date() : null,
        dataQuality: 'BASIC' // Set default data quality
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

    return NextResponse.json({ 
      contact, 
      action: 'created',
      message: 'Contact created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Admin contact creation error:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('email')) {
        return NextResponse.json(
          { error: 'A contact with this email already exists' },
          { status: 409 }
        );
      } else if (target?.includes('firstName') && target?.includes('lastName') && target?.includes('companyId')) {
        return NextResponse.json(
          { error: 'A contact with this name already exists at this company' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'This contact already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
} 