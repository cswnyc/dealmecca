import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

// Duties from SellerCrowd screenshot - categorized
const dutiesToAdd = [
  // ROLE category
  { name: 'Branded Content', category: 'ROLE' },
  { name: 'Branding', category: 'ROLE' },
  { name: 'Direct Response', category: 'ROLE' },
  { name: 'Event Sponsorship', category: 'ROLE' },
  { name: 'Finance', category: 'ROLE' },

  // MEDIA_TYPE category
  { name: 'Digital Audio', category: 'MEDIA_TYPE' },
  { name: 'Mobile', category: 'MEDIA_TYPE' },
  { name: 'Podcast', category: 'MEDIA_TYPE' },
  { name: 'Print', category: 'MEDIA_TYPE' },
  { name: 'Radio', category: 'MEDIA_TYPE' },
  { name: 'Search', category: 'MEDIA_TYPE' },
  { name: 'TV', category: 'MEDIA_TYPE' },

  // GEOGRAPHY category
  { name: 'Local', category: 'GEOGRAPHY' },
  { name: 'National', category: 'GEOGRAPHY' },
  { name: 'Regional', category: 'GEOGRAPHY' },
  { name: 'Arizona', category: 'GEOGRAPHY' },

  // AUDIENCE category
  { name: 'Multicultural', category: 'AUDIENCE' },

  // GOAL category (funnel stages)
  { name: 'Upper-Funnel', category: 'GOAL' },
  { name: 'Lower-Funnel', category: 'GOAL' },
];

async function main() {
  console.log('Adding missing duties from SellerCrowd...\n');

  // Get existing duties
  const existingDuties = await prisma.duty.findMany({
    select: { name: true }
  });
  const existingNames = new Set(existingDuties.map(d => d.name.toLowerCase()));

  console.log(`Existing duties: ${existingDuties.length}`);

  let created = 0;
  let skipped = 0;

  for (const duty of dutiesToAdd) {
    if (existingNames.has(duty.name.toLowerCase())) {
      console.log(`SKIP: ${duty.name} (already exists)`);
      skipped++;
      continue;
    }

    try {
      const newDuty = await prisma.duty.create({
        data: {
          id: createId(),
          name: duty.name,
          category: duty.category as any,
          description: `${duty.name} - ${duty.category.replace('_', ' ').toLowerCase()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`CREATED: ${newDuty.name} (${newDuty.category})`);
      created++;
    } catch (error: any) {
      console.error(`ERROR creating ${duty.name}: ${error.message}`);
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);

  // Final count
  const finalCount = await prisma.duty.count();
  console.log(`\nTotal duties: ${finalCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
