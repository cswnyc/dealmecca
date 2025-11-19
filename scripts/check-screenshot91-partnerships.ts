import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot91Partnerships() {
  console.log('🔍 Checking Screenshot 91 partnerships...\n');

  const screenshot91Agencies = [
    'Mekanism Montreal',
    'JL Media',
    'Media Mogul',
    'redpepper Nashville',
    'FlexPoint',
    'Sagent',
    '9Letters',
    'GUT Toronto',
    'Walker Sands Communications Chicago'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot91Agencies) {
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
  console.log(`   Expected: 28 partnerships (8+2+1+0+4+4+8+0+1)`);
}

checkScreenshot91Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
