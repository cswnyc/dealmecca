import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get user info from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow ADMIN role to access mention search for admin purposes
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ companies: [] });
    }

    // Search companies by name for mentions
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
            }
          },
          {
            name: {
              startsWith: query,
            }
          }
        ],
        verified: true // Only show verified companies in mentions
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        companyType: true,
        industry: true,
        verified: true,
        city: true,
        state: true
      },
      orderBy: [
        { verified: 'desc' }, // Verified companies first
        { name: 'asc' }
      ],
      take: 10 // Limit for autocomplete dropdown
    });

    // Format for mention autocomplete
    const mentionSuggestions = companies.map((company: any) => ({
      id: company.id,
      name: company.name,
      displayName: company.name,
      logo: company.logoUrl,
      type: company.companyType,
      industry: company.industry,
      location: company.city && company.state ? `${company.city}, ${company.state}` : null,
      verified: company.verified
    }));

    return NextResponse.json({ 
      companies: mentionSuggestions,
      total: companies.length 
    });
  } catch (error) {
    console.error('Failed to search companies for mentions:', error);
    return NextResponse.json(
      { error: 'Failed to search companies', companies: [] },
      { status: 500 }
    );
  }
} 