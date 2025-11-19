#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMilesPartnership() {
  console.log('🔍 Checking Miles Partnership agencies...\n');

  const milesAgencies = await prisma.company.findMany({
    where: {
      companyType: 'AGENCY',
      name: {
        contains: 'Miles Partnership',
        mode: 'insensitive',
      },
    },
    include: {
      CompanyPartnership_agencyIdToCompany: {
        include: {
          advertiser: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  console.log(`Found ${milesAgencies.length} Miles Partnership agencies:\n`);

  for (const agency of milesAgencies) {
    console.log(`📍 ${agency.name} (${agency.city}, ${agency.state})`);
    console.log(`   Partnerships: ${agency.CompanyPartnership_agencyIdToCompany.length}`);

    if (agency.CompanyPartnership_agencyIdToCompany.length > 0) {
      console.log('   Clients:');
      agency.CompanyPartnership_agencyIdToCompany.forEach(p => {
        console.log(`   - ${p.advertiser.name}`);
      });
    }
    console.log();
  }

  await prisma.$disconnect();
}

checkMilesPartnership().catch(console.error);
