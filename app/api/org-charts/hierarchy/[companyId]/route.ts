import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface OrgChartNode {
  id: string;
  name: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  department?: string;
  seniority?: string;
  level: number;
  children: OrgChartNode[];
  managerOf?: number;
  isExpanded?: boolean;
}

function mapSeniorityToLevel(seniority: string): number {
  const seniorityLevels: Record<string, number> = {
    'C_LEVEL': 0,
    'FOUNDER_OWNER': 0,
    'EVP': 1,
    'SVP': 2,
    'VP': 3,
    'SENIOR_DIRECTOR': 4,
    'DIRECTOR': 5,
    'SENIOR_MANAGER': 6,
    'MANAGER': 7,
    'SENIOR_SPECIALIST': 8,
    'SPECIALIST': 9,
    'COORDINATOR': 10,
    'INTERN': 11
  };
  
  return seniorityLevels[seniority] ?? 10;
}

function buildHierarchy(contacts: any[]): OrgChartNode[] {
  // Sort contacts by seniority level
  const sortedContacts = [...contacts].sort((a, b) => {
    const levelA = mapSeniorityToLevel(a.seniority);
    const levelB = mapSeniorityToLevel(b.seniority);
    
    if (levelA !== levelB) {
      return levelA - levelB;
    }
    
    // Secondary sort by department then name
    if (a.department !== b.department) {
      return (a.department || '').localeCompare(b.department || '');
    }
    
    return a.fullName.localeCompare(b.fullName);
  });

  const nodeMap = new Map<string, OrgChartNode>();
  const hierarchy: OrgChartNode[] = [];
  
  // Create nodes
  sortedContacts.forEach(contact => {
    const node: OrgChartNode = {
      id: contact.id,
      name: contact.fullName,
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
      linkedinUrl: contact.linkedinUrl,
      department: contact.department,
      seniority: contact.seniority,
      level: mapSeniorityToLevel(contact.seniority),
      children: [],
      managerOf: 0,
      isExpanded: mapSeniorityToLevel(contact.seniority) <= 2 // Auto-expand C-level, EVP, SVP
    };
    
    nodeMap.set(contact.id, node);
  });
  
  // Build hierarchy based on department and seniority
  const departmentGroups = new Map<string, OrgChartNode[]>();
  
  sortedContacts.forEach(contact => {
    const node = nodeMap.get(contact.id)!;
    const department = contact.department || 'General';
    
    if (!departmentGroups.has(department)) {
      departmentGroups.set(department, []);
    }
    
    departmentGroups.get(department)!.push(node);
  });
  
  // For each department, build a mini-hierarchy
  departmentGroups.forEach((departmentContacts, department) => {
    // Find the highest-ranking person in this department
    const departmentHead = departmentContacts[0];
    
    if (!departmentHead) return;
    
    // Adjust levels based on department structure
    departmentContacts.forEach((contact, index) => {
      contact.level = index;
      
      // Set up parent-child relationships within department
      if (index > 0) {
        // Find the most appropriate manager (someone with higher seniority in same dept)
        const potentialManagers = departmentContacts
          .slice(0, index)
          .filter(manager => mapSeniorityToLevel(manager.seniority!) < mapSeniorityToLevel(contact.seniority!));
        
        if (potentialManagers.length > 0) {
          // Add to the most recent manager's children
          const manager = potentialManagers[potentialManagers.length - 1];
          manager.children.push(contact);
          manager.managerOf = (manager.managerOf || 0) + 1;
          return;
        }
      }
      
      // If no manager found within department, add to root
      if (contact.level <= 2) { // Only add senior roles to root
        hierarchy.push(contact);
      }
    });
  });
  
  // If no hierarchy was built (small company), just use a flat structure with the most senior first
  if (hierarchy.length === 0 && sortedContacts.length > 0) {
    const ceo = sortedContacts[0];
    const ceoNode = nodeMap.get(ceo.id)!;
    ceoNode.level = 0;
    ceoNode.children = sortedContacts.slice(1).map(contact => {
      const node = nodeMap.get(contact.id)!;
      node.level = 1;
      return node;
    });
    ceoNode.managerOf = sortedContacts.length - 1;
    hierarchy.push(ceoNode);
  }
  
  return hierarchy;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params;
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Fetch company and contacts
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        contacts: {
          where: { isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fullName: true,
            title: true,
            email: true,
            phone: true,
            linkedinUrl: true,
            department: true,
            seniority: true,
          },
          orderBy: [
            { seniority: 'asc' },
            { department: 'asc' },
            { lastName: 'asc' },
          ]
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Build hierarchical structure
    const hierarchy = buildHierarchy(company.contacts);
    
    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        employeeCount: company.contacts.length
      },
      hierarchy,
      totalContacts: company.contacts.length
    });
    
  } catch (error) {
    console.error('Error fetching org chart hierarchy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch org chart hierarchy' },
      { status: 500 }
    );
  }
}