import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot115Partnerships() {
  console.log('🔍 Checking Screenshot 115 partnerships...\n');

  const screenshot115Agencies = [
    'Alley Group LA',
    'Boelter + Lincoln',
    'Crossmedia UK',
    'SperoMedia',
    'Bensimon Byrne',
    'Escape Pod',
    'Mother NY',
    'Mediasspot',
    'New Heartland Group',
    'MBMG',
    'Concept Farm',
    'Gaggi Media',
    'VIA Agency',
    'Morning Walk Chicago',
    'Translation NY'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot115Agencies) {
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
  console.log(`   Expected: 31 partnerships (0+3+2+12+4+0+4+3+0+2+0+0+0+0+1)`);
}

checkScreenshot115Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
