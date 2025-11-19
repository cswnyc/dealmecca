import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot93Partnerships() {
  console.log('🔍 Checking Screenshot 93 partnerships...\n');

  const screenshot93Agencies = [
    'Pappas_DMI DC',
    'Sid Lee Toronto',
    'lg2 Montreal',
    'Lavidge Company',
    'rEvolution Marketing Chicago',
    'AMP LA',
    'Net Conversion',
    'Quench Agency Harrisburg',
    'Fitzco Atlanta',
    'Mindgruve LA'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot93Agencies) {
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
  console.log(`   Expected: 20 partnerships (0+1+0+2+6+1+4+0+6+0)`);
}

checkScreenshot93Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
