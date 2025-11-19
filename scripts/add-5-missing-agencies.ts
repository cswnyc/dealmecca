import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

/**
 * Add 5 missing agencies found during Mini USA, IKEA, Campbell Soup partnership creation
 *
 * Usage:
 *   npx tsx scripts/add-5-missing-agencies.ts
 */

const missingAgencies = [
  { name: '180NY', city: 'New York City', state: 'NY', country: 'US' },
  { name: 'Critical Mass NY', city: 'New York City', state: 'NY', country: 'US' },
  { name: 'Pereira & O\'Dell NY', city: 'New York City', state: 'NY', country: 'US' },
  { name: 'Edelman Atlanta', city: 'Atlanta', state: 'GA', country: 'US' },
  { name: 'Material+ Austin', city: 'Austin', state: 'TX', country: 'US' }
];

async function addMissingAgencies() {
  console.log('🚀 Adding 5 Missing Agencies...');
  console.log('================================================================================\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const agency of missingAgencies) {
    try {
      // Check if already exists (case-insensitive)
      const existing = await prisma.company.findFirst({
        where: {
          name: { equals: agency.name, mode: 'insensitive' }
        }
      });

      if (existing) {
        console.log(`⏭️  [${created + skipped + 1}/${missingAgencies.length}] Already exists: ${agency.name}`);
        skipped++;
        continue;
      }

      // Generate slug
      let slug = agency.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Check for slug uniqueness
      let slugExists = await prisma.company.findUnique({ where: { slug } });
      let counter = 1;
      while (slugExists) {
        slug = `${agency.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')}-${counter}`;
        slugExists = await prisma.company.findUnique({ where: { slug } });
        counter++;
      }

      // Create agency
      await prisma.company.create({
        data: {
          id: createId(),
          name: agency.name,
          slug: slug,
          companyType: 'AGENCY',
          city: agency.city,
          state: agency.state,
          country: agency.country,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      created++;
      console.log(`✅ [${created + skipped}/${missingAgencies.length}] Created: ${agency.name} (${agency.city}, ${agency.state})`);

    } catch (error: any) {
      errors++;
      console.error(`❌ Error adding ${agency.name}: ${error.message}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total agencies:      ${missingAgencies.length}`);
  console.log(`Agencies created:    ${created}`);
  console.log(`Already existed:     ${skipped}`);
  console.log(`Errors:              ${errors}`);
  console.log('\n✨ Complete!');
}

addMissingAgencies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
