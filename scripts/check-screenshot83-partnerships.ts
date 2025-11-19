import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot83Partnerships() {
  console.log('🔍 Checking Screenshot 83 partnerships...\n');

  const screenshot83Agencies = [
    'BarkleyOKRP Kansas City',
    'Inizio Evoke NY',
    'MarCom Group',
    'Burrell Communications Dallas'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot83Agencies) {
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
  console.log(`   Expected: 34 partnerships (28+5+0+1)`);
}

checkScreenshot83Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
