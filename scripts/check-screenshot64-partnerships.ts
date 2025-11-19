import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot64Partnerships() {
  console.log('🔍 Checking Screenshot 64 partnerships...\n');

  const screenshot64Agencies = [
    'SixSpeed',
    'JPA Health',
    'CultHealth NY',
    'obsessed media',
    'Monks LA',
    'Partners + Napier Rochester'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot64Agencies) {
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
  console.log(`   Expected: 31 partnerships (3+1+0+0+23+2)`);
}

checkScreenshot64Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
