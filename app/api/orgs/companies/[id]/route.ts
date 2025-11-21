import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('[COMPANY API] Querying company with id:', id);

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        parentCompany: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true
          }
        },
        subsidiaries: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true,
            agencyType: true,
            city: true,
            state: true,
            country: true,
            verified: true,
            _count: {
              select: {
                contacts: {
                  where: {
                    isActive: true
                  }
                },
                subsidiaries: true
              }
            },
            Team: {
              where: {
                isActive: true,
                type: 'ADVERTISER_TEAM'
              },
              take: 100,
              select: {
                id: true,
                clientCompany: {
                  select: {
                    id: true,
                    name: true,
                    logoUrl: true,
                    verified: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            },
            CompanyDuty: {
              include: {
                duty: true
              }
            },
            subsidiaries: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                city: true,
                state: true,
                country: true,
                verified: true,
                _count: {
                  select: {
                    contacts: {
                      where: {
                        isActive: true
                      }
                    }
                  }
                },
                Team: {
                  where: {
                    isActive: true,
                    type: 'ADVERTISER_TEAM'
                  },
                  take: 100,
                  select: {
                    id: true,
                    clientCompany: {
                      select: {
                        id: true,
                        name: true,
                        logoUrl: true,
                        verified: true
                      }
                    }
                  },
                  orderBy: {
                    createdAt: 'desc'
                  }
                },
                CompanyDuty: {
                  include: {
                    duty: true
                  }
                }
              },
              orderBy: {
                name: 'asc'
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        },
        CompanyDuty: {
          include: {
            duty: true
          }
        },
        contacts: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            title: true,
            email: true,
            phone: true,
            verified: true,
            seniority: true,
            department: true,
            primaryRole: true,
            territories: true,
            accounts: true,
            updatedAt: true
          },
          orderBy: {
            lastName: 'asc'
          }
        },
        CompanyPartnership_agencyIdToCompany: {
          where: {
            isActive: true
          },
          include: {
            advertiser: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                companyType: true,
                industry: true,
                verified: true
              }
            },
            PartnershipContact: {
              include: {
                contact: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    fullName: true,
                    title: true,
                    email: true,
                    phone: true,
                    verified: true,
                    seniority: true,
                    department: true,
                    primaryRole: true,
                    updatedAt: true
                  }
                }
              },
              orderBy: {
                isPrimary: 'desc'
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        CompanyPartnership_advertiserIdToCompany: {
          where: {
            isActive: true
          },
          include: {
            agency: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                companyType: true,
                agencyType: true,
                verified: true
              }
            },
            PartnershipContact: {
              include: {
                contact: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    fullName: true,
                    title: true,
                    email: true,
                    phone: true,
                    verified: true,
                    seniority: true,
                    department: true,
                    primaryRole: true,
                    updatedAt: true
                  }
                }
              },
              orderBy: {
                isPrimary: 'desc'
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        },
        Team: {
          where: {
            isActive: true
          },
          include: {
            clientCompany: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                companyType: true,
                industry: true,
                verified: true
              }
            },
            ContactTeam: {
              include: {
                contact: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    fullName: true,
                    title: true,
                    email: true,
                    phone: true,
                    verified: true,
                    seniority: true,
                    department: true,
                    primaryRole: true,
                    updatedAt: true
                  }
                }
              },
              orderBy: {
                isPrimary: 'desc'
              }
            },
            _count: {
              select: {
                ContactTeam: true,
                PartnershipTeam: true,
                TeamDuty: true
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        },
        clientTeams: {
          where: {
            isActive: true
          },
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                companyType: true,
                agencyType: true,
                verified: true
              }
            },
            ContactTeam: {
              include: {
                contact: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    fullName: true,
                    title: true,
                    email: true,
                    phone: true,
                    verified: true,
                    seniority: true,
                    department: true,
                    primaryRole: true,
                    updatedAt: true
                  }
                }
              },
              orderBy: {
                isPrimary: 'desc'
              }
            },
            _count: {
              select: {
                ContactTeam: true,
                PartnershipTeam: true,
                TeamDuty: true
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        },
        _count: {
          select: {
            contacts: {
              where: {
                isActive: true
              }
            },
            User: true,
            subsidiaries: true,
            Team: {
              where: {
                isActive: true
              }
            },
            CompanyPartnership_agencyIdToCompany: {
              where: {
                isActive: true
              }
            },
            CompanyPartnership_advertiserIdToCompany: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    });

    console.log('[COMPANY API] Found company:', company ? company.name : 'null');

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Format partnerships for frontend
    // For each partnership, include the actual linked contacts from PartnershipContact
    const partnerships = [
      ...company.CompanyPartnership_agencyIdToCompany.map(p => ({
        id: p.id,
        relationshipType: p.relationshipType,
        isAOR: p.isAOR,
        services: p.services,
        startDate: p.startDate?.toISOString() || null,
        endDate: p.endDate?.toISOString() || null,
        isActive: p.isActive,
        contractValue: p.contractValue,
        notes: p.notes,
        partner: p.advertiser,
        partnerRole: 'advertiser' as const,
        agency: {
          id: company.id,
          name: company.name,
          logoUrl: company.logoUrl,
          companyType: company.companyType,
          verified: company.verified
        },
        advertiser: p.advertiser,
        contacts: p.PartnershipContact.map(pc => pc.contact),
        contactRoles: p.PartnershipContact.map(pc => ({
          contactId: pc.contactId,
          role: pc.role,
          responsibilities: pc.responsibilities,
          isPrimary: pc.isPrimary
        }))
      })),
      ...company.CompanyPartnership_advertiserIdToCompany.map(p => ({
        id: p.id,
        relationshipType: p.relationshipType,
        isAOR: p.isAOR,
        services: p.services,
        startDate: p.startDate?.toISOString() || null,
        endDate: p.endDate?.toISOString() || null,
        isActive: p.isActive,
        contractValue: p.contractValue,
        notes: p.notes,
        partner: p.agency,
        partnerRole: 'agency' as const,
        agency: p.agency,
        advertiser: {
          id: company.id,
          name: company.name,
          logoUrl: company.logoUrl,
          companyType: company.companyType,
          verified: company.verified
        },
        contacts: p.PartnershipContact.map(pc => pc.contact),
        contactRoles: p.PartnershipContact.map(pc => ({
          contactId: pc.contactId,
          role: pc.role,
          responsibilities: pc.responsibilities,
          isPrimary: pc.isPrimary
        }))
      }))
    ];

    // Calculate partnership counts
    const partnershipCount = company.CompanyPartnership_agencyIdToCompany.length +
                            company.CompanyPartnership_advertiserIdToCompany.length;

    // Format teams for frontend
    // Include both teams owned by this company AND teams where this company is the client
    const ownedTeams = company.Team.map(team => ({
      id: team.id,
      name: team.name,
      type: team.type,
      description: team.description,
      isActive: team.isActive,
      createdAt: team.createdAt?.toISOString() || null,
      updatedAt: team.updatedAt?.toISOString() || null,
      clientCompany: team.clientCompany,
      agencyCompany: null, // This company owns the team
      members: team.ContactTeam.map(ct => ({
        ...ct.contact,
        role: ct.role,
        isPrimary: ct.isPrimary
      })),
      _count: team._count
    }));

    // Teams where this company is the client (for advertisers viewing their agencies)
    const clientTeams = company.clientTeams.map(team => ({
      id: team.id,
      name: team.name,
      type: team.type,
      description: team.description,
      isActive: team.isActive,
      createdAt: team.createdAt?.toISOString() || null,
      updatedAt: team.updatedAt?.toISOString() || null,
      clientCompany: null, // This company is the client
      agencyCompany: team.company, // The agency that owns this team
      members: team.ContactTeam.map(ct => ({
        ...ct.contact,
        role: ct.role,
        isPrimary: ct.isPrimary
      })),
      _count: team._count
    }));

    // Combine both arrays
    const teams = [...ownedTeams, ...clientTeams];

    // Format response
    const formattedCompany = {
      ...company,
      partnerships,
      duties: company.CompanyDuty?.map(cd => cd.duty) || [],
      teams,
      _count: {
        ...company._count,
        partnerships: partnershipCount,
        teams: teams.length
      }
    };

    // Remove the raw partnership and team arrays
    delete (formattedCompany as any).CompanyPartnership_agencyIdToCompany;
    delete (formattedCompany as any).CompanyPartnership_advertiserIdToCompany;
    delete (formattedCompany as any).CompanyDuty;
    delete (formattedCompany as any).Team;
    delete (formattedCompany as any).clientTeams;

    return NextResponse.json(formattedCompany);

  } catch (error: any) {
    console.error('[COMPANY API ERROR] Full error:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch company',
        details: error?.message,
        code: error?.code
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const {
      name,
      logoUrl,
      website,
      description,
      companyType,
      agencyType,
      advertisingModel,
      industry,
      address,
      city,
      state,
      region,
      country,
      zipCode,
      linkedinUrl,
      twitterHandle,
      headquarters,
      employeeCount,
      revenueRange,
      revenue,
      foundedYear,
      stockSymbol,
      verified,
      parentCompanyId,
      duties
    } = body;

    // If parent company is being changed, verify it exists
    // Treat empty string as null (no parent company)
    const normalizedParentId = parentCompanyId === '' ? null : parentCompanyId;

    if (normalizedParentId !== undefined && normalizedParentId !== null && normalizedParentId !== existingCompany.parentCompanyId) {
      const parentCompany = await prisma.company.findUnique({
        where: { id: normalizedParentId }
      });

      if (!parentCompany) {
        return NextResponse.json(
          { error: 'Parent company not found' },
          { status: 400 }
        );
      }

      // Prevent circular hierarchy
      if (normalizedParentId === id) {
        return NextResponse.json(
          { error: 'Company cannot be its own parent' },
          { status: 400 }
        );
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl || null }),
        ...(website !== undefined && { website: website || null }),
        ...(description !== undefined && { description: description || null }),
        ...(companyType !== undefined && { companyType }),
        ...(agencyType !== undefined && { agencyType: agencyType || null }),
        ...(advertisingModel !== undefined && { advertisingModel: advertisingModel || null }),
        ...(industry !== undefined && { industry: industry || null }),
        ...(address !== undefined && { address: address || null }),
        ...(city !== undefined && { city: city || null }),
        ...(state !== undefined && { state: state || null }),
        ...(region !== undefined && { region: region || null }),
        ...(country !== undefined && { country: country || null }),
        ...(zipCode !== undefined && { zipCode: zipCode || null }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl || null }),
        ...(twitterHandle !== undefined && { twitterHandle: twitterHandle || null }),
        ...(headquarters !== undefined && { headquarters: headquarters || null }),
        ...(employeeCount !== undefined && { employeeCount: employeeCount || null }),
        ...(revenueRange !== undefined && { revenueRange: revenueRange || null }),
        ...(revenue !== undefined && { revenue: revenue || null }),
        ...(foundedYear !== undefined && { foundedYear: foundedYear || null }),
        ...(stockSymbol !== undefined && { stockSymbol: stockSymbol || null }),
        ...(verified !== undefined && { verified }),
        ...(parentCompanyId !== undefined && { parentCompanyId: normalizedParentId }),
        // Update verification timestamp if verified status changed
        ...(verified !== undefined && verified !== existingCompany.verified && {
          lastVerified: verified ? new Date() : null
        }),
        updatedAt: new Date()
      },
      include: {
        parentCompany: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            companyType: true
          }
        },
        _count: {
          select: {
            contacts: true,
            subsidiaries: true,
            CompanyPartnership_agencyIdToCompany: true,
            CompanyPartnership_advertiserIdToCompany: true
          }
        }
      }
    });

    // Handle duties update if provided
    if (duties !== undefined) {
      let dutyNames: string[] = [];
      if (typeof duties === 'string' && duties.trim()) {
        dutyNames = duties.split(',').map((d: string) => d.trim()).filter((d: string) => d);
      }

      if (dutyNames.length > 0) {
        const dutiesToAdd = await prisma.duty.findMany({
          where: { name: { in: dutyNames } },
          select: { id: true }
        });

        // Delete existing duties and add new ones
        await prisma.companyDuty.deleteMany({
          where: { companyId: id }
        });

        if (dutiesToAdd.length > 0) {
          await prisma.companyDuty.createMany({
            data: dutiesToAdd.map(duty => ({
              companyId: id,
              dutyId: duty.id
            }))
          });
        }
      } else {
        // If duties is empty string, remove all duties
        await prisma.companyDuty.deleteMany({
          where: { companyId: id }
        });
      }
    }

    return NextResponse.json(updatedCompany);

  } catch (error: any) {
    console.error('[COMPANY UPDATE ERROR] Full error:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    });
    return NextResponse.json(
      {
        error: 'Failed to update company',
        details: error?.message,
        code: error?.code
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            contacts: true,
            subsidiaries: true,
            CompanyPartnership_agencyIdToCompany: true,
            CompanyPartnership_advertiserIdToCompany: true,
            User: true
          }
        }
      }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if company has related data
    const hasRelatedData =
      existingCompany._count.contacts > 0 ||
      existingCompany._count.subsidiaries > 0 ||
      existingCompany._count.CompanyPartnership_agencyIdToCompany > 0 ||
      existingCompany._count.CompanyPartnership_advertiserIdToCompany > 0 ||
      existingCompany._count.User > 0;

    if (hasRelatedData) {
      return NextResponse.json(
        {
          error: 'Cannot delete company with existing relationships',
          message: 'This company has contacts, partnerships, subsidiaries, or users associated with it. Please remove these relationships first or mark the company as inactive.',
          counts: existingCompany._count
        },
        { status: 400 }
      );
    }

    // Safe to delete if no related data
    await prisma.company.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Company deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
