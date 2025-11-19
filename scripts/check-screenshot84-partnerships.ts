import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot84Partnerships() {
  console.log('🔍 Checking Screenshot 84 partnerships...\n');

  const screenshot84Agencies = [
    'Accenture Song Toronto',
    'Real Chemistry Austin',
    'PowerPhyl Media Solutions',
    'Fox Agency',
    'Just Global London',
    'Hot Dish Advertising',
    'Transmission London'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot84Agencies) {
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
  console.log(`   Expected: 8 partnerships (1+0+4+0+1+1+1)`);
}

checkScreenshot84Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
