import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot103Partnerships() {
  console.log('🔍 Checking Screenshot 103 partnerships...\n');

  const screenshot103Agencies = [
    'Monks Toronto',
    'HUGE SF',
    'HUGE Portland',
    'Haymaker',
    'Johannes Leonardo',
    'Allied Global Marketing Las Vegas',
    'Culture ONE World',
    'BarkleyOKRP Austin',
    'Home Remodeler SEO',
    'Tandem Theory',
    'Mekanism Seattle',
    'Mekanism NY',
    'Baughn Media Group',
    'Red Comma Media',
    'PriMedia'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot103Agencies) {
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
  console.log(`   Expected: 48 partnerships (1+0+0+0+4+0+4+2+0+3+7+22+1+2+2)`);
}

checkScreenshot103Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
