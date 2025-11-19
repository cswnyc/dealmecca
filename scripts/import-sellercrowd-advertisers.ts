import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ScrapedAdvertiser {
  name: string;
  city?: string;
  state?: string;
  agencies?: string[];
  lastActivity?: string;
}

interface ImportStats {
  advertisersProcessed: number;
  advertisersCreated: number;
  advertisersSkipped: number;
  partnershipsCreated: number;
  partnershipsSkipped: number;
  agenciesNotFound: string[];
  errors: string[];
}

/**
 * Import advertisers from SellerCrowd scraper JSON output
 *
 * Usage:
 *   npx tsx scripts/import-sellercrowd-advertisers.ts path/to/scraped-advertisers.json
 *
 * Or edit the DEFAULT_INPUT_FILE below and run:
 *   npx tsx scripts/import-sellercrowd-advertisers.ts
 */

// Edit this path to your scraped JSON file
const DEFAULT_INPUT_FILE = './sellercrowd-advertisers-batch1.json';

async function importAdvertisers(filePath: string) {
  console.log('🚀 SellerCrowd Advertiser Import Starting...');
  console.log('================================================================================\n');

  // Read JSON file
  let advertisers: ScrapedAdvertiser[];
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    advertisers = JSON.parse(fileContent);
    console.log(`📁 Loaded ${advertisers.length} advertisers from ${path.basename(filePath)}\n`);
  } catch (error: any) {
    console.error(`❌ Error reading file: ${error.message}`);
    process.exit(1);
  }

  const stats: ImportStats = {
    advertisersProcessed: 0,
    advertisersCreated: 0,
    advertisersSkipped: 0,
    partnershipsCreated: 0,
    partnershipsSkipped: 0,
    agenciesNotFound: [],
    errors: []
  };

  // Process each advertiser
  for (const advertiser of advertisers) {
    stats.advertisersProcessed++;
    console.log(`\n[${stats.advertisersProcessed}/${advertisers.length}] Processing: ${advertiser.name}`);

    try {
      // Check if advertiser already exists (case-insensitive)
      let existingAdvertiser = await prisma.company.findFirst({
        where: {
          name: { equals: advertiser.name, mode: 'insensitive' }
        }
      });

      if (existingAdvertiser) {
        console.log(`   ⏭️  Already exists: ${existingAdvertiser.name} (${existingAdvertiser.id})`);
        stats.advertisersSkipped++;
      } else {
        // Generate slug
        let slug = advertiser.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        // Check for slug uniqueness
        let slugExists = await prisma.company.findUnique({ where: { slug } });
        let counter = 1;
        while (slugExists) {
          slug = `${advertiser.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')}-${counter}`;
          slugExists = await prisma.company.findUnique({ where: { slug } });
          counter++;
        }

        // Create advertiser
        existingAdvertiser = await prisma.company.create({
          data: {
            id: createId(),
            name: advertiser.name,
            slug: slug,
            companyType: 'ADVERTISER',
            city: advertiser.city,
            state: advertiser.state,
            country: advertiser.state ? 'US' : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });

        stats.advertisersCreated++;
        const location = advertiser.city && advertiser.state
          ? ` (${advertiser.city}, ${advertiser.state})`
          : '';
        console.log(`   ✅ Created: ${existingAdvertiser.name}${location} - slug: ${slug}`);
      }

      // Process agency relationships
      if (advertiser.agencies && advertiser.agencies.length > 0) {
        console.log(`   🤝 Processing ${advertiser.agencies.length} agency relationships...`);

        for (const agencyName of advertiser.agencies) {
          try {
            // Find agency (case-insensitive)
            // Search for INDEPENDENT_AGENCY, ADVERTISER, and AGENCY
            // (network agencies may be marked as ADVERTISER or AGENCY)
            const agency = await prisma.company.findFirst({
              where: {
                name: { equals: agencyName, mode: 'insensitive' },
                companyType: { in: ['INDEPENDENT_AGENCY', 'ADVERTISER', 'AGENCY'] }
              }
            });

            if (!agency) {
              console.log(`      ⚠️  Agency not found: ${agencyName}`);
              if (!stats.agenciesNotFound.includes(agencyName)) {
                stats.agenciesNotFound.push(agencyName);
              }
              continue;
            }

            // Check if partnership already exists
            const existingPartnership = await prisma.companyPartnership.findFirst({
              where: {
                agencyId: agency.id,
                advertiserId: existingAdvertiser!.id
              }
            });

            if (existingPartnership) {
              stats.partnershipsSkipped++;
              console.log(`      ⏭️  Partnership exists: ${agencyName}`);
            } else {
              // Create partnership
              await prisma.companyPartnership.create({
                data: {
                  id: createId(),
                  agencyId: agency.id,
                  advertiserId: existingAdvertiser!.id,
                  relationshipType: 'AGENCY_CLIENT',
                  isAOR: false,
                  isActive: true,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              });

              stats.partnershipsCreated++;
              console.log(`      ✅ Created partnership: ${agencyName}`);
            }
          } catch (error: any) {
            const msg = `Error with agency ${agencyName}: ${error.message}`;
            stats.errors.push(msg);
            console.error(`      ❌ ${msg}`);
          }
        }
      }

    } catch (error: any) {
      const msg = `Error processing ${advertiser.name}: ${error.message}`;
      stats.errors.push(msg);
      console.error(`   ❌ ${msg}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(80));
  console.log(`Advertisers processed:     ${stats.advertisersProcessed}`);
  console.log(`Advertisers created:       ${stats.advertisersCreated}`);
  console.log(`Advertisers skipped:       ${stats.advertisersSkipped} (already exist)`);
  console.log(`Partnerships created:      ${stats.partnershipsCreated}`);
  console.log(`Partnerships skipped:      ${stats.partnershipsSkipped} (already exist)`);
  console.log(`Errors:                    ${stats.errors.length}`);

  if (stats.agenciesNotFound.length > 0) {
    console.log(`\n⚠️  Agencies not found in database (${stats.agenciesNotFound.length}):`);
    stats.agenciesNotFound.slice(0, 20).forEach(agency => {
      console.log(`   - ${agency}`);
    });
    if (stats.agenciesNotFound.length > 20) {
      console.log(`   ... and ${stats.agenciesNotFound.length - 20} more`);
    }
    console.log('\n💡 Tip: These agencies may need to be added separately');
  }

  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors encountered (${stats.errors.length}):`);
    stats.errors.slice(0, 10).forEach(error => {
      console.log(`   - ${error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more errors`);
    }
  }

  console.log('\n✨ Import complete!');
}

// Main execution
const inputFile = process.argv[2] || DEFAULT_INPUT_FILE;

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Error: File not found: ${inputFile}`);
  console.log('\nUsage:');
  console.log('  npx tsx scripts/import-sellercrowd-advertisers.ts path/to/scraped-advertisers.json');
  console.log('\nOr edit DEFAULT_INPUT_FILE in the script and run:');
  console.log('  npx tsx scripts/import-sellercrowd-advertisers.ts');
  process.exit(1);
}

importAdvertisers(inputFile)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
