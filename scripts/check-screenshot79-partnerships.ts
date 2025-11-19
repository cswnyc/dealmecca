import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot79Partnerships() {
  console.log('🔍 Checking Screenshot 79 partnerships...\n');

  const screenshot79Agencies = [
    'Media by Mother',
    'Propellant Media',
    'Blink Advertising',
    'Baldwin&',
    'Joseph Jacobs Advertising',
    'Snowday Agency',
    'Intermark Group Birmingham'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot79Agencies) {
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
  console.log(`   Expected: 10 partnerships (3+3+0+1+1+1+1)`);
}

checkScreenshot79Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
