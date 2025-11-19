import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot89Partnerships() {
  console.log('🔍 Checking Screenshot 89 partnerships...\n');

  const screenshot89Agencies = [
    'Critical Mass LA',
    'DELVE',
    'ODN Minneapolis',
    'Schaefer Advertising Co.',
    'luxe collective group',
    'Cyrid Media',
    'Anchor Worldwide NY',
    'Gate Worldwide NY'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot89Agencies) {
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
  console.log(`   Expected: 45 partnerships (5+4+13+0+11+1+4+7)`);
}

checkScreenshot89Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
