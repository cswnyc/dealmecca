import { NextRequest, NextResponse } from 'next/server';
// Removed getServerSession - using Firebase auth via middleware headers
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Session data now comes from middleware headers (x-user-id, x-user-email, x-user-role);
  
  if (!session || request.headers.get('x-user-role') !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const exclude = searchParams.get('exclude'); // Company ID to exclude
    const types = searchParams.get('types')?.split(',') || []; // Specific company types
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {
      AND: [
        // Exclude specific company if provided
        exclude ? { id: { not: exclude } } : {},
        
        // Filter by company types if provided
        types.length > 0 ? { companyType: { in: types } } : {},
        
        // Text search if provided
        query ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { state: { contains: query, mode: 'insensitive' } }
          ]
        } : {}
      ].filter(condition => Object.keys(condition).length > 0)
    };

    // If no conditions, remove the AND wrapper
    if (where.AND.length === 0) {
      delete where.AND;
    }

    const companies = await prisma.company.findMany({
      where,
      select: {
        id: true,
        name: true,
        companyType: true,
        city: true,
        state: true,
        logoUrl: true,
        verified: true,
        _count: {
          select: {
            contacts: true,
            subsidiaries: true
          }
        }
      },
      orderBy: [
        { verified: 'desc' }, // Verified companies first
        { name: 'asc' }
      ],
      take: limit
    });

    return NextResponse.json({
      success: true,
      companies,
      total: companies.length
    });

  } catch (error) {
    console.error('Error searching companies:', error);
    return NextResponse.json(
      { error: 'Failed to search companies' },
      { status: 500 }
    );
  }
}