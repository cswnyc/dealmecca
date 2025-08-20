import { PrismaClient, Company, Contact } from '@prisma/client'

const prisma = new PrismaClient()

// Enhanced company duplicate detection
export async function findCompanyDuplicates(companyData: {
  name: string;
  website?: string;
}): Promise<Company | null> {
  
  // Normalize company name for comparison
  const normalizedName = companyData.name
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize spaces
    .replace(/\b(inc|corp|ltd|llc|group|plc|corporation|company)\b/g, '') // Remove legal entities
    .trim();

  // Normalize website/domain
  const normalizedWebsite = companyData.website
    ?.toLowerCase()
    .replace(/^https?:\/\//, '') // Remove protocol
    .replace(/^www\./, '')       // Remove www
    .replace(/\/$/, '')          // Remove trailing slash
    .split('/')[0];              // Get just the domain

  // Check for existing company
  const existingCompany = await prisma.company.findFirst({
    where: {
      OR: [
        // Exact name match
        { name: { equals: companyData.name, mode: 'insensitive' as const } },
        
        // Normalized name match (if significantly different from original)
        ...(normalizedName !== companyData.name.toLowerCase() ? [{
          name: {
            contains: normalizedName,
            mode: 'insensitive' as const
          }
        }] : []),
        
        // Website match (if provided)
        ...(normalizedWebsite ? [{
          website: {
            contains: normalizedWebsite,
            mode: 'insensitive' as const
          }
        }] : []),
        
        // Check if our website matches their name (common for tech companies)
        ...(normalizedWebsite ? [{
          name: {
            contains: normalizedWebsite.split('.')[0],
            mode: 'insensitive' as const
          }
        }] : [])
      ]
    }
  });

  return existingCompany;
}

// Enhanced contact duplicate detection
export async function findContactDuplicates(contactData: {
  firstName: string;
  lastName: string;
  email?: string;
  companyId: string;
}): Promise<Contact | null> {

  const checks = [];

  // 1. Email uniqueness (global)
  if (contactData.email) {
    checks.push({
      email: {
        equals: contactData.email,
        mode: 'insensitive' as const
      }
    });
  }

  // 2. Name + Company uniqueness
  checks.push({
    AND: [
      { firstName: { equals: contactData.firstName, mode: 'insensitive' as const } },
      { lastName: { equals: contactData.lastName, mode: 'insensitive' as const } },
      { companyId: contactData.companyId }
    ]
  });

  // 3. Similar name variations
  const firstNameVariations = [
    contactData.firstName,
    contactData.firstName.substring(0, 3), // Mike vs Michael
  ];
  
  for (const variation of firstNameVariations) {
    checks.push({
      AND: [
        { firstName: { startsWith: variation, mode: 'insensitive' as const } },
        { lastName: { equals: contactData.lastName, mode: 'insensitive' as const } },
        { companyId: contactData.companyId }
      ]
    });
  }

  const existingContact = await prisma.contact.findFirst({
    where: { OR: checks },
    include: {
      company: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return existingContact;
}

export default {
  findCompanyDuplicates,
  findContactDuplicates
}
