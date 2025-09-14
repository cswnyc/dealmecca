import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim()) {
      return NextResponse.json({
        companies: [],
        total: 0
      });
    }

    // Search for companies that match the query
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } },
          { companyType: { contains: query, mode: 'insensitive' } }
        ],
        // Only include active companies
        isActive: true
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        verified: true,
        companyType: true,
        industry: true,
        description: true,
        website: true,
        city: true,
        state: true,
        _count: {
          select: {
            employees: true
          }
        }
      },
      orderBy: [
        // Prioritize verified companies
        { verified: 'desc' },
        // Then by company size (employee count)
        { employees: { _count: 'desc' } },
        // Then alphabetically
        { name: 'asc' }
      ],
      take: limit
    });

    const total = await prisma.company.count({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } },
          { companyType: { contains: query, mode: 'insensitive' } }
        ],
        isActive: true
      }
    });

    // Format companies for mention suggestions
    const formattedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      logoUrl: company.logoUrl,
      verified: company.verified,
      companyType: company.companyType,
      industry: company.industry,
      description: company.description,
      website: company.website,
      location: company.city && company.state ? `${company.city}, ${company.state}` : null,
      employeeCount: company._count.employees,
      // Mention-specific formatting
      mentionText: company.name,
      displayText: company.name,
      metadata: {
        type: 'company',
        verified: company.verified,
        industry: company.industry,
        companyType: company.companyType
      }
    }));

    return NextResponse.json({
      companies: formattedCompanies,
      total,
      query: query.trim()
    });

  } catch (error) {
    console.error('Error fetching company mentions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company suggestions' },
      { status: 500 }
    );
  }
}
