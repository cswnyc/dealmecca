#!/usr/bin/env npx tsx
/**
 * Clean all partnerships for the 49 independent agencies and re-import only screenshot data
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Our 49 agencies from screenshots
const ourAgencies = [
  'Horizon Media NY', 'Tinuiti LA', 'Kepler Group Philadelphia', 'Tinuiti NY',
  'Miles Partnership Denver', 'Power Digital', 'Duncan Channon', 'Fundamental Media Boston',
  'PMG Dallas', 'Intelligent Demand', 'WITHIN', 'Pinnacle Advertising Chicago',
  'Talon Outdoor NY', 'EssenceMediacom Bangalore', 'Wpromote NY', 'Billups NY',
  'Quan Media Group', 'GroupeConnect Boston', 'GroupeConnect Chicago', 'Cannonball Agency',
  'USIM NY', 'Horizon Next NY', 'Good Apple Digital Las Vegas', 'Bold Orange',
  'Canvas Worldwide LA', 'Real Chemistry NY', 'Good Apple Digital NY', 'Horizon Media LA',
  'Novus Media Chicago', 'Realm B2B', 'Billups Chicago', 'PMG Fort Worth',
  'Fingerpaint Philadelphia', 'Cossette Toronto', 'WPP Unite', 'ROI DNA',
  'Haworth Minneapolis', 'Project X Media NY', 'Curious Plot', 'LT Phoenix',
  'Benedict Advertising', 'Ovative/group Minneapolis', 'Gravity Global Minneapolis', 'Known NY',
  'PMG Austin', 'Bully Pulpit Interactive DC', 'Bully Pulpit Interactive NY', 'Brainlabs',
  '22squared Atlanta'
];

async function cleanAndReimport() {
  console.log('🧹 Cleaning partnerships for 49 independent agencies...\n');

  let totalDeleted = 0;

  for (const agencyName of ourAgencies) {
    const agency = await prisma.company.findFirst({
      where: { name: { contains: agencyName, mode: 'insensitive' } },
      select: { id: true, name: true }
    });

    if (!agency) {
      console.log(`❌ Not found: ${agencyName}`);
      continue;
    }

    const deleted = await prisma.companyPartnership.deleteMany({
      where: { agencyId: agency.id }
    });

    console.log(`   🗑️  ${agency.name}: deleted ${deleted.count} partnerships`);
    totalDeleted += deleted.count;
  }

  console.log(`\n✅ Total deleted: ${totalDeleted} partnerships\n`);
  console.log('Now re-run the import script to load only screenshot data:');
  console.log('npx tsx scripts/import-independent-agencies-with-partnerships.ts');

  await prisma.$disconnect();
}

cleanAndReimport().catch(console.error);
