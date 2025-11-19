import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot97Partnerships() {
  console.log('🔍 Checking Screenshot 97 partnerships...\n');

  const screenshot97Agencies = [
    'hunterblu media Miami',
    'Silverbean UK',
    'Monks SF',
    'Austin Williams',
    'Two by Four Chattanooga',
    'Tinuiti Atlanta',
    'Direct Persuasion',
    'Fathom Cleveland',
    'Questus SF',
    'Tinuiti Boston'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot97Agencies) {
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
  console.log(`   Expected: 25 partnerships (10+1+3+0+0+5+1+0+1+4)`);
}

checkScreenshot97Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
