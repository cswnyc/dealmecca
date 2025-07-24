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
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

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
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset
      }),
      prisma.company.count({ where })
    ]);

    return NextResponse.json({
      companies,
      totalCount,
      pagination: {
        limit,
        offset,
        hasMore: totalCount > (offset + limit)
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

  } catch (error) {
    console.error('Admin company creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
} 