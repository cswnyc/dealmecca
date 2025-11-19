import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot104Partnerships() {
  console.log('🔍 Checking Screenshot 104 partnerships...\n');

  const screenshot104Agencies = [
    'PriMedia',
    'Brunswick Group',
    'The Marketing Practice Denver',
    'Grady Britton',
    'Tierra Agency',
    'Generator Media+Analytics Costa Mesa',
    'Bloom Ads',
    'Intertrend Communications LA',
    'Creative Artists Agency',
    'GYK Antler Boston',
    'Brandon Agency Charlotte',
    'Cooper Smith Toledo',
    'New Engen Mukilteo',
    'the7stars London'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot104Agencies) {
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
  console.log(`   Expected: 60 partnerships (2 existing PriMedia + 0 + 2 + 2 + 0 + 2 + 4 + 1 + 4 + 8 + 1 + 0 + 34 + 0)`);
}

checkScreenshot104Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
