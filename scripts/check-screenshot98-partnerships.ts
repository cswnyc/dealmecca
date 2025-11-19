import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot98Partnerships() {
  console.log('🔍 Checking Screenshot 98 partnerships...\n');

  const screenshot98Agencies = [
    'Questus LA',
    'SSCG Media Group Princeton',
    'PMG LA',
    'Fintel Connect',
    'milk*',
    'R/GA NY',
    'Riester LA',
    'Blue State Digital NY',
    'Crossmedia Philadelphia'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot98Agencies) {
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
  console.log(`   Expected: 47 partnerships (0+2+21+2+0+9+0+0+13)`);
}

checkScreenshot98Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
