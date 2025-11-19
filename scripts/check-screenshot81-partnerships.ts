import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot81Partnerships() {
  console.log('🔍 Checking Screenshot 81 partnerships...\n');

  const screenshot81Agencies = [
    'Epitaph Group',
    'FUSE Create',
    'Matrix Media',
    'Accenture Song Philadelphia',
    'The Abbi Agency Las Vegas',
    'Grapeseed Media',
    'MERGE NY'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot81Agencies) {
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
  console.log(`   Expected: 17 partnerships (4+0+9+0+1+2+1)`);
}

checkScreenshot81Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
