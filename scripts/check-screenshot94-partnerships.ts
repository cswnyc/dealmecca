import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot94Partnerships() {
  console.log('🔍 Checking Screenshot 94 partnerships...\n');

  const screenshot94Agencies = [
    'Bounteous Atlanta',
    'Wpromote Atlanta',
    'Infinity Marketing',
    'rygr',
    'Starmark',
    'Cundari Toronto',
    'Wieden + Kennedy London',
    'KSM South',
    'Casual Astronaut'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot94Agencies) {
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
  console.log(`   Expected: 40 partnerships (25+1+1+5+1+0+0+7+0)`);
}

checkScreenshot94Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
