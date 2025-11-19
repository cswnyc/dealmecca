import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot71Partnerships() {
  console.log('🔍 Checking Screenshot 71 partnerships...\n');

  const screenshot71Agencies = [
    'Klick Health NY',
    'Accenture Song Atlanta',
    'Accenture Song Chicago',
    'Accenture Song NY',
    'Stein IAS NY',
    'Cossette Vancouver'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot71Agencies) {
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
  console.log(`   Expected: 12 partnerships (4+1+1+2+1+4)`);
}

checkScreenshot71Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
