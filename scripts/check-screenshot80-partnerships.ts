import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot80Partnerships() {
  console.log('🔍 Checking Screenshot 80 partnerships...\n');

  const screenshot80Agencies = [
    'The New Media Firm',
    'Tatari NY',
    'Horizon Sports & Experiences NY',
    'Converge NY',
    'Rethink Toronto',
    'Dirigo Collective'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot80Agencies) {
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
  console.log(`   Expected: 16 partnerships (6+5+4+0+1+0)`);
}

checkScreenshot80Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
