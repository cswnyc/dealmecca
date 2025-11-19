import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot109Partnerships() {
  console.log('🔍 Checking Screenshot 109 partnerships...\n');

  const screenshot109Agencies = [
    'Admerasia',
    'StrawberryFrog',
    'RVA Media Group',
    'Karsh/Hagan',
    'DEPT San Diego',
    'Vincodo',
    'The 3rd Eye',
    'Canvas Worldwide Dallas',
    '85Sixty Denver',
    'Delta Media Dallas',
    'The Marketing Practice NY',
    'Hanson Dodge',
    'Odney Fargo',
    'Monks London'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot109Agencies) {
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
  console.log(`   Expected: 36 partnerships (1+3+4+7+0+0+2+2+1+4+1+6+1+4)`);
}

checkScreenshot109Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
