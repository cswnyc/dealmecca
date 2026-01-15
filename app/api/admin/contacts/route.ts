import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/requireAdmin';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const companyId = searchParams.get('companyId');
    const department = searchParams.get('department');
    const seniority = searchParams.get('seniority');
    const primaryRole = searchParams.get('primaryRole');
    const verified = searchParams.get('verified');
    const isActive = searchParams.get('isActive');
    const dataQuality = searchParams.get('dataQuality');
    const hasInteractions = searchParams.get('hasInteractions');
    const sortBy = searchParams.get('sortBy') || 'fullName';

    const skip = (page - 1) * limit;

    // Build where clause with admin-specific filters
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (department) {
      where.department = department;
    }

    if (seniority) {
      where.seniority = seniority;
    }

    if (primaryRole) {
      where.primaryRole = primaryRole;
    }

    if (verified !== null && verified !== undefined) {
      where.verified = verified === 'true';
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (dataQuality) {
      where.dataQuality = dataQuality;
    }

    if (hasInteractions === 'true') {
      where.ContactInteraction = {
        some: {}
      };
    } else if (hasInteractions === 'false') {
      where.ContactInteraction = {
        none: {}
      };
    }

    // Admin-specific sorting options
    let orderBy: any = { fullName: 'asc' };

    switch (sortBy) {
      case 'firstName':
        orderBy = { firstName: 'asc' };
        break;
      case 'lastName':
        orderBy = { lastName: 'asc' };
        break;
      case 'fullName':
        orderBy = { fullName: 'asc' };
        break;
      case 'title':
        orderBy = { title: 'asc' };
        break;
      case 'company':
        orderBy = { company: { name: 'asc' } };
        break;
      case 'created':
        orderBy = { createdAt: 'desc' };
        break;
      case 'updated':
        orderBy = { updatedAt: 'desc' };
        break;
      case 'verified':
        orderBy = { verified: 'desc' };
        break;
      case 'lastVerified':
        orderBy = { lastVerified: 'desc' };
        break;
      case 'department':
        orderBy = { department: 'asc' };
        break;
      case 'seniority':
        orderBy = { seniority: 'asc' };
        break;
      case 'dataQuality':
        orderBy = { dataQuality: 'desc' };
        break;
      case 'communityScore':
        orderBy = { communityScore: 'desc' };
        break;
      default:
        orderBy = { fullName: 'asc' };
    }

    // Get contacts with admin-level details
    const contacts = await prisma.contact.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true,
            industry: true,
            city: true,
            state: true,
            verified: true
          }
        },
        ContactStatus: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            ContactInteraction: true,
            ContactNote: true,
            UserConnection: true,
            ViewedContact: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });

    // Get total count for pagination
    const total = await prisma.contact.count({ where });
    const pages = Math.ceil(total / limit);

    // Get admin statistics (not affected by pagination)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const adminStats = await prisma.contact.aggregate({
      where,
      _count: {
        id: true
      },
      _avg: {
        communityScore: true
      }
    });

    // Get verification stats
    const verificationStats = await prisma.contact.groupBy({
      by: ['verified'],
      where,
      _count: {
        id: true
      }
    });

    // Get data quality stats
    const qualityStats = await prisma.contact.groupBy({
      by: ['dataQuality'],
      where,
      _count: {
        id: true
      }
    });

    // Get department distribution
    const departmentStats = await prisma.contact.groupBy({
      by: ['department'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Get unique companies count
    const uniqueCompaniesResult = await prisma.contact.findMany({
      where,
      select: {
        companyId: true
      },
      distinct: ['companyId']
    });
    const uniqueCompaniesCount = uniqueCompaniesResult.length;

    // Get contacts created this month
    const contactsThisMonth = await prisma.contact.count({
      where: {
        ...where,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    // Transform data with admin-specific information
    const formattedContacts = contacts.map(contact => ({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      fullName: contact.fullName,
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
      linkedinUrl: contact.linkedinUrl,
      logoUrl: contact.logoUrl,
      personalEmail: contact.personalEmail,
      department: contact.department,
      seniority: contact.seniority,
      primaryRole: contact.primaryRole,
      companyId: contact.companyId,
      territories: contact.territories,
      accounts: contact.accounts,
      budgetRange: contact.budgetRange,
      isDecisionMaker: contact.isDecisionMaker,
      verified: contact.verified,
      dataQuality: contact.dataQuality,
      lastVerified: contact.lastVerified?.toISOString(),
      isActive: contact.isActive,
      preferredContact: contact.preferredContact,
      communityScore: contact.communityScore,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
      company: contact.company,
      status: contact.ContactStatus,
      _count: contact._count,
      // Admin-specific metrics
      engagementScore: contact._count.ContactInteraction * 2 + contact._count.ContactNote,
      popularityScore: contact._count.ViewedContact,
      completenessScore: [
        contact.email ? 1 : 0,
        contact.phone ? 1 : 0,
        contact.linkedinUrl ? 1 : 0,
        contact.department ? 1 : 0,
        contact.title ? 1 : 0
      ].reduce((a, b) => a + b, 0) * 20 // 0-100 scale
    }));

    return NextResponse.json({
      contacts: formattedContacts,
      pagination: {
        page,
        limit,
        total,
        pages
      },
      adminStats: {
        totalContacts: adminStats._count.id,
        averageCommunityScore: adminStats._avg.communityScore,
        uniqueCompaniesCount,
        contactsThisMonth,
        verificationStats: verificationStats.reduce((acc, stat) => {
          acc[stat.verified ? 'verified' : 'unverified'] = stat._count.id;
          return acc;
        }, {} as Record<string, number>),
        qualityStats: qualityStats.reduce((acc, stat) => {
          acc[stat.dataQuality] = stat._count.id;
          return acc;
        }, {} as Record<string, number>),
        departmentStats: departmentStats.map(stat => ({
          department: stat.department || 'Unknown',
          count: stat._count.id
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching admin contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const body = await request.json();

    // Handle bulk operations
    if (body.operation === 'bulk') {
      const { action, contactIds, data } = body;

      switch (action) {
        case 'verify':
          await prisma.contact.updateMany({
            where: {
              id: {
                in: contactIds
              }
            },
            data: {
              verified: true,
              lastVerified: new Date()
            }
          });

          return NextResponse.json({
            message: `${contactIds.length} contacts verified successfully`
          });

        case 'unverify':
          await prisma.contact.updateMany({
            where: {
              id: {
                in: contactIds
              }
            },
            data: {
              verified: false,
              lastVerified: null
            }
          });

          return NextResponse.json({
            message: `${contactIds.length} contacts unverified successfully`
          });

        case 'deactivate':
          await prisma.contact.updateMany({
            where: {
              id: {
                in: contactIds
              }
            },
            data: {
              isActive: false
            }
          });

          return NextResponse.json({
            message: `${contactIds.length} contacts deactivated successfully`
          });

        case 'activate':
          await prisma.contact.updateMany({
            where: {
              id: {
                in: contactIds
              }
            },
            data: {
              isActive: true
            }
          });

          return NextResponse.json({
            message: `${contactIds.length} contacts activated successfully`
          });

        case 'update':
          await prisma.contact.updateMany({
            where: {
              id: {
                in: contactIds
              }
            },
            data
          });

          return NextResponse.json({
            message: `${contactIds.length} contacts updated successfully`
          });

        default:
          return NextResponse.json(
            { error: 'Invalid bulk action' },
            { status: 400 }
          );
      }
    }

    // Regular single contact creation (delegate to main API)
    const response = await fetch(`${request.nextUrl.origin}/api/orgs/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error in admin contacts POST:', error);
    return NextResponse.json(
      { error: 'Failed to process admin contact operation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({
    error: 'Use the specific contact ID endpoint for updates: /api/admin/contacts/[id]',
    message: 'This endpoint handles listing and bulk operations only'
  }, { status: 405 })
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactIds } = body;

    if (!contactIds || !Array.isArray(contactIds)) {
      return NextResponse.json(
        { error: 'Contact IDs array is required' },
        { status: 400 }
      );
    }

    // Bulk deactivation instead of deletion for admin safety
    await prisma.contact.updateMany({
      where: {
        id: {
          in: contactIds
        }
      },
      data: {
        isActive: false,
        email: null,
        phone: null,
        personalEmail: null
      }
    });

    return NextResponse.json({
      message: `${contactIds.length} contacts deactivated successfully`
    });

  } catch (error) {
    console.error('Error in admin contacts DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate contacts' },
      { status: 500 }
    );
  }
}