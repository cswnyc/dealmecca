#!/usr/bin/env npx tsx
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

async function checkAll() {
  console.log('🔍 Checking all 49 independent agencies for partnership data...\n');

  const results: Array<{ name: string; total: number; hasOldData: boolean }> = [];

  for (const agencyName of ourAgencies) {
    const agency = await prisma.company.findFirst({
      where: { name: { contains: agencyName, mode: 'insensitive' } },
      select: { id: true, name: true }
    });

    if (!agency) {
      console.log(`❌ Not found: ${agencyName}`);
      continue;
    }

    const partnerships = await prisma.companyPartnership.findMany({
      where: { agencyId: agency.id },
      select: { createdAt: true, advertiser: { select: { name: true } } }
    });

    // Check if they have partnerships created around 00:32 today (suspicious timing)
    const suspiciousCount = partnerships.filter(p => {
      const hour = p.createdAt.getHours();
      const date = p.createdAt.toISOString().split('T')[0];
      return date === '2025-10-29' && hour === 7; // UTC hour 7 = PDT hour 0 (midnight)
    }).length;

    const hasOldData = suspiciousCount > 50; // If more than 50 partnerships from that time, likely has old data

    results.push({
      name: agency.name,
      total: partnerships.length,
      hasOldData
    });
  }

  // Sort by total partnerships descending
  results.sort((a, b) => b.total - a.total);

  console.log('\n📊 Results (sorted by total partnerships):');
  console.log('═══════════════════════════════════════════════════════\n');

  const withOldData = results.filter(r => r.hasOldData);
  const cleanData = results.filter(r => !r.hasOldData);

  if (withOldData.length > 0) {
    console.log('🚨 AGENCIES WITH OLD/SUSPICIOUS DATA:\n');
    withOldData.forEach(r => {
      console.log(`   ❌ ${r.name}: ${r.total} partnerships`);
    });
    console.log('');
  }

  console.log('✅ AGENCIES WITH CLEAN DATA (screenshot only):\n');
  cleanData.forEach(r => {
    console.log(`   ✅ ${r.name}: ${r.total} partnerships`);
  });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`\nSummary: ${withOldData.length} agencies with old data, ${cleanData.length} with clean data`);

  await prisma.$disconnect();
}

checkAll().catch(console.error);
