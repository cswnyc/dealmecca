#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

async function importMXLocationsNY() {
  console.log('🚀 Importing MX | Locations Experts NY partnerships...\n');

  // Use the exact company ID from the admin URL
  const agencyId = 'y0hxwadmnfu4g26xn6h99z02';

  // Verify the agency exists
  const agency = await prisma.company.findUnique({
    where: { id: agencyId }
  });

  if (!agency) {
    console.log(`❌ Agency not found with ID: ${agencyId}`);
    await prisma.$disconnect();
    return;
  }

  console.log(`📍 Found: ${agency.name} (${agency.city}, ${agency.state})`);

  const clients = ['A24 Films', 'Diageo'];
  console.log(`   Creating ${clients.length} partnerships...\n`);

  let created = 0;
  let skipped = 0;

  for (const clientName of clients) {
    // Find or create advertiser
    let advertiser = await prisma.company.findFirst({
      where: { name: { equals: clientName, mode: 'insensitive' } }
    });

    if (!advertiser) {
      const slug = clientName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      let uniqueSlug = slug;
      let counter = 1;
      while (await prisma.company.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      advertiser = await prisma.company.create({
        data: {
          id: createId(),
          name: clientName,
          slug: uniqueSlug,
          companyType: 'ADVERTISER',
          dataQuality: 'BASIC',
          verified: false,
          updatedAt: new Date(),
        }
      });
      console.log(`   ➕ Created advertiser: ${clientName}`);
    }

    // Check if partnership exists
    const existing = await prisma.companyPartnership.findFirst({
      where: {
        agencyId: agency.id,
        advertiserId: advertiser.id
      }
    });

    if (existing) {
      console.log(`   ⏭️  Partnership already exists: ${clientName}`);
      skipped++;
      continue;
    }

    // Create partnership
    await prisma.companyPartnership.create({
      data: {
        id: createId(),
        agencyId: agency.id,
        advertiserId: advertiser.id,
        relationshipType: 'AGENCY_CLIENT',
        isActive: true,
        updatedAt: new Date(),
      }
    });

    console.log(`   ✅ Created partnership: ${clientName}`);
    created++;
  }

  console.log(`\n📊 Summary: Created ${created}, Skipped ${skipped}`);
  console.log('✨ Import complete!');
  await prisma.$disconnect();
}

importMXLocationsNY().catch(console.error);
