import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { findCompanyDuplicates } from '@/lib/bulk-import/duplicate-detection';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  // Remove pagination limits for admin - show all companies
  // const limit = parseInt(searchParams.get('limit') || '20');
  // const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const where = query
      ? {
          OR: [
            { name: { startsWith: query.toLowerCase() } },
            { name: { endsWith: query.toLowerCase() } },
            { city: { startsWith: query.toLowerCase() } },
            { city: { endsWith: query.toLowerCase() } },
            { state: { startsWith: query.toLowerCase() } },
            { state: { endsWith: query.toLowerCase() } }
          ]
        }
      : {};

    const [companies, totalCount] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: { contacts: true }
          }
        },
        orderBy: { name: 'asc' }
        // Remove pagination for admin - show all companies
        // take: limit,
        // skip: offset
      }),
      prisma.company.count({ where })
    ]);

    return NextResponse.json({
      companies,
      totalCount,
      pagination: {
        limit: totalCount, // Return all records
        offset: 0,
        hasMore: false // No more pages since we return all
      }
    });

  } catch (error) {
    console.error('Admin companies fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
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
    if (!data.name || !data.companyType) {
      return NextResponse.json(
        { error: 'Name and company type are required' },
        { status: 400 }
      );
    }

    // Check for duplicates using smart detection
    const existingCompany = await findCompanyDuplicates({
      name: data.name,
      website: data.website
    });

    if (existingCompany) {
      // Check if user wants to update existing company
      if (data.forceUpdate) {
        // Update existing company with new data
        const updateData: any = {
          updatedAt: new Date()
        };

        // Only update fields that have new/better data
        if (data.website && (!existingCompany.website || data.website !== existingCompany.website)) {
          updateData.website = data.website;
        }
        if (data.industry && data.industry !== existingCompany.industry) {
          updateData.industry = data.industry;
        }
        if (data.employeeCount && data.employeeCount !== existingCompany.employeeCount) {
          updateData.employeeCount = data.employeeCount;
        }
        if (data.revenue && data.revenue !== existingCompany.revenue) {
          updateData.revenue = data.revenue;
        }
        if (data.headquarters && data.headquarters !== existingCompany.headquarters) {
          updateData.headquarters = data.headquarters;
        }
        if (data.description && data.description !== existingCompany.description) {
          updateData.description = data.description;
        }
        if (data.companyType && data.companyType !== existingCompany.companyType) {
          updateData.companyType = data.companyType;
        }
        if (data.verified && !existingCompany.verified) {
          updateData.verified = true;
          updateData.dataQuality = 'VERIFIED';
        }

        // Only update if there are actual changes
        if (Object.keys(updateData).length > 1) { // More than just updatedAt
          const updatedCompany = await prisma.company.update({
            where: { id: existingCompany.id },
            data: updateData
          });
          
          return NextResponse.json({ 
            company: updatedCompany, 
            action: 'updated',
            message: 'Company updated with new information'
          }, { status: 200 });
        } else {
          return NextResponse.json({ 
            company: existingCompany, 
            action: 'no_changes',
            message: 'No new information to update'
          }, { status: 200 });
        }
      } else {
        // Return duplicate with options for user
        return NextResponse.json({
          error: 'duplicate_found',
          message: 'A similar company already exists',
          existingCompany: {
            id: existingCompany.id,
            name: existingCompany.name,
            website: existingCompany.website,
            industry: existingCompany.industry,
            companyType: existingCompany.companyType
          },
          suggestions: {
            update: 'Add forceUpdate: true to update the existing company',
            merge: 'Consider merging data with the existing company'
          }
        }, { status: 409 });
      }
    }

    // Create new company if no duplicates found
    const company = await prisma.company.create({
      data: {
        ...data,
        dataQuality: data.verified ? 'VERIFIED' : 'BASIC',
        slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      }
    });

    return NextResponse.json({ 
      company, 
      action: 'created',
      message: 'Company created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Admin company creation error:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'name') {
        return NextResponse.json(
          { error: 'A company with this name already exists' },
          { status: 409 }
        );
      } else if (field === 'website') {
        return NextResponse.json(
          { error: 'A company with this website already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'This company already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
} 