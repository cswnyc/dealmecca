import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse, createAuthError, createInternalError } from '@/lib/api-responses'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { Prisma } from '@prisma/client';

// GET /api/admin/contacts - Get all contacts (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return createAuthError()
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

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
        ],
        take: limit,
        skip: offset
      }),
      prisma.contact.count({ where })
    ]);

    return createSuccessResponse({
      contacts,
      totalCount,
      pagination: {
        limit,
        offset,
        hasMore: totalCount > (offset + limit)
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

    // Create the contact
    const contact = await prisma.contact.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.fullName,
        title: data.title,
        email: data.email || null,
        phone: data.phone || null,
        linkedinUrl: data.linkedinUrl || null,
        personalEmail: data.personalEmail || null,
        department: data.department || null,
        seniority: data.seniority,
        isDecisionMaker: data.isDecisionMaker || false,
        preferredContact: data.preferredContact || null,
        verified: data.verified || false,
        isActive: data.isActive !== false, // Default to true unless explicitly false
        companyId: data.companyId,
        lastVerified: data.verified ? new Date() : null
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

    return NextResponse.json({ contact }, { status: 201 });

  } catch (error: any) {
    console.error('Admin contact creation error:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A contact with this email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
} 