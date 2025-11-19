import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

// Partnerships data from Screenshot 98
const partnershipsData = [
  {
    agencyName: 'Questus LA',
    advertisers: []
  },
  {
    agencyName: 'SSCG Media Group Princeton',
    advertisers: [
      'SK Life Science, Inc.',
      'Tris Pharma'
    ]
  },
  {
    agencyName: 'PMG LA',
    advertisers: [
      'Apple',
      'Best Western',
      'ByteDance.com',
      'CKE Restaurants',
      'Dutch Bros Coffee',
      'Fortra',
      'Intuit',
      'J. Crew',
      'Kohler',
      'McAfee',
      'Nordstrom',
      'Omni Hotels',
      'Otter Products',
      'Ralph Lauren',
      'Shell',
      'Therabody',
      'Tommy Bahama',
      'Tory Burch',
      'TripAdvisor',
      'US Open',
      'Whole Foods Market'
    ]
  },
  {
    agencyName: 'Fintel Connect',
    advertisers: [
      'RBC Royal Bank',
      'Scotiabank'
    ]
  },
  {
    agencyName: 'milk*',
    advertisers: []
  },
  {
    agencyName: 'R/GA NY',
    advertisers: [
      'Ally Financial',
      'BBC Worldwide',
      'Eli Lilly',
      'Fila',
      'Intuit',
      'Memorial Sloan Kettering',
      'Nike',
      'Samsung',
      'Slack Technologies'
    ]
  },
  {
    agencyName: 'Riester LA',
    advertisers: []
  },
  {
    agencyName: 'Blue State Digital NY',
    advertisers: []
  },
  {
    agencyName: 'Crossmedia Philadelphia',
    advertisers: [
      'American Cancer Society',
      'Empower Retirement',
      'Main Line Health',
      'Maple from Canada',
      'Moose Toys',
      'NASCAR',
      'Newell Brands',
      'NYU Langone Medical Center',
      'Philadelphia Zoo',
      'PVH Corporation',
      'Regis Corp.',
      'Ricola',
      'US Bank'
    ]
  }
];

async function addScreenshot98Partnerships() {
  console.log('🤝 Adding Screenshot 98 partnerships...\n');

  let stats = {
    partnershipsCreated: 0,
    partnershipsSkipped: 0,
    advertisersCreated: 0,
    advertisersFound: 0,
    errors: [] as string[]
  };

  for (const data of partnershipsData) {
    console.log(`\n📍 Processing agency: ${data.agencyName}`);

    // Find the agency
    const agency = await prisma.company.findFirst({
      where: { name: data.agencyName }
    });

    if (!agency) {
      console.error(`   ❌ Agency not found: ${data.agencyName}`);
      stats.errors.push(`Agency not found: ${data.agencyName}`);
      continue;
    }

    console.log(`   ✅ Found agency ID: ${agency.id}`);

    // Process each advertiser
    for (const advertiserName of data.advertisers) {
      try {
        // Check if advertiser exists
        let advertiser = await prisma.company.findFirst({
          where: {
            name: { equals: advertiserName, mode: 'insensitive' }
          }
        });

        // If advertiser doesn't exist, create it
        if (!advertiser) {
          console.log(`   🆕 Creating new advertiser: ${advertiserName}`);

          // Generate slug
          let slug = advertiserName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

          // Check for slug uniqueness
          let slugExists = await prisma.company.findUnique({ where: { slug } });
          let counter = 1;
          while (slugExists) {
            slug = `${advertiserName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '')}-${counter}`;
            slugExists = await prisma.company.findUnique({ where: { slug } });
            counter++;
          }

          advertiser = await prisma.company.create({
            data: {
              id: createId(),
              name: advertiserName,
              slug: slug,
              companyType: 'ADVERTISER',
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          });

          stats.advertisersCreated++;
          console.log(`      ✅ Created advertiser with slug: ${slug}`);
        } else {
          stats.advertisersFound++;
          console.log(`   📌 Found existing advertiser: ${advertiserName} (${advertiser.id})`);
        }

        // Check if partnership already exists
        const existingPartnership = await prisma.companyPartnership.findFirst({
          where: {
            agencyId: agency.id,
            advertiserId: advertiser.id
          }
        });

        if (existingPartnership) {
          stats.partnershipsSkipped++;
          console.log(`   ⏭️  Partnership already exists: ${data.agencyName} ↔ ${advertiserName}`);
          continue;
        }

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

        stats.partnershipsCreated++;
        console.log(`   ✅ Created partnership: ${data.agencyName} ↔ ${advertiserName}`);

      } catch (error: any) {
        const msg = `Error with ${advertiserName}: ${error.message}`;
        stats.errors.push(msg);
        console.error(`   ❌ ${msg}`);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   Partnerships created: ${stats.partnershipsCreated}`);
  console.log(`   Partnerships skipped (already exist): ${stats.partnershipsSkipped}`);
  console.log(`   Advertisers created: ${stats.advertisersCreated}`);
  console.log(`   Advertisers found: ${stats.advertisersFound}`);
  console.log(`   Errors: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach(err => console.log(`   - ${err}`));
  }

  console.log('\n✨ Done!');
}

addScreenshot98Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
