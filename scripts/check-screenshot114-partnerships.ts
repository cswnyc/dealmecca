import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkScreenshot114Partnerships() {
  console.log('🔍 Checking Screenshot 114 partnerships...\n');

  const screenshot114Agencies = [
    'Deeplocal',
    'Interbrand NY',
    'Brogan & Partners Detroit',
    'cairns oneil strategic media',
    'VCCP UK',
    'TouchPoint Integrated Communications',
    'Inception Marketing',
    'GSW NY',
    'Rebel Street',
    'ICF Next Minneapolis',
    'SS+K NY',
    'New Standard',
    'Omnivore Milwaukee',
    'Albion',
    'The Community FL',
    'Saxton Horne',
    'Bernstein-Rein',
    'Pulsar Advertising LA'
  ];

  let totalPartnerships = 0;

  for (const agencyName of screenshot114Agencies) {
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
  console.log(`   Expected: 12 partnerships (0+3+5+0+0+0+0+0+0+0+0+0+0+0+3+0+1+0)`);
}

checkScreenshot114Partnerships()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
