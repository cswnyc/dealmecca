import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot88Partnerships() {
  console.log('🔍 Checking Screenshot 88 partnerships...\n');

  const screenshot88Agencies = [
    'Spurrier Group',
    'The Social Shepherd',
    'Ologie',
    'KSM Chicago',
    'Dalton Agency Jacksonville',
    'SMZ',
    'Riester Phoenix',
    'Accenture Song Miami',
    'Wonderful Agency'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot88Agencies) {
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
  console.log(`   Expected: 25 partnerships (9+0+0+7+3+3+2+0+1)`);
}

checkScreenshot88Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
