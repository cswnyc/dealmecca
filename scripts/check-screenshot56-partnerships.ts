import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot56Partnerships() {
  console.log('🔍 Checking Screenshot 56 partnerships...\n');

  const screenshot56Agencies = [
    'Crossmedia LA',
    'Ken Media',
    'The Influencer Marketing Factory',
    'Precision AQ UK',
    'Eversana InTouch Chicago',
    'Eversana InTouch Kansas City'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot56Agencies) {
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
  console.log(`   Expected: 20 partnerships (10+5+0+0+3+2)`);
}

checkScreenshot56Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
