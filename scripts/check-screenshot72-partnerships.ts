import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot72Partnerships() {
  console.log('🔍 Checking Screenshot 72 partnerships...\n');

  const screenshot72Agencies = [
    'Mekanism Vancouver',
    'Media Works Baltimore',
    'TCAA Cincinnati',
    '3Headed Monster',
    'Plug Talk Media',
    'Plein Air Agency'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot72Agencies) {
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
  console.log(`   Expected: 18 partnerships (2+9+1+1+2+3)`);
}

checkScreenshot72Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
