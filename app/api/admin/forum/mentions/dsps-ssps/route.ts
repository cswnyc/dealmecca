import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow ADMIN role to access DSP/SSP tagging
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    if (query.length < 2) {
      return NextResponse.json({ dspsSsps: [] });
    }

    // Search companies with DSP_SSP type
    const companies = await prisma.company.findMany({
      where: {
        AND: [
          { type: 'DSP_SSP' },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        logo: true,
        description: true,
        verified: true
      },
      orderBy: [
        { verified: 'desc' },
        { name: 'asc' }
      ],
      take: 10
    });

    const formattedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      displayName: company.name,
      type: 'dsp-ssp',
      logo: company.logo,
      description: company.description,
      verified: company.verified
    }));

    return NextResponse.json({ dspsSsps: formattedCompanies });
  } catch (error) {
    console.error('Error searching DSP/SSP companies:', error);
    return NextResponse.json({ error: 'Failed to search DSP/SSP companies' }, { status: 500 });
  }
}