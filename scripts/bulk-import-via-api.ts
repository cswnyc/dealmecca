/**
 * Bulk Import via API - Direct database import bypassing UI
 *
 * Usage: DATABASE_URL="$POSTGRES_URL" npx tsx scripts/bulk-import-via-api.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { prisma } from '../lib/prisma';
import { createId } from '@paralleldrive/cuid2';
import { getCompanyLogoUrl, getContactPhotoUrl } from '../lib/logo-utils';

interface CompanyRow {
  name: string;
  website: string;
  type: string;
  agencyType?: string;
  industry?: string;
  city: string;
  state: string;
  country: string;
  description?: string;
  linkedinUrl?: string;
}

interface ContactRow {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  companyName: string;
  department?: string;
  seniority?: string;
  linkedinUrl?: string;
}

/**
 * Parse CSV file
 */
function parseCSV<T>(filePath: string): T[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const rows: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let char of lines[i]) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Import companies
 */
async function importCompanies(companies: CompanyRow[]): Promise<Map<string, string>> {
  console.log(`📦 Importing ${companies.length} companies...`);
  const companyMap = new Map<string, string>(); // name -> id

  let created = 0;
  let skipped = 0;

  for (const company of companies) {
    try {
      // Check if company exists
      const existing = await prisma.company.findFirst({
        where: {
          OR: [
            { name: { equals: company.name, mode: 'insensitive' } },
            company.website ? { website: company.website } : { id: 'never-match' }
          ]
        }
      });

      if (existing) {
        companyMap.set(company.name.toLowerCase(), existing.id);
        skipped++;
        continue;
      }

      // Generate logo
      const logoUrl = getCompanyLogoUrl(company.website, company.name);

      // Create company
      const newCompany = await prisma.company.create({
        data: {
          id: createId(),
          name: company.name,
          slug: company.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
          website: company.website || undefined,
          logoUrl: logoUrl || undefined,
          companyType: company.type || 'ADVERTISER',
          agencyType: company.agencyType || undefined,
          industry: company.industry || undefined,
          city: company.city || undefined,
          state: company.state || undefined,
          country: company.country || 'United States',
          description: company.description || undefined,
          linkedinUrl: company.linkedinUrl || undefined,
          dataQuality: 'BASIC',
          verified: false,
          updatedAt: new Date()
        }
      });

      companyMap.set(company.name.toLowerCase(), newCompany.id);
      created++;

      if (created % 50 === 0) {
        console.log(`   ✓ Progress: ${created}/${companies.length} companies created`);
      }

    } catch (error: any) {
      console.error(`   ✗ Error creating company "${company.name}":`, error.message);
      skipped++;
    }
  }

  console.log(`✅ Companies: ${created} created, ${skipped} skipped\n`);
  return companyMap;
}

/**
 * Import contacts
 */
async function importContacts(contacts: ContactRow[], companyMap: Map<string, string>): Promise<void> {
  console.log(`👥 Importing ${contacts.length} contacts...`);

  let created = 0;
  let skipped = 0;

  for (const contact of contacts) {
    try {
      // Find company ID
      const companyId = companyMap.get(contact.companyName.toLowerCase());

      if (!companyId) {
        // Try to find company in database
        const company = await prisma.company.findFirst({
          where: { name: { equals: contact.companyName, mode: 'insensitive' } }
        });

        if (!company) {
          console.error(`   ✗ Company not found for contact: ${contact.firstName} ${contact.lastName} (${contact.companyName})`);
          skipped++;
          continue;
        }

        companyMap.set(contact.companyName.toLowerCase(), company.id);
      }

      const finalCompanyId = companyMap.get(contact.companyName.toLowerCase())!;

      // Check if contact exists
      const existing = await prisma.contact.findFirst({
        where: {
          AND: [
            { companyId: finalCompanyId },
            {
              OR: [
                { email: contact.email || 'never-match' },
                {
                  AND: [
                    { firstName: { equals: contact.firstName, mode: 'insensitive' } },
                    { lastName: { equals: contact.lastName, mode: 'insensitive' } }
                  ]
                }
              ]
            }
          ]
        }
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Generate photo
      const photoUrl = getContactPhotoUrl(contact.firstName, contact.lastName, contact.email);

      // Create contact
      await prisma.contact.create({
        data: {
          id: createId(),
          firstName: contact.firstName,
          lastName: contact.lastName,
          fullName: `${contact.firstName} ${contact.lastName}`,
          email: contact.email || undefined,
          phone: contact.phone || undefined,
          title: contact.title || undefined,
          department: contact.department || undefined,
          seniority: contact.seniority || 'SPECIALIST',
          linkedinUrl: contact.linkedinUrl || undefined,
          logoUrl: photoUrl || undefined,
          companyId: finalCompanyId,
          dataQuality: 'BASIC',
          verified: false,
          isDecisionMaker: false,
          updatedAt: new Date()
        }
      });

      created++;

      if (created % 100 === 0) {
        console.log(`   ✓ Progress: ${created}/${contacts.length} contacts created`);
      }

    } catch (error: any) {
      console.error(`   ✗ Error creating contact "${contact.firstName} ${contact.lastName}":`, error.message);
      skipped++;
    }
  }

  console.log(`✅ Contacts: ${created} created, ${skipped} skipped\n`);
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();

  try {
    console.log('🚀 Starting bulk import via direct API...\n');

    // Read CSV files
    const companiesPath = join(process.cwd(), 'bulk-data-companies.csv');
    const contactsPath = join(process.cwd(), 'bulk-data-contacts.csv');

    console.log('📖 Reading CSV files...');
    const companies = parseCSV<CompanyRow>(companiesPath);
    const contacts = parseCSV<ContactRow>(contactsPath);
    console.log(`   - ${companies.length} companies loaded`);
    console.log(`   - ${contacts.length} contacts loaded\n`);

    // Import companies first
    const companyMap = await importCompanies(companies);

    // Then import contacts
    await importContacts(contacts, companyMap);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Bulk import complete in ${totalTime}s`);

  } catch (error) {
    console.error('❌ Bulk import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
