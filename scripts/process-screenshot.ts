#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

interface Agency {
  name: string;
  city: string;
  state: string;
  clients: string[];
}

/**
 * Process Screenshot Script
 *
 * This script handles the complete workflow for importing screenshot data:
 * 1. Creates missing agencies in the database
 * 2. Runs the import to add partnerships
 * 3. Verifies the import was successful
 *
 * Usage:
 *   npx tsx scripts/process-screenshot.ts <screenshot-number>
 *
 * Example:
 *   npx tsx scripts/process-screenshot.ts 62
 *
 * Note: You must add the agency data to verified-independent-agencies-data.ts
 * with comment "// Screenshot XX - VERIFIED" before running this script.
 */

async function createAgenciesFromScreenshot(screenshotNum: number, agencies: Agency[]) {
  console.log(`\n🚀 Creating agencies from Screenshot ${screenshotNum}...\n`);

  const createdAgencies = [];

  for (const agency of agencies) {
    try {
      // Check if agency already exists
      const existing = await prisma.company.findFirst({
        where: { name: agency.name },
      });

      if (existing) {
        console.log(`⚠️  Agency already exists: ${agency.name}`);
        createdAgencies.push(existing);
        continue;
      }

      // Generate slug
      let slug = agency.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

      // Check if slug exists and append suffix if needed
      let slugExists = await prisma.company.findUnique({ where: { slug } });
      let counter = 1;
      while (slugExists) {
        slug = `${agency.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-${counter}`;
        counter++;
        slugExists = await prisma.company.findUnique({ where: { slug } });
      }

      // Create the agency
      const newAgency = await prisma.company.create({
        data: {
          id: createId(),
          name: agency.name,
          slug: slug,
          city: agency.city,
          state: agency.state,
          companyType: 'INDEPENDENT_AGENCY',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log(`✅ Created agency: ${newAgency.name} (${newAgency.city}, ${newAgency.state}) - slug: ${slug}`);
      createdAgencies.push(newAgency);
    } catch (error) {
      console.error(`❌ Error creating ${agency.name}:`, error);
    }
  }

  console.log(`\n✨ Done! Created ${createdAgencies.length} agencies.`);
  return createdAgencies;
}

async function verifyPartnerships(screenshotNum: number, agencyNames: string[], expectedTotal: number) {
  console.log(`\n🔍 Verifying Screenshot ${screenshotNum} partnerships...\n`);

  let totalPartnerships = 0;

  for (const agencyName of agencyNames) {
    const agency = await prisma.company.findFirst({
      where: { name: agencyName },
      include: {
        CompanyPartnership_agencyIdToCompany: {
          include: {
            advertiser: true
          }
        }
      }
    });

    if (!agency) {
      console.log(`❌ Agency not found: ${agencyName}\n`);
      continue;
    }

    console.log(`✅ ${agencyName} (${agency.city}, ${agency.state})`);
    console.log(`   Partnerships: ${agency.CompanyPartnership_agencyIdToCompany.length}`);
    totalPartnerships += agency.CompanyPartnership_agencyIdToCompany.length;

    if (agency.CompanyPartnership_agencyIdToCompany.length > 0) {
      console.log(`   Advertisers:`);
      agency.CompanyPartnership_agencyIdToCompany.slice(0, 5).forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.advertiser.name}`);
      });
      if (agency.CompanyPartnership_agencyIdToCompany.length > 5) {
        console.log(`      ... and ${agency.CompanyPartnership_agencyIdToCompany.length - 5} more`);
      }
    }
    console.log('');
  }

  console.log(`\n📊 Total partnerships: ${totalPartnerships}`);
  console.log(`   Expected: ${expectedTotal} partnerships`);

  if (totalPartnerships === expectedTotal) {
    console.log(`\n✅ SUCCESS! All partnerships imported correctly.`);
    return true;
  } else {
    console.log(`\n⚠️  WARNING: Partnership count mismatch!`);
    return false;
  }
}

async function main() {
  const screenshotNum = process.argv[2];

  if (!screenshotNum) {
    console.error('❌ Error: Please provide a screenshot number');
    console.log('\nUsage: npx tsx scripts/process-screenshot.ts <screenshot-number>');
    console.log('Example: npx tsx scripts/process-screenshot.ts 62');
    process.exit(1);
  }

  console.log(`\n📸 Processing Screenshot ${screenshotNum}`);
  console.log('=' .repeat(50));

  // TODO: Add your screenshot data here
  // Copy the agencies array from verified-independent-agencies-data.ts for this screenshot
  const agencies: Agency[] = [];

  if (agencies.length === 0) {
    console.error('\n❌ Error: No agency data found!');
    console.log('\nPlease edit scripts/process-screenshot.ts and add the agency data');
    console.log('from verified-independent-agencies-data.ts for Screenshot', screenshotNum);
    process.exit(1);
  }

  // Calculate expected partnerships
  const expectedTotal = agencies.reduce((sum, a) => sum + a.clients.length, 0);
  const agencyNames = agencies.map(a => a.name);

  // Step 1: Create agencies
  const createdAgencies = await createAgenciesFromScreenshot(parseInt(screenshotNum), agencies);

  if (createdAgencies.length === 0) {
    console.error('\n❌ Error: No agencies were created');
    process.exit(1);
  }

  // Step 2: Import partnerships
  console.log('\n⏳ Importing partnerships...');
  console.log('This may take several minutes depending on database load.');
  console.log('You can check progress in your admin UI.\n');

  // Note: We don't run the import here as it's handled by the main import script
  // The import script processes the entire verified-independent-agencies-data.ts file

  // Step 3: Verify (with delay to allow import to complete)
  console.log('⏳ Waiting 60 seconds for import to process...\n');
  await new Promise(resolve => setTimeout(resolve, 60000));

  await verifyPartnerships(parseInt(screenshotNum), agencyNames, expectedTotal);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
