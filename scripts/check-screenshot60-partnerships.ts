import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot60Partnerships() {
  console.log('🔍 Checking Screenshot 60 partnerships...\n');

  const screenshot60Agencies = [
    'Project X Media LA',
    'Anchor Trading',
    'Chief Media',
    'Powers Interactive'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot60Agencies) {
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
  console.log(`   Expected: 31 partnerships (18+8+3+2)`);
}

checkScreenshot60Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
