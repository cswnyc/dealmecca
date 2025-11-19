import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

/**
 * Add missing partnerships for Mini USA, IKEA, and Campbell Soup
 * These advertisers were not expanded during scraping, so only 3 agencies were captured
 *
 * Usage:
 *   npx tsx scripts/add-missing-partnerships-mini-ikea-campbell.ts
 */

const partnerships = [
  {
    advertiser: 'Mini USA',
    agencies: [
      '180NY',
      'Critical Mass Chicago',
      'Critical Mass NY',
      'Critical Mass Toronto',
      'GS&P SF',
      'Media Experts Toronto',
      'Pereira & O\'Dell NY',
      'Rapport NY'
    ]
  },
  {
    advertiser: 'IKEA',
    agencies: [
      'Alma Agency',
      'Carat NY',
      'Carat Toronto',
      'DAVID The Agency NY',
      'Dentsu International Atlanta',
      'Dentsu International Chicago',
      'Dentsu International London',
      'Dentsu International NY',
      'Edelman Atlanta',
      'EssenceMediacom UK',
      'Material+ Austin',
      'Ogilvy NY',
      'WPP Media NY',
      'Xaxis LA',
      'Xaxis NY'
    ]
  },
  {
    advertiser: 'Campbell Soup',
    agencies: [
      'Evergreen Trading NY',
      'Hearts & Science Charlotte',
      'M Booth',
      'Mars United Commerce Cincinnati',
      'Mars United Commerce Detroit',
      'Mars United Commerce Minneapolis',
      'PGD LATAM',
      'Publicis Media NY',
      'Resolution Agency NY',
      'Spark Foundry Atlanta',
      'Spark Foundry Chicago',
      'Spark Foundry Dallas',
      'Spark Foundry Detroit',
      'Spark Foundry NY',
      'Spark Foundry Toronto'
    ]
  }
];

async function addMissingPartnerships() {
  console.log('🚀 Adding Missing Partnerships for Mini USA, IKEA, Campbell Soup...');
  console.log('================================================================================\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;
  const agenciesNotFound: string[] = [];

  for (const partnership of partnerships) {
    console.log(`\n📦 Processing: ${partnership.advertiser}`);
    console.log('─'.repeat(80));

    // Find advertiser
    const advertiser = await prisma.company.findFirst({
      where: {
        name: { equals: partnership.advertiser, mode: 'insensitive' }
      }
    });

    if (!advertiser) {
      console.error(`❌ Advertiser not found: ${partnership.advertiser}`);
      errors++;
      continue;
    }

    console.log(`✓ Found advertiser: ${advertiser.name} (${advertiser.id})`);
    console.log(`📋 Processing ${partnership.agencies.length} agencies...\n`);

    for (const agencyName of partnership.agencies) {
      try {
        // Find agency (case-insensitive, search all agency types)
        const agency = await prisma.company.findFirst({
          where: {
            name: { equals: agencyName, mode: 'insensitive' },
            companyType: { in: ['INDEPENDENT_AGENCY', 'ADVERTISER', 'AGENCY'] }
          }
        });

        if (!agency) {
          console.log(`   ⚠️  Agency not found: ${agencyName}`);
          if (!agenciesNotFound.includes(agencyName)) {
            agenciesNotFound.push(agencyName);
          }
          errors++;
          continue;
        }

        // Check if partnership already exists
        const existingPartnership = await prisma.companyPartnership.findFirst({
          where: {
            agencyId: agency.id,
            advertiserId: advertiser.id
          }
        });

        if (existingPartnership) {
          console.log(`   ⏭️  Partnership exists: ${agencyName}`);
          skipped++;
        } else {
          // Create partnership
          await prisma.companyPartnership.create({
            data: {
              id: createId(),
              agencyId: agency.id,
              advertiserId: advertiser.id,
              relationshipType: 'AGENCY_CLIENT',
              isAOR: false,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });

          created++;
          console.log(`   ✅ Created partnership: ${agencyName}`);
        }
      } catch (error: any) {
        errors++;
        console.error(`   ❌ Error with ${agencyName}: ${error.message}`);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Partnerships created:    ${created}`);
  console.log(`Partnerships skipped:    ${skipped} (already exist)`);
  console.log(`Errors:                  ${errors}`);

  if (agenciesNotFound.length > 0) {
    console.log(`\n⚠️  Agencies not found (${agenciesNotFound.length}):`);
    agenciesNotFound.forEach(agency => {
      console.log(`   - ${agency}`);
    });
  }

  console.log('\n✨ Complete!');
}

addMissingPartnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
