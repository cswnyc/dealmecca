import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot105Partnerships() {
  console.log('🔍 Checking Screenshot 105 partnerships...\n');

  const screenshot105Agencies = [
    'Dieste LA',
    '8SSixty San Diego',
    'MERGE Boston',
    'Zero Gravity Marketing',
    'Cooper Smith NY',
    'Eversana Intouch Solutions Kansas City',
    'Klick Health Chicago',
    'Chemistry Pittsburgh',
    '160over90 Charlotte',
    'Yes& Agency',
    'Coyne PR NY',
    'Coyne PR Newark',
    'MERGE Kansas City',
    'ICON International Ft. Lauderdale',
    'MBuy Chicago',
    'Stratocomm DC'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot105Agencies) {
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
  console.log(`   Expected: 25 partnerships (1+1+2+1+0+1+2+2+4+3+0+0+0+5+2+1)`);
}

checkScreenshot105Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
