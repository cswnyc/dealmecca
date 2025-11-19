#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';
import { verifiedAgencies } from './verified-independent-agencies-data';

const prisma = new PrismaClient();

async function importVerified() {
  console.log('🚀 Importing verified independent agencies...\n');

  for (const data of verifiedAgencies) {
    // Find agency
    const agency = await prisma.company.findFirst({
      where: { name: { contains: data.agency, mode: 'insensitive' } }
    });

    if (!agency) {
      console.log(`❌ Agency not found: ${data.agency}`);
      continue;
    }

    console.log(`\n📍 ${agency.name} (${data.city}, ${data.state})`);
    console.log(`   Creating ${data.clients.length} partnerships...`);

    let created = 0;
    let skipped = 0;

    for (const clientName of data.clients) {
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
      }

      // Check if partnership exists
      const existing = await prisma.companyPartnership.findFirst({
        where: {
          agencyId: agency.id,
          advertiserId: advertiser.id
        }
      });

      if (existing) {
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

      created++;
    }

    console.log(`   ✅ Created: ${created}, Skipped: ${skipped}`);
  }

  console.log('\n✨ Import complete!');
  await prisma.$disconnect();
}

importVerified().catch(console.error);
