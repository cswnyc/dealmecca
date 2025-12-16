import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

const HORIZON_MEDIA_ID = 'e9sa5w0mrkqv3z2z2uo6qoed';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + createId().slice(0, 8);
}

// Missing Horizon Media agencies from SellerCrowd
const missingAgencies = [
  {
    name: '305 Worldwide NY',
    city: 'New York City',
    state: 'NY',
    country: 'US',
    region: 'NORTHEAST'
  },
  {
    name: 'Night Market NY',
    city: 'New York City',
    state: 'NY',
    country: 'US',
    region: 'NORTHEAST'
  },
  {
    name: 'Horizon Media Boston',
    city: 'Boston',
    state: 'MA',
    country: 'US',
    region: 'NORTHEAST'
  },
  {
    name: 'Big',
    city: 'New York City',
    state: 'NY',
    country: 'US',
    region: 'NORTHEAST'
  },
  {
    name: '305 Worldwide Miami',
    city: 'Miami',
    state: 'FL',
    country: 'US',
    region: 'SOUTHEAST'
  },
  {
    name: 'Treehouse NY',
    city: 'New York City',
    state: 'NY',
    country: 'US',
    region: 'NORTHEAST'
  },
  {
    name: 'Horizon Media San Diego',
    city: 'San Diego',
    state: 'CA',
    country: 'US',
    region: 'WEST'
  },
  {
    name: 'Treehouse LA',
    city: 'Los Angeles',
    state: 'CA',
    country: 'US',
    region: 'WEST'
  }
];

async function main() {
  console.log('Adding missing Horizon Media agencies...\n');

  // Verify parent exists
  const horizonMedia = await prisma.company.findUnique({
    where: { id: HORIZON_MEDIA_ID }
  });

  if (!horizonMedia) {
    console.error('Horizon Media parent company not found!');
    process.exit(1);
  }

  console.log(`Found parent: ${horizonMedia.name} (${horizonMedia.companyType})\n`);

  // Get existing subsidiaries to avoid duplicates
  const existingSubsidiaries = await prisma.company.findMany({
    where: { parentCompanyId: HORIZON_MEDIA_ID },
    select: { name: true }
  });

  const existingNames = new Set(existingSubsidiaries.map(s => s.name.toLowerCase()));
  console.log(`Existing subsidiaries: ${existingSubsidiaries.length}`);
  existingSubsidiaries.forEach(s => console.log(`  - ${s.name}`));
  console.log('');

  let created = 0;
  let skipped = 0;

  for (const agency of missingAgencies) {
    if (existingNames.has(agency.name.toLowerCase())) {
      console.log(`SKIP: ${agency.name} (already exists)`);
      skipped++;
      continue;
    }

    try {
      const newAgency = await prisma.company.create({
        data: {
          id: createId(),
          slug: generateSlug(agency.name),
          name: agency.name,
          companyType: 'AGENCY',
          agencyType: 'MEDIA_SPECIALIST',
          city: agency.city,
          state: agency.state,
          country: agency.country,
          region: agency.region,
          parentCompanyId: HORIZON_MEDIA_ID,
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`CREATED: ${newAgency.name} (${newAgency.city}, ${newAgency.state}) - ID: ${newAgency.id}`);
      created++;
    } catch (error: any) {
      console.error(`ERROR creating ${agency.name}: ${error.message}`);
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);

  // Also update existing agencies with missing location data
  console.log('\n--- Updating existing agencies with location data ---');

  const locationUpdates = [
    { name: 'Horizon Media NY', city: 'New York City', state: 'NY', region: 'NORTHEAST' },
    { name: 'Horizon Media LA', city: 'Los Angeles', state: 'CA', region: 'WEST' },
    { name: 'Horizon Media Chicago', city: 'Chicago', state: 'IL', region: 'MIDWEST' },
    { name: 'Horizon Media Toronto', city: 'Toronto', state: 'ON', country: 'CA', region: 'CANADA' }
  ];

  for (const update of locationUpdates) {
    const result = await prisma.company.updateMany({
      where: {
        name: update.name,
        parentCompanyId: HORIZON_MEDIA_ID,
        city: null
      },
      data: {
        city: update.city,
        state: update.state,
        country: update.country || 'US',
        region: update.region
      }
    });

    if (result.count > 0) {
      console.log(`UPDATED: ${update.name} -> ${update.city}, ${update.state}`);
    }
  }

  // Final count
  const finalCount = await prisma.company.count({
    where: { parentCompanyId: HORIZON_MEDIA_ID }
  });

  console.log(`\nTotal Horizon Media subsidiaries: ${finalCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
