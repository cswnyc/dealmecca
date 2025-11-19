import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot57Partnerships() {
  console.log('🔍 Checking Screenshot 57 partnerships...\n');

  const screenshot57Agencies = [
    'Eversana InTouch NY',
    'Real Chemistry Boston',
    'Real Chemistry Chicago',
    'Real Chemistry London',
    'Lee Tilford Agency',
    'DEPT NY',
    'Anti Agency Group'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot57Agencies) {
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
  console.log(`   Expected: 11 partnerships (3+1+1+0+0+3+3)`);
}

checkScreenshot57Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
