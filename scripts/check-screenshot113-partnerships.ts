import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot113Partnerships() {
  console.log('🔍 Checking Screenshot 113 partnerships...\n');

  const screenshot113Agencies = [
    'The Atkins Group Dallas',
    'iCrossing NY',
    'Yard',
    'UEG NY',
    'Conquer Media',
    'NSG/SWAT',
    'Infectious Media UK',
    'EMC Outdoor',
    'Dailey',
    'Pereira & O\'Dell SF',
    'Host Sydney',
    'LKH&S',
    'Socialissssima',
    'T4G Kick Halifax',
    'Zehnder New Orleans',
    'Badger & Winters',
    'LiquidThread Chicago'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot113Agencies) {
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
  console.log(`   Expected: 26 partnerships (0+0+0+3+0+0+0+10+0+9+0+0+0+0+3+0+1)`);
}

checkScreenshot113Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
