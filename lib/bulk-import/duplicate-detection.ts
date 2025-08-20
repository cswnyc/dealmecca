import { PrismaClient, Company, Contact } from '@prisma/client'
import { normalizeCompanyName, normalizeWebsite, normalizeEmail } from '@/lib/normalization-utils'

const prisma = new PrismaClient()

// Enhanced company duplicate detection using normalized fields
export async function findCompanyDuplicates(companyData: {
  name: string;
  website?: string;
}): Promise<Company | null> {
  
  // Normalize inputs for efficient database lookup
  const normalizedName = normalizeCompanyName(companyData.name);
  const normalizedWebsite = companyData.website ? normalizeWebsite(companyData.website) : null;

  // Check for existing company using normalized fields (much faster with indexes)
  const existingCompany = await prisma.company.findFirst({
    where: {
      OR: [
        // Exact normalized name match (fastest lookup with unique index)
        ...(normalizedName ? [{
          normalizedName: normalizedName
        }] : []),
        
        // Exact normalized website match (fastest lookup with unique index)  
        ...(normalizedWebsite ? [{
          normalizedWebsite: normalizedWebsite
        }] : []),
        
        // Fallback to original name matching for legacy data without normalized fields
        { name: { equals: companyData.name, mode: 'insensitive' as const } },
        
        // Fallback to original website matching for legacy data
        ...(companyData.website ? [{
          website: { equals: companyData.website, mode: 'insensitive' as const }
        }] : [])
      ]
    }
  });

  return existingCompany;
}

// Enhanced contact duplicate detection using indexed fields
export async function findContactDuplicates(contactData: {
  firstName: string;
  lastName: string;
  email?: string;
  companyId: string;
}): Promise<Contact | null> {

  const checks = [];

  // 1. Email uniqueness (global) - uses email index for fast lookup
  if (contactData.email) {
    const normalizedEmail = normalizeEmail(contactData.email);
    checks.push({
      email: normalizedEmail
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
