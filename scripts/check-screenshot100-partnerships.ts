import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot100Partnerships() {
  console.log('🔍 Checking Screenshot 100 partnerships...\n');

  const screenshot100Agencies = [
    'Hoffman York',
    'Osborn Barr St. Louis',
    'Avail Media',
    'Wilkins Media LA',
    'cj Advertising',
    'redpepper Atlanta',
    'Drake Cooper Boise',
    'Doe-Anderson'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot100Agencies) {
    const agency = await prisma.company.findFirst({
      where: { name: agencyName },
      include: {
        CompanyPartnership_agencyIdToCompany: {
          include: {
            advertiser: true
          }
        }
      }
    });

    if (!agency) {
      console.log(`❌ Agency not found: ${agencyName}\n`);
      continue;
    }

    console.log(`✅ ${agencyName} (${agency.city}, ${agency.state})`);
    console.log(`   ID: ${agency.id}`);
    console.log(`   Slug: ${agency.slug}`);
    console.log(`   Partnerships: ${agency.CompanyPartnership_agencyIdToCompany.length}`);
    totalPartnerships += agency.CompanyPartnership_agencyIdToCompany.length;

    if (agency.CompanyPartnership_agencyIdToCompany.length > 0) {
      console.log(`   Advertisers:`);
      agency.CompanyPartnership_agencyIdToCompany.forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.advertiser.name}`);
      });
    }
    console.log('');
  }

  console.log(`\n📊 Total partnerships: ${totalPartnerships}`);
  console.log(`   Expected: 31 partnerships (10+1+4+12+0+0+1+3)`);
}

checkScreenshot100Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
