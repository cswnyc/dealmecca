import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const company = await prisma.company.create({
      data: {
        ...data,
        dataQuality: data.verified ? 'VERIFIED' : 'BASIC'
      }
    });

    return NextResponse.json({ company }, { status: 201 });

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