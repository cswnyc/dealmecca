import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'companies';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'latest_activity';
    const companyType = searchParams.get('companyType');
    const geography = searchParams.get('geography');
    const size = searchParams.get('size');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let entities = [];
    let total = 0;

    // Build where conditions
    const whereConditions: any = {};
    
    if (search) {
      whereConditions.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { state: { contains: search } }
      ];
    }

    if (companyType) {
      whereConditions.companyType = companyType;
    }

    if (geography) {
      // Map geography filters to actual locations
      if (geography === 'north-america') {
        whereConditions.OR = [
          { country: 'US' },
          { country: 'CA' },
          { country: 'MX' }
        ];
      }
    }

    // Build sort conditions
    let orderBy: any = { updatedAt: 'desc' }; // default to latest activity
    
    switch (sort) {
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'location':
        orderBy = { city: 'asc' };
        break;
      case 'size':
        orderBy = { employeeCount: 'desc' };
        break;
      case 'latest_activity':
      default:
        orderBy = { updatedAt: 'desc' };
        break;
    }

    if (type === 'companies' || type === 'agencies' || type === 'advertisers') {
      const companies = await prisma.company.findMany({
        where: whereConditions,
        include: {
          contacts: {
            take: 5,
            select: {
              id: true,
              fullName: true,
              title: true,
              department: true
            }
          },
          _count: {
            select: {
              contacts: true
            }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      });

      total = await prisma.company.count({
        where: whereConditions
      });

      entities = companies.map(company => ({
        id: company.id,
        name: company.name,
        type: determineCompanyType(company.companyType),
        logoUrl: company.logoUrl,
        location: `${company.city || ''}, ${company.state || ''}`.trim(),
        description: company.description,
        website: company.website,
        lastActivity: formatLastActivity(company.updatedAt),
        teamCount: company._count.contacts,
        verified: company.verified || false,
        relationships: {
          people: company.contacts.slice(0, 3).map(c => c.fullName)
        }
      }));
    }

    if (type === 'people') {
      const contacts = await prisma.contact.findMany({
        where: {
          ...whereConditions,
          OR: search ? [
            { fullName: { contains: search, mode: 'insensitive' } },
            { title: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ] : undefined
        },
        include: {
          company: {
            select: {
              name: true,
              logoUrl: true,
              city: true,
              state: true
            }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      });

      total = await prisma.contact.count({
        where: {
          ...whereConditions,
          OR: search ? [
            { fullName: { contains: search, mode: 'insensitive' } },
            { title: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ] : undefined
        }
      });

      entities = contacts.map(contact => ({
        id: contact.id,
        name: contact.fullName,
        type: 'person',
        avatarUrl: contact.avatarUrl,
        description: `${contact.title}${contact.company ? ` @ ${contact.company.name}` : ''}`,
        location: contact.company ? `${contact.company.city || ''}, ${contact.company.state || ''}`.trim() : undefined,
        lastActivity: formatLastActivity(contact.updatedAt),
        contactInfo: {
          title: contact.title,
          department: contact.department,
          email: contact.email,
          linkedin: contact.linkedinUrl
        },
        relationships: {
          advertisers: contact.company ? [contact.company.name] : []
        }
      }));
    }

    return NextResponse.json({
      entities,
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Org charts entities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    );
  }
}

function determineCompanyType(companyType?: string): 'agency' | 'advertiser' | 'company' {
  if (!companyType) return 'company';
  
  const type = companyType.toLowerCase();
  if (type.includes('agency') || type.includes('media') || type.includes('marketing')) {
    return 'agency';
  }
  if (type.includes('advertiser') || type.includes('brand') || type.includes('client')) {
    return 'advertiser';
  }
  
  return 'company';
}

function formatLastActivity(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours} hrs`;
  } else if (diffDays < 7) {
    return `${diffDays} days`;
  } else {
    return date.toLocaleDateString();
  }
}