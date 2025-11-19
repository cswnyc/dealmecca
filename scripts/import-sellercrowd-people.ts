import { PrismaClient, SeniorityLevel } from '@prisma/client';
import { nanoid } from 'nanoid';
import fs from 'fs';

/**
 * Import SellerCrowd People Data
 *
 * Takes cleaned SellerCrowd people data and imports as contacts
 * Links contacts to companies (agencies)
 *
 * USAGE:
 * npx tsx scripts/import-sellercrowd-people.ts /Users/csw/Downloads/sellercrowd-people-1762475167205-cleaned.json
 */

const prisma = new PrismaClient();

interface CleanPerson {
  name: string;
  title: string | null;
  company: string | null;
  location: string | null;
  advertiser: string | null;
  handles: string[];
  emails: string[];
  linkedinUrl: string | null;
  lastActivity: string | null;
}

interface ImportStats {
  total: number;
  contactsCreated: number;
  contactsSkipped: number;
  contactsUpdated: number;
  companiesNotFound: string[];
}

function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

function inferSeniority(title: string | null): SeniorityLevel {
  if (!title) return SeniorityLevel.SPECIALIST;

  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('intern')) return SeniorityLevel.INTERN;
  if (lowerTitle.includes('coordinator')) return SeniorityLevel.COORDINATOR;
  if (lowerTitle.includes('c-level') || lowerTitle.includes('ceo') || lowerTitle.includes('cfo') ||
      lowerTitle.includes('cto') || lowerTitle.includes('cmo') || lowerTitle.includes('chief')) {
    return SeniorityLevel.C_LEVEL;
  }
  if (lowerTitle.includes('founder') || lowerTitle.includes('owner')) return SeniorityLevel.FOUNDER_OWNER;
  if (lowerTitle.includes('evp') || lowerTitle.includes('executive vp')) return SeniorityLevel.EVP;
  if (lowerTitle.includes('svp') || lowerTitle.includes('senior vp')) return SeniorityLevel.SVP;
  if (lowerTitle.includes('vp') || lowerTitle.includes('vice president')) return SeniorityLevel.VP;
  if (lowerTitle.includes('senior director') || lowerTitle.includes('sr. director')) return SeniorityLevel.SENIOR_DIRECTOR;
  if (lowerTitle.includes('director')) return SeniorityLevel.DIRECTOR;
  if (lowerTitle.includes('senior manager') || lowerTitle.includes('sr. manager')) return SeniorityLevel.SENIOR_MANAGER;
  if (lowerTitle.includes('manager')) return SeniorityLevel.MANAGER;
  if (lowerTitle.includes('senior') || lowerTitle.includes('sr.')) return SeniorityLevel.SENIOR_SPECIALIST;

  return SeniorityLevel.SPECIALIST;
}

async function findCompany(companyName: string): Promise<string | null> {
  if (!companyName) return null;

  // Try exact match first
  let company = await prisma.company.findFirst({
    where: {
      OR: [
        { name: companyName },
        { name: { contains: companyName, mode: 'insensitive' } }
      ]
    },
    select: { id: true, name: true }
  });

  if (company) {
    return company.id;
  }

  // Try partial match (remove common suffixes)
  const cleanName = companyName
    .replace(/\s+(LLC|Inc|Corp|Ltd|Co|Group|Agency|Media|Partners|USA|US|International)\.?$/i, '')
    .trim();

  if (cleanName !== companyName) {
    company = await prisma.company.findFirst({
      where: {
        name: { contains: cleanName, mode: 'insensitive' }
      },
      select: { id: true, name: true }
    });

    if (company) {
      return company.id;
    }
  }

  return null;
}

async function importPerson(person: CleanPerson, stats: ImportStats): Promise<void> {
  // Parse name into first and last
  const { firstName, lastName } = parseName(person.name);

  // Infer seniority from title
  const seniority = inferSeniority(person.title);

  // Extract primary email
  const primaryEmail = person.emails && person.emails.length > 0
    ? person.emails[0].toLowerCase().trim()
    : null;

  // Find company
  let companyId: string | null = null;
  if (person.company) {
    companyId = await findCompany(person.company);
    if (!companyId) {
      if (person.company && !stats.companiesNotFound.includes(person.company)) {
        stats.companiesNotFound.push(person.company);
        console.log(`⚠️  Company not found: ${person.company}`);
      }
      // Skip if no company found (companyId is required)
      stats.contactsSkipped++;
      return;
    }
  } else {
    // No company, skip
    console.log(`⚠️  Skipping ${person.name} - no company`);
    stats.contactsSkipped++;
    return;
  }

  // Check if contact already exists (by LinkedIn URL or email)
  let existingContact = null;

  if (person.linkedinUrl) {
    existingContact = await prisma.contact.findFirst({
      where: { linkedinUrl: person.linkedinUrl },
      select: { id: true, fullName: true }
    });
  }

  if (!existingContact && primaryEmail) {
    existingContact = await prisma.contact.findFirst({
      where: { email: primaryEmail },
      select: { id: true, fullName: true }
    });
  }

  // Prepare contact data
  const contactData: any = {
    id: nanoid(),
    firstName,
    lastName: lastName || '',
    fullName: person.name,
    title: person.title || 'Unknown',
    email: primaryEmail,
    linkedinUrl: person.linkedinUrl,
    seniority,
    companyId,
    updatedAt: new Date(),
  };

  try {
    if (existingContact) {
      // Update existing contact
      const updateData = { ...contactData };
      delete updateData.id; // Don't update ID
      delete updateData.createdAt; // Don't update created at

      await prisma.contact.update({
        where: { id: existingContact.id },
        data: updateData
      });
      console.log(`🔄 Updated: ${person.name} (${person.company})`);
      stats.contactsUpdated++;
    } else {
      // Create new contact
      await prisma.contact.create({
        data: contactData
      });
      console.log(`✅ Created: ${person.name} (${person.company})`);
      stats.contactsCreated++;
    }
  } catch (error) {
    console.error(`❌ Error importing ${person.name}:`, error);
    stats.contactsSkipped++;
  }
}

async function main() {
  const inputFile = process.argv[2];

  if (!inputFile) {
    console.error('❌ Please provide input file path');
    console.error('Usage: npx tsx scripts/import-sellercrowd-people.ts <cleaned-json-file>');
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ File not found: ${inputFile}`);
    process.exit(1);
  }

  console.log('🚀 Importing SellerCrowd People Data\n');
  console.log(`📂 Input: ${inputFile}\n`);

  const peopleData: CleanPerson[] = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  console.log(`📊 Found ${peopleData.length} people to import\n`);

  const stats: ImportStats = {
    total: peopleData.length,
    contactsCreated: 0,
    contactsSkipped: 0,
    contactsUpdated: 0,
    companiesNotFound: []
  };

  // Import each person
  for (let i = 0; i < peopleData.length; i++) {
    const person = peopleData[i];

    await importPerson(person, stats);

    // Progress update every 50 records
    if ((i + 1) % 50 === 0) {
      console.log(`\n📊 Progress: ${i + 1}/${peopleData.length} processed\n`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total people:           ${stats.total}`);
  console.log(`✅ Contacts created:    ${stats.contactsCreated}`);
  console.log(`🔄 Contacts updated:    ${stats.contactsUpdated}`);
  console.log(`⚠️  Contacts skipped:   ${stats.contactsSkipped}`);
  console.log(`⚠️  Companies not found: ${stats.companiesNotFound.length}`);
  console.log('='.repeat(80));

  if (stats.companiesNotFound.length > 0) {
    console.log(`\n⚠️  Top 20 missing companies (out of ${stats.companiesNotFound.length}):`);
    stats.companiesNotFound.slice(0, 20).forEach(name => {
      console.log(`   - ${name}`);
    });
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
