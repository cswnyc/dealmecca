import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot85Partnerships() {
  console.log('🔍 Checking Screenshot 85 partnerships...\n');

  const screenshot85Agencies = [
    'Ways & Means SF',
    'GSE Chicago',
    'Designit Seattle',
    'SALUK&CO',
    'True Media Minneapolis',
    'Space150 Minneapolis'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot85Agencies) {
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
  console.log(`   Expected: 19 partnerships (2+1+2+2+7+5)`);
}

checkScreenshot85Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
