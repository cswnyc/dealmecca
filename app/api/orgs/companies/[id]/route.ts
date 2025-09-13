import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Get user info from middleware headers
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const userTier = request.headers.get('x-user-tier');
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        contacts: {
          where: { isActive: true },
          orderBy: [
            { seniority: 'desc' },
            { lastName: 'asc' }
          ]
        },
        parentCompany: {
          select: {
            id: true,
            name: true,
            companyType: true,
            logoUrl: true
          }
        },
        subsidiaries: {
          select: {
            id: true,
            name: true,
            companyType: true,
            city: true,
            state: true,
            logoUrl: true,
            _count: {
              select: { contacts: true }
            }
          },
          orderBy: { name: 'asc' }
        },
        agencyPartnerships: {
          where: { isActive: true },
          include: {
            advertiser: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                verified: true,
                companyType: true,
                city: true,
                state: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        advertiserPartnerships: {
          where: { isActive: true },
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                verified: true,
                companyType: true,
                city: true,
                state: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            contacts: { where: { isActive: true } },
            subsidiaries: true,
            agencyPartnerships: { where: { isActive: true } },
            advertiserPartnerships: { where: { isActive: true } }
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Track profile view
    await prisma.search.create({
      data: {
        userId: userId,
        query: company.name,
        resultsCount: 1,
        searchType: 'company_profile'
      }
    });

    return NextResponse.json({ company });

  } catch (error) {
    console.error('Company profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
} 