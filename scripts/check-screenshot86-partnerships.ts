import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot86Partnerships() {
  console.log('🔍 Checking Screenshot 86 partnerships...\n');

  const screenshot86Agencies = [
    'Murphy Media Group',
    'BVK Kansas City',
    'Wilkins Media Atlanta',
    '22squared Tampa',
    'Beacon Media Group'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot86Agencies) {
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
  console.log(`   Expected: 18 partnerships (2+3+6+6+1)`);
}

checkScreenshot86Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
