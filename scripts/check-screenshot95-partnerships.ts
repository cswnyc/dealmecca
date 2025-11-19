import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot95Partnerships() {
  console.log('🔍 Checking Screenshot 95 partnerships...\n');

  const screenshot95Agencies = [
    'VI Marketing and Branding OK',
    'McFadden/Gavender',
    'MediaMax',
    'Sly Fox',
    'MDB Communications',
    'M-Marketing Consultants, LLC',
    'Marketing Architects',
    'Omni Advertising',
    'Talon Outdoor London',
    'Mintz + Hoke'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot95Agencies) {
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
  console.log(`   Expected: 14 partnerships (0+0+1+2+0+1+7+1+1+1)`);
}

checkScreenshot95Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
