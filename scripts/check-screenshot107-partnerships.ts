import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot107Partnerships() {
  console.log('🔍 Checking Screenshot 107 partnerships...\n');

  const screenshot107Agencies = [
    'wedu',
    'TravelDesk London',
    'Petrol Advertising',
    'Billups Atlanta',
    'Opinionated',
    'USIM LA',
    'The Variable',
    'Love Advertising',
    'Wpromote Denver',
    'Canvas Worldwide Atlanta',
    'Inizio Evoke SF',
    'Liquid Advertising LA',
    'RPA Dallas'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot107Agencies) {
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
  console.log(`   Expected: 42 partnerships (0+1+2+12+3+3+1+1+2+5+0+10+2)`);
}

checkScreenshot107Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
