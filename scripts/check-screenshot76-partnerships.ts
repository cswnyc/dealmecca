import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot76Partnerships() {
  console.log('🔍 Checking Screenshot 76 partnerships...\n');

  const screenshot76Agencies = [
    'Hydrogen Advertising',
    'Lockard & Wechsler Direct',
    'MBT Marketing',
    'Broadhead',
    'Critical Mass Chicago'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot76Agencies) {
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
  console.log(`   Expected: 23 partnerships (0+8+0+2+13)`);
}

checkScreenshot76Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
