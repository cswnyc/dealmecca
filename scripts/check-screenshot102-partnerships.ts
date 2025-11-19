import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot102Partnerships() {
  console.log('🔍 Checking Screenshot 102 partnerships...\n');

  const screenshot102Agencies = [
    'PartnerCentric, Inc.',
    'mediashark',
    'Ackerman McQueen Oklahoma City',
    'GUT Buenos Aires',
    'MMGY Detroit',
    'Diray Media',
    '14th & Boom NY',
    'Billups SF'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot102Agencies) {
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
  console.log(`   Expected: 65 partnerships (41+2+0+1+2+3+0+16)`);
}

checkScreenshot102Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
