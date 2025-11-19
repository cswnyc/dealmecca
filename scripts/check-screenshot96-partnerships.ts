import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot96Partnerships() {
  console.log('🔍 Checking Screenshot 96 partnerships...\n');

  const screenshot96Agencies = [
    'Loudr Agency West Palm Beach',
    'Jellyfish Baltimore',
    'Strategic Media Inc.',
    'Adopter Media',
    'MGH',
    'RWest Portland',
    'Campfire NY',
    'Mediaworks Ireland',
    'NitroC Group',
    'The Community UK'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot96Agencies) {
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
  console.log(`   Expected: 17 partnerships (0+5+2+7+1+2+0+0+0+0)`);
}

checkScreenshot96Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
