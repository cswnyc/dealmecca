/**
 * Company Relationships API
 * Returns comprehensive relationship data for visualization
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface GraphNode {
  id: string;
  type: 'company' | 'contact';
  label: string;
  data: any;
  group?: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  data?: any;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeContacts = searchParams.get('includeContacts') !== 'false';
    const depth = parseInt(searchParams.get('depth') || '1');

    // Fetch company with all relationships
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        // Agency relationships (if advertiser)
        CompanyPartnership_advertiserIdToCompany: {
          where: { isActive: true },
          include: {
            agency: {
              include: {
                contacts: {
                  where: { isActive: true },
                  take: 5,
                  orderBy: [
                    { seniority: 'desc' },
                    { isDecisionMaker: 'desc' }
                  ]
                }
              }
            }
          },
          take: 20
        },
        // Client relationships (if agency)
        CompanyPartnership_agencyIdToCompany: {
          where: { isActive: true },
          include: {
            advertiser: {
              include: {
                contacts: {
                  where: { isActive: true },
                  take: 5,
                  orderBy: [
                    { seniority: 'desc' },
                    { isDecisionMaker: 'desc' }
                  ]
                }
              }
            }
          },
          take: 20
        },
        // Corporate hierarchy
        parentCompany: true,
        subsidiaries: {
          include: {
            contacts: {
              where: { isActive: true },
              take: 3
            }
          }
        },
        // Own contacts
        contacts: includeContacts ? {
          where: { isActive: true },
          orderBy: [
            { seniority: 'desc' },
            { isDecisionMaker: 'desc' }
          ],
          take: 10
        } : false
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Build graph data structure
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeIds = new Set<string>();

    // Add central company node
    nodes.push({
      id: company.id,
      type: 'company',
      label: company.name,
      data: {
        ...company,
        isCentral: true
      },
      group: 'central'
    });
    nodeIds.add(company.id);

    // Add parent company
    if (company.parentCompany) {
      nodes.push({
        id: company.parentCompany.id,
        type: 'company',
        label: company.parentCompany.name,
        data: company.parentCompany,
        group: 'parent'
      });
      nodeIds.add(company.parentCompany.id);

      edges.push({
        id: `${company.parentCompany.id}-${company.id}`,
        source: company.parentCompany.id,
        target: company.id,
        type: 'parent_child',
        label: 'Parent Company'
      });
    }

    // Add subsidiaries
    company.subsidiaries?.forEach((sub) => {
      nodes.push({
        id: sub.id,
        type: 'company',
        label: sub.name,
        data: sub,
        group: 'subsidiary'
      });
      nodeIds.add(sub.id);

      edges.push({
        id: `${company.id}-${sub.id}`,
        source: company.id,
        target: sub.id,
        type: 'parent_child',
        label: 'Subsidiary'
      });

      // Add subsidiary contacts
      if (includeContacts && sub.contacts) {
        sub.contacts.forEach((contact) => {
          const contactId = `contact-${contact.id}`;
          nodes.push({
            id: contactId,
            type: 'contact',
            label: contact.fullName,
            data: contact,
            group: 'contact'
          });
          nodeIds.add(contactId);

          edges.push({
            id: `${sub.id}-${contactId}`,
            source: sub.id,
            target: contactId,
            type: 'employee',
            label: contact.title
          });
        });
      }
    });

    // Add agency relationships (for advertisers)
    company.CompanyPartnership_advertiserIdToCompany?.forEach((partnership) => {
      const agency = partnership.agency;

      if (!nodeIds.has(agency.id)) {
        nodes.push({
          id: agency.id,
          type: 'company',
          label: agency.name,
          data: agency,
          group: 'agency'
        });
        nodeIds.add(agency.id);
      }

      edges.push({
        id: `${agency.id}-${company.id}`,
        source: agency.id,
        target: company.id,
        type: 'agency_client',
        label: partnership.isAOR ? 'AOR' : 'Agency',
        data: {
          services: partnership.services,
          isAOR: partnership.isAOR,
          relationshipType: partnership.relationshipType
        }
      });

      // Add key agency contacts
      if (includeContacts && agency.contacts) {
        agency.contacts.forEach((contact) => {
          const contactId = `contact-${contact.id}`;
          if (!nodeIds.has(contactId)) {
            nodes.push({
              id: contactId,
              type: 'contact',
              label: contact.fullName,
              data: contact,
              group: 'contact'
            });
            nodeIds.add(contactId);

            edges.push({
              id: `${agency.id}-${contactId}`,
              source: agency.id,
              target: contactId,
              type: 'employee',
              label: contact.title
            });
          }
        });
      }
    });

    // Add client relationships (for agencies)
    company.CompanyPartnership_agencyIdToCompany?.forEach((partnership) => {
      const client = partnership.advertiser;

      if (!nodeIds.has(client.id)) {
        nodes.push({
          id: client.id,
          type: 'company',
          label: client.name,
          data: client,
          group: 'client'
        });
        nodeIds.add(client.id);
      }

      edges.push({
        id: `${company.id}-${client.id}`,
        source: company.id,
        target: client.id,
        type: 'agency_client',
        label: partnership.isAOR ? 'AOR' : 'Client',
        data: {
          services: partnership.services,
          isAOR: partnership.isAOR,
          relationshipType: partnership.relationshipType
        }
      });

      // Add key client contacts
      if (includeContacts && client.contacts) {
        client.contacts.forEach((contact) => {
          const contactId = `contact-${contact.id}`;
          if (!nodeIds.has(contactId)) {
            nodes.push({
              id: contactId,
              type: 'contact',
              label: contact.fullName,
              data: contact,
              group: 'contact'
            });
            nodeIds.add(contactId);

            edges.push({
              id: `${client.id}-${contactId}`,
              source: client.id,
              target: contactId,
              type: 'employee',
              label: contact.title
            });
          }
        });
      }
    });

    // Add own contacts
    if (includeContacts && company.contacts) {
      company.contacts.forEach((contact) => {
        const contactId = `contact-${contact.id}`;
        if (!nodeIds.has(contactId)) {
          nodes.push({
            id: contactId,
            type: 'contact',
            label: contact.fullName,
            data: contact,
            group: 'contact'
          });
          nodeIds.add(contactId);

          edges.push({
            id: `${company.id}-${contactId}`,
            source: company.id,
            target: contactId,
            type: 'employee',
            label: contact.title
          });
        }
      });
    }

    // Build response
    const response = {
      company: {
        id: company.id,
        name: company.name,
        companyType: company.companyType,
        logoUrl: company.logoUrl
      },
      relationships: {
        agencies: company.CompanyPartnership_advertiserIdToCompany?.map(p => ({
          company: p.agency,
          partnership: {
            relationshipType: p.relationshipType,
            isAOR: p.isAOR,
            services: p.services,
            startDate: p.startDate,
            endDate: p.endDate
          },
          keyContacts: p.agency.contacts || []
        })) || [],
        clients: company.CompanyPartnership_agencyIdToCompany?.map(p => ({
          company: p.advertiser,
          partnership: {
            relationshipType: p.relationshipType,
            isAOR: p.isAOR,
            services: p.services,
            startDate: p.startDate,
            endDate: p.endDate
          },
          keyContacts: p.advertiser.contacts || []
        })) || [],
        parent: company.parentCompany || null,
        subsidiaries: company.subsidiaries || [],
        contacts: company.contacts || []
      },
      graph: {
        nodes,
        edges
      },
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        companies: nodes.filter(n => n.type === 'company').length,
        contacts: nodes.filter(n => n.type === 'contact').length
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching company relationships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company relationships', details: error.message },
      { status: 500 }
    );
  }
}
