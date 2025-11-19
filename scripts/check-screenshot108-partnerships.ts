import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot108Partnerships() {
  console.log('🔍 Checking Screenshot 108 partnerships...\n');

  const screenshot108Agencies = [
    'RPA Dallas',
    'Tinuiti Ft. Lauderdale',
    'Flowers Communications Group',
    'Madden Media Tucson',
    'HUGE NY',
    'Collective Measures',
    'BRUNNER Atlanta',
    'Walrus',
    'USIM Chicago',
    'January Digital Dallas',
    'Billups Denver',
    'Pink Rebel Media',
    'Mars United Commerce Detroit',
    'Hot Lava°'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot108Agencies) {
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
  console.log(`   Expected: 46 partnerships (2 existing RPA Dallas + 1+1+6+0+4+2+1+2+5+7+0+14+1)`);
}

checkScreenshot108Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
