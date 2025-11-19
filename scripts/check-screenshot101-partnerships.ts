import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot101Partnerships() {
  console.log('🔍 Checking Screenshot 101 partnerships...\n');

  const screenshot101Agencies = [
    'Doe-Anderson',
    'Johnson & Sekin',
    'Hashku',
    'Dieste Dallas',
    'Texas Creative',
    'Project X Media Dallas',
    'Zion & Zion',
    'Ideon Media',
    'Gambit Strategies'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot101Agencies) {
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
  console.log(`   Expected: 24 partnerships (7+1+1+4+0+4+4+0+3)`);
}

checkScreenshot101Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
