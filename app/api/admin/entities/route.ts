import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated (all authenticated users can submit)
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      type,
      description,
      website,
      email,
      phone,
      location,
      logoUrl,
      companyType,
      industry,
      parentCompany,
      tags,
      verified,
      title,
      department,
      linkedin
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    let createdEntity;

    if (type === 'person') {
      // Create a contact/person
      createdEntity = await prisma.contact.create({
        data: {
          fullName: name,
          firstName: name.split(' ')[0] || '',
          lastName: name.split(' ').slice(1).join(' ') || '',
          title: title || '',
          email: email || null,
          phone: phone || null,
          linkedinUrl: linkedin || null,
          department: department || null,
          avatarUrl: logoUrl || null,
          // Note: In a real app, you'd need to link this to a company
        }
      });
    } else if (['industry', 'publisher', 'dsp-ssp', 'adtech'].includes(type)) {
      // For new entity types, create as companies with appropriate companyType
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      let mappedCompanyType;
      switch (type) {
        case 'industry':
          mappedCompanyType = 'INDUSTRY';
          break;
        case 'publisher':
          mappedCompanyType = 'PUBLISHER';
          break;
        case 'dsp-ssp':
          mappedCompanyType = 'DSP_SSP';
          break;
        case 'adtech':
          mappedCompanyType = 'ADTECH';
          break;
        default:
          mappedCompanyType = 'OTHER';
      }

      createdEntity = await prisma.company.create({
        data: {
          name,
          slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
          description: description || null,
          website: website || null,
          city: location?.split(',')[0]?.trim() || null,
          state: location?.split(',')[1]?.trim() || null,
          companyType: mappedCompanyType,
          industry: industry || 'ADVERTISING',
          logoUrl: logoUrl || null,
          verified: verified || false,
        }
      });
    } else {
      // Create a company (agency or advertiser)
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      createdEntity = await prisma.company.create({
        data: {
          name,
          slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
          description: description || null,
          website: website || null,
          city: location?.split(',')[0]?.trim() || null,
          state: location?.split(',')[1]?.trim() || null,
          companyType: companyType || 'INDEPENDENT_AGENCY',
          agencyType: type === 'agency' ? 'MEDIA_AGENCY' : null,
          industry: industry || 'ADVERTISING',
          logoUrl: logoUrl || null,
          verified: verified || false,
          // Note: parentCompany would need proper relationship handling
        }
      });
    }

    return NextResponse.json({
      id: createdEntity.id,
      name: createdEntity.fullName || createdEntity.name,
      type,
      message: `${type} created successfully`
    });

  } catch (error) {
    console.error('Admin entity creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create entity' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin privileges
    const session = await getServerSession();
    
    if (!session?.user || !['ADMIN', 'TEAM'].includes((session.user as any).role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let entities = [];

    if (type === 'people') {
      const contacts = await prisma.contact.findMany({
        select: {
          id: true,
          fullName: true,
          title: true,
          email: true,
          department: true,
          createdAt: true,
          company: {
            select: {
              name: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      });

      entities = contacts.map(contact => ({
        id: contact.id,
        name: contact.fullName,
        type: 'person',
        description: `${contact.title}${contact.company ? ` @ ${contact.company.name}` : ''}`,
        email: contact.email,
        department: contact.department,
        createdAt: contact.createdAt
      }));
    } else {
      const companies = await prisma.company.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          companyType: true,
          agencyType: true,
          website: true,
          city: true,
          state: true,
          verified: true,
          createdAt: true,
          _count: {
            select: {
              contacts: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      });

      entities = companies.map(company => ({
        id: company.id,
        name: company.name,
        type: company.companyType === 'ADVERTISER' ? 'advertiser' : 'agency',
        description: company.description,
        location: `${company.city || ''}, ${company.state || ''}`.trim(),
        website: company.website,
        verified: company.verified,
        teamCount: company._count.contacts,
        createdAt: company.createdAt
      }));
    }

    return NextResponse.json({
      entities,
      total: entities.length
    });

  } catch (error) {
    console.error('Admin entity fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    );
  }
}