import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot49Partnerships() {
  console.log('🔍 Checking Screenshot 49 partnerships...\n');

  const screenshot49Agencies = [
    'GRP Media',
    'GMR Marketing SF',
    'TDW + Co LA',
    '160over90 NY'
  ];

  for (const agencyName of screenshot49Agencies) {
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

    if (agency.CompanyPartnership_agencyIdToCompany.length > 0) {
      console.log(`   Advertisers:`);
      agency.CompanyPartnership_agencyIdToCompany.forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.advertiser.name}`);
      });
    }
    console.log('');
  }
}

checkScreenshot49Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
