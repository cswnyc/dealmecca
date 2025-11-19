import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot110Partnerships() {
  console.log('🔍 Checking Screenshot 110 partnerships...\n');

  const screenshot110Agencies = [
    'Basis Technologies Chicago',
    'Vision Media',
    'Veritas Media Group',
    'Transmission NY',
    'Mindgruve NY',
    'Mars United Commerce NY',
    'Situation Interactive',
    'Strategic Media Services',
    'The Wilson Group',
    'Eversana Intouch Solutions NY',
    'LMO Advertising DC',
    'Powers of Reasoning',
    'Wilkins Media Milwaukee',
    'R&R Partners Phoenix'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot110Agencies) {
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
  console.log(`   Expected: 49 partnerships (2+2+6+1+0+6+5+2+2+3+2+1+15+2)`);
}

checkScreenshot110Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
