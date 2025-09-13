import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Get the main company
    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        verified: true,
        companyType: true,
        city: true,
        state: true
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get all partnerships where this company is involved
    const partnerships = await prisma.companyPartnership.findMany({
      where: {
        OR: [
          { agencyId: id },
          { advertiserId: id }
        ],
        isActive: true
      },
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
        },
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
    });

    // Build network data structure
    const nodes = [
      {
        id: company.id,
        name: company.name,
        logoUrl: company.logoUrl,
        verified: company.verified,
        companyType: company.companyType,
        city: company.city,
        state: company.state,
        isCenter: true,
        nodeType: 'company'
      }
    ];

    const edges = [];
    const partnerMap = new Map();

    partnerships.forEach(partnership => {
      const partner = partnership.agencyId === id ? partnership.advertiser : partnership.agency;
      const role = partnership.agencyId === id ? 'agency' : 'advertiser';

      if (!partnerMap.has(partner.id)) {
        partnerMap.set(partner.id, {
          ...partner,
          nodeType: 'partner',
          role,
          partnerships: []
        });
        
        nodes.push({
          id: partner.id,
          name: partner.name,
          logoUrl: partner.logoUrl,
          verified: partner.verified,
          companyType: partner.companyType,
          city: partner.city,
          state: partner.state,
          isCenter: false,
          nodeType: 'partner',
          role
        });
      }

      partnerMap.get(partner.id).partnerships.push(partnership);

      edges.push({
        id: partnership.id,
        source: company.id,
        target: partner.id,
        relationshipType: partnership.relationshipType,
        contractValue: partnership.contractValue,
        startDate: partnership.startDate,
        endDate: partnership.endDate,
        isActive: partnership.isActive,
        notes: partnership.notes,
        role,
        strength: calculateRelationshipStrength(partnership)
      });
    });

    // Calculate network statistics
    const stats = {
      totalPartners: partnerMap.size,
      activePartnerships: partnerships.filter(p => p.isActive).length,
      totalContractValue: partnerships.reduce((sum, p) => sum + (p.contractValue || 0), 0),
      relationshipTypes: Array.from(new Set(partnerships.map(p => p.relationshipType))),
      agencyPartners: partnerships.filter(p => p.advertiserId === id).length,
      advertiserPartners: partnerships.filter(p => p.agencyId === id).length
    };

    return NextResponse.json({
      network: {
        nodes,
        edges,
        stats
      },
      company,
      partnerships: Array.from(partnerMap.values())
    });

  } catch (error) {
    console.error('Partnership network error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partnership network' },
      { status: 500 }
    );
  }
}

function calculateRelationshipStrength(partnership: any): number {
  let strength = 0.5; // Base strength
  
  // Contract value influence (max 0.3 points)
  if (partnership.contractValue) {
    const valueScore = Math.min(partnership.contractValue / 1000000, 1); // Normalize to millions
    strength += valueScore * 0.3;
  }
  
  // Duration influence (max 0.2 points)
  if (partnership.startDate) {
    const startDate = new Date(partnership.startDate);
    const now = new Date();
    const monthsActive = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const durationScore = Math.min(monthsActive / 24, 1); // Normalize to 2 years
    strength += durationScore * 0.2;
  }
  
  // Active status bonus
  if (partnership.isActive) {
    strength += 0.1;
  }
  
  return Math.min(strength, 1); // Cap at 1.0
}