import { prisma } from '../lib/prisma';

async function checkCompanyTypes() {
  const companies = await prisma.company.findMany({
    select: {
      name: true,
      companyType: true,
      agencyType: true
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('📊 All Companies:\n');
  companies.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name}`);
    console.log(`   Type: ${c.companyType}${c.agencyType ? ' / ' + c.agencyType : ''}`);
  });

  console.log(`\n📈 Summary:`);
  console.log(`Total: ${companies.length}`);

  const agencies = companies.filter(c =>
    c.companyType?.includes('AGENCY') ||
    c.companyType === 'HOLDING_COMPANY_AGENCY' ||
    c.companyType === 'MEDIA_HOLDING_COMPANY'
  );

  const advertisers = companies.filter(c => c.companyType === 'ADVERTISER');
  const others = companies.filter(c =>
    !c.companyType?.includes('AGENCY') &&
    c.companyType !== 'HOLDING_COMPANY_AGENCY' &&
    c.companyType !== 'MEDIA_HOLDING_COMPANY' &&
    c.companyType !== 'ADVERTISER'
  );

  console.log(`Agencies: ${agencies.length}`);
  console.log(`Advertisers: ${advertisers.length}`);
  console.log(`Others: ${others.length}`);

  if (others.length > 0) {
    console.log(`\n⚠️  Non-agency companies:`);
    others.forEach(c => {
      console.log(`   - ${c.name} (${c.companyType})`);
    });
  }

  await prisma.$disconnect();
}

checkCompanyTypes().catch(console.error);
