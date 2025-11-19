import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot117Partnerships() {
  console.log('🔍 Checking Screenshot 117 partnerships...\n');

  const screenshot117Agencies = [
    'Mother London',
    'Planet Central Richmond',
    'Partners + Napier NYC',
    'Iced Media',
    'True Media Columbia',
    'French/West/Vaughan',
    'Ignited LA',
    'SEEZ',
    'Tier10 Marketing DC',
    'Luckie & Company Birmingham',
    'Merlino Media',
    'RQ Agency',
    'MERGE LA',
    'Big Village NY',
    'The DuMont Project',
    'Moroch Milwaukee',
    'AnalogFolk UK',
    'One Nine Media'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot117Agencies) {
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
  console.log(`   Expected: 12 partnerships (0+0+1+0+0+1+3+0+0+1+0+0+0+6+0+0+0+0)`);
}

checkScreenshot117Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
