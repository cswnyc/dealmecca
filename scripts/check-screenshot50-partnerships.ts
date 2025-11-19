import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot50Partnerships() {
  console.log('🔍 Checking Screenshot 50 partnerships...\n');

  const screenshot50Agencies = [
    '160over90 Chicago',
    'BSSP SF',
    'GDC Marketing & Ideation',
    'KSV NY',
    'Medium Giant',
    'MOI Global NY'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot50Agencies) {
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
}

checkScreenshot50Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
