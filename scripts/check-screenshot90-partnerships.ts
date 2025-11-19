import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot90Partnerships() {
  console.log('🔍 Checking Screenshot 90 partnerships...\n');

  const screenshot90Agencies = [
    'Gravity Global London',
    'Martin Retail Atlanta',
    'Decoded Advertising LA',
    'Decoded Advertising Toronto',
    'Red Circle Minneapolis',
    'Media Bridge Advertising',
    'The Hyland Effect',
    'Right Side Up'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot90Agencies) {
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
  console.log(`   Expected: 43 partnerships (7+5+5+1+2+3+9+11)`);
}

checkScreenshot90Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
