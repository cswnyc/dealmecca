import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot111Partnerships() {
  console.log('🔍 Checking Screenshot 111 partnerships...\n');

  const screenshot111Agencies = [
    'Iluminere',
    'Jellyfish LA',
    'Manhattan Media Services',
    'Idea Peddler',
    'Prime Time Marketing',
    'The EGC Group NY',
    'Fors Marsh',
    'GS&F',
    'PASHN Media Agency',
    'HUGE London',
    'Venables Bell & Partners',
    'Mindgruve Charleston',
    'Good Giant Mobile',
    'Critical Mass Toronto',
    'MARCA Miami',
    'Mighty Union'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot111Agencies) {
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
  console.log(`   Expected: 30 partnerships (1+5+2+4+0+0+2+3+1+0+1+5+0+5+0+1)`);
}

checkScreenshot111Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
