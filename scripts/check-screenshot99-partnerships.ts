import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot99Partnerships() {
  console.log('🔍 Checking Screenshot 99 partnerships...\n');

  const screenshot99Agencies = [
    'Media Plus+',
    'Apollo Partners',
    'CTI Media',
    'Edge Marketing Chicago',
    'Spinutech',
    'Blue State Digital SF',
    'Moosylvania',
    'Warschawski Baltimore',
    'gMedia',
    'Adfero',
    'GWA'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot99Agencies) {
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
  console.log(`   Expected: 9 partnerships (2+6+0+0+0+0+0+1+0+0+0)`);
}

checkScreenshot99Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
