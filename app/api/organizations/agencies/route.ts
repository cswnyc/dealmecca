import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const location = searchParams.get('location') || '';

    // Build where clause - Include all agency-related types
    const where: any = {
      OR: [
        { companyType: 'AGENCY' },
        { companyType: 'INDEPENDENT_AGENCY' },
        { companyType: 'HOLDING_COMPANY_AGENCY' }, // Both top-level holding companies AND regional offices
        { companyType: 'MEDIA_HOLDING_COMPANY' } // Agency brands like WPP Media
      ]
    };

    // Add search filter if provided
    if (search) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    // Add type filter if provided
    if (type && type !== 'all') {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { companyType: type.toUpperCase() },
          { agencyType: type.toUpperCase() }
        ]
      });
    }

    // Add location filter if provided
    if (location && location !== 'all') {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { state: location },
          { city: { contains: location, mode: 'insensitive' } }
        ]
      });
    }

    // Fetch agencies from database
    const agencies = await prisma.company.findMany({
      where,
      select: {
        id: true,
        name: true,
        companyType: true,
        agencyType: true,
        parentCompanyId: true,
        city: true,
        state: true,
        country: true,
        verified: true,
        logoUrl: true,
        updatedAt: true,
        _count: {
          select: {
            contacts: {
              where: { isActive: true }
            },
            Team: {
              where: {
                isActive: true,
                type: 'ADVERTISER_TEAM'
              }
            }
          }
        },
        Team: {
          where: {
            isActive: true,
            type: 'ADVERTISER_TEAM'
          },
          select: {
            id: true,
            clientCompany: {
              select: {
                id: true,
                name: true,
                industry: true,
                logoUrl: true,
                verified: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: [
        { verified: 'desc' },
        { name: 'asc' }
      ]
    });

    // Transform to match expected format
    const transformedAgencies = agencies.map(agency => {
      // Determine agency type based on hierarchy:
      // - HOLDING_COMPANY_AGENCY without parent → Top-level holding company (WPP, Omnicom, etc.)
      // - MEDIA_HOLDING_COMPANY → Agency brand/network (WPP Media, GroupM, etc.)
      // - AGENCY with parent → Regional office (WPP Media NY)
      // - AGENCY/INDEPENDENT_AGENCY without parent → Independent agency

      let type: 'INDEPENDENT_AGENCY' | 'HOLDING_COMPANY_AGENCY' | 'MEDIA_HOLDING_COMPANY' | 'HOLDING_COMPANY' = 'INDEPENDENT_AGENCY';

      if (agency.companyType === 'HOLDING_COMPANY_AGENCY') {
        // If has NO parent company → Top-level holding company (WPP, Omnicom, etc.)
        // If has parent → Should not happen, but treat as holding company agency
        type = !agency.parentCompanyId ? 'HOLDING_COMPANY' : 'HOLDING_COMPANY_AGENCY';
      } else if (agency.companyType === 'MEDIA_HOLDING_COMPANY') {
        // Agency brands/networks (WPP Media, GroupM, Mindshare, etc.)
        type = 'MEDIA_HOLDING_COMPANY';
      } else if (agency.companyType === 'AGENCY') {
        // If it has a parent company, it's a regional office
        // Otherwise, treat as independent
        type = agency.parentCompanyId ? 'HOLDING_COMPANY_AGENCY' : 'INDEPENDENT_AGENCY';
      } else if (agency.companyType === 'INDEPENDENT_AGENCY' || agency.agencyType === 'INDEPENDENT') {
        type = 'INDEPENDENT_AGENCY';
      }

      // Calculate last activity (for now, use updatedAt)
      const lastActivityDate = new Date(agency.updatedAt);
      const now = new Date();
      const diffMs = now.getTime() - lastActivityDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      let lastActivity = '24+ hrs';
      if (diffHours < 1) {
        lastActivity = '< 1 hr';
      } else if (diffHours < 24) {
        lastActivity = `${diffHours} hr${diffHours > 1 ? 's' : ''}`;
      } else if (diffDays < 7) {
        lastActivity = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else {
        lastActivity = `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
      }

      // Dedupe client companies by ID
      const uniqueClients = new Map();
      agency.Team.forEach(team => {
        if (team.clientCompany && !uniqueClients.has(team.clientCompany.id)) {
          uniqueClients.set(team.clientCompany.id, team.clientCompany);
        }
      });

      const clientsArray = Array.from(uniqueClients.values());

      // Generate color deterministically for each client
      const generateColor = (str: string): string => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        const saturation = 65 + (Math.abs(hash) % 20);
        const lightness = 45 + (Math.abs(hash >> 8) % 15);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      };

      return {
        id: agency.id,
        name: agency.name,
        type,
        city: agency.city || '',
        state: agency.state || '',
        country: agency.country || 'US',
        verified: agency.verified,
        logoUrl: agency.logoUrl || undefined,
        teamCount: agency._count.contacts || 0,
        lastActivity,
        // Legacy field for backward compatibility
        clients: clientsArray.map(client => ({
          id: client.id,
          name: client.name,
          industry: client.industry || '',
          logoUrl: client.logoUrl || undefined,
          verified: client.verified
        })),
        // New relationship chips data - ALL teams for expansion
        clientTeams: clientsArray.map(client => ({
          id: client.id,
          name: client.name,
          logoUrl: client.logoUrl || undefined,
          color: generateColor(client.name)
        })),
        totalTeams: clientsArray.length
      };
    });

    return NextResponse.json({
      success: true,
      agencies: transformedAgencies,
      total: transformedAgencies.length
    });

  } catch (error) {
    console.error('Error fetching agencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agencies' },
      { status: 500 }
    );
  }
}
