import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot112Partnerships() {
  console.log('🔍 Checking Screenshot 112 partnerships...\n');

  const screenshot112Agencies = [
    'Eicoff',
    'Yesler Seattle',
    'AMP Chicago',
    'GSW Toronto',
    'MUH-TAY-ZIK / HOF-FER San Francisco',
    'Code3',
    'trevor//peter communications',
    'Munn Rabot',
    'WMX Honolulu',
    'David&Goliath',
    'Anthology Honolulu',
    'Nice Dog Media',
    'Flourish Digital & Direct Marketing Sydney',
    'BarkleyOKRP Chicago',
    'Curiosity Advertising',
    'Forge Worldwide',
    'TDA_Boulder'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot112Agencies) {
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
  console.log(`   Expected: 25 partnerships (2+0+2+0+1+0+0+0+0+3+0+0+0+3+10+0+4)`);
}

checkScreenshot112Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
