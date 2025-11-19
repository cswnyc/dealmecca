#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAgencies() {
  const agenciesToCheck = [
    'Veritone',
    'Wpromote',
    'Innocean',
    'Slingshot',
  ];

  console.log('🔍 Checking for agencies in database...\n');

  for (const name of agenciesToCheck) {
    const agencies = await prisma.company.findMany({
      where: {
        companyType: 'AGENCY',
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      select: {
        name: true,
        city: true,
        state: true,
      },
    });

    if (agencies.length > 0) {
      console.log(`✅ Found ${agencies.length} match(es) for "${name}":`);
      agencies.forEach(a => console.log(`   - ${a.name} (${a.city}, ${a.state})`));
    } else {
      console.log(`❌ No matches found for "${name}"`);
    }
    console.log();
  }

  // Also search for any agencies with "LA" or "Los Angeles" in location
  console.log('🔍 Checking for LA-based agencies in screenshots...\n');

  const laAgencies = await prisma.company.findMany({
    where: {
      companyType: 'AGENCY',
      OR: [
        { city: { contains: 'Los Angeles', mode: 'insensitive' } },
        { city: { contains: 'Culver City', mode: 'insensitive' } },
        { city: { contains: 'Beverly Hills', mode: 'insensitive' } },
      ],
    },
    select: {
      name: true,
      city: true,
      state: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  console.log(`Found ${laAgencies.length} LA-area agencies:`);
  laAgencies.forEach(a => console.log(`   - ${a.name} (${a.city}, ${a.state})`));

  await prisma.$disconnect();
}

checkAgencies().catch(console.error);
