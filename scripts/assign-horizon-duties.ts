import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

// Duty name to ID mapping (from API)
const dutyIds: Record<string, string> = {
  'AOR': 'cmhxxxnod0003s8u2y00jcwsh',
  'Analytics': 'cmhxxxtpt0004s8u2sg0x7plu',
  'Arizona': 'fncvmcwj4m3unmpoxf7972l4',
  'Branded Content': 'v6uh9o3liramyuicwkrs54ry',
  'Branding': 'lib83gguvazudt4ft9j0sz24',
  'Buying': 'cmhxxwfcq0000s8u2wqi0a5tj',
  'Creative': 'cmhxxxbpj0002s8u2luz3nu24',
  'DOOH': 'qfd1b5ttl399tfninfz3n7ou',
  'Digital Audio': 'c81ngf27an1doigxcekllhrz',
  'Digital': 'gfqi2ragfryqyfhbj459hoeq',
  'Direct Response': 'vp1av85hljq4vbb8go8ut0zf',
  'Display': 'dhk7iwao8au6804xzh56r67v',
  'Event Sponsorship': 'p5gmyb2njgiuc40ncncs9ged',
  'Finance': 'z782qspdtj6mvz5tuc5fsta9',
  'Local': 'zum4sf0fbsb8ryaav7v8eeng',
  'Lower-Funnel': 'kvtz3we9l8icbfhq5bzfpt3r',
  'Mobile': 'ee75ly25d6xtswkwjajnzbf5',
  'Multicultural': 'scg1nklrcbofrzu3llb8ok9o',
  'National': 'a4fre6hv6pp9vli0dc097l4l',
  'OOH': 'psj45eby3inttqvvpw3zzrlo',
  'OTT / CTV': 'sunmu3antqxd2fc5bflcnq9f',
  'PR': 'cmhxxy1030005s8u21o2peof8',
  'Planning': 'cmhwn35gz0000s8ieghpwgp8j',
  'Podcast': 'aetlney7ajru62465soeu7ry',
  'Print': 'xmum0qm39nogv6ex2q0hzn25',
  'Programmatic': 'kj5vrt39o7v4kqpxwze3psff',
  'Radio': 'zvbfxqemz8jgpy6qkptx5od1',
  'Regional': 'exhn89zqsyuuyr23og1sn2f5',
  'Search': 'k4othruaq2f9wafl2hkh4ul5',
  'Social Media': 'anfp73okbkk830ohcgenfecs',
  'Strategy': 'cmhxxx2i50001s8u27ewnmque',
  'TV': 'k3e7a7nu8batlvauadorjf22',
  'Upper-Funnel': 'girmtc38yuhv6m0xgmcpv5to',
  'Video': 'zehahouwqwrgmuu5g7s5k7fz',
};

// Agency assignments based on SellerCrowd screenshot
const agencyDuties: Record<string, string[]> = {
  // Horizon Media NY - Full service, extensive handles
  'bq3gsylrbmoij4kusiy4vzdg': [
    'Analytics', 'AOR', 'Arizona', 'Branded Content', 'Branding', 'Buying', 'Creative',
    'Digital', 'Digital Audio', 'Direct Response', 'Display', 'DOOH', 'Event Sponsorship',
    'Finance', 'Local', 'Lower-Funnel', 'Mobile', 'Multicultural', 'National', 'OOH',
    'OTT / CTV', 'Planning', 'Podcast', 'Print', 'Programmatic', 'Radio', 'Regional',
    'Search', 'Social Media', 'Strategy', 'TV', 'Upper-Funnel', 'Video'
  ],

  // Horizon Media LA - Similar to NY
  'kstfgqlv5rlk01nr8acvncu0': [
    'Analytics', 'AOR', 'Branded Content', 'Branding', 'Buying', 'Creative',
    'Digital', 'Digital Audio', 'Direct Response', 'Display', 'DOOH', 'Event Sponsorship',
    'Local', 'Lower-Funnel', 'Mobile', 'Multicultural', 'National', 'OOH',
    'OTT / CTV', 'Planning', 'Podcast', 'Print', 'Programmatic', 'Radio', 'Regional',
    'Search', 'Social Media', 'Strategy', 'TV', 'Upper-Funnel', 'Video'
  ],

  // Horizon Media Chicago - Programmatic, Video focus
  'z3vfez4t46fkwwwqio3nq09n': [
    'Programmatic', 'Video'
  ],

  // Horizon Media Toronto
  'gcfj5a1plbl2aaq2cikiyb68': [
    'Analytics', 'Buying', 'Digital', 'Display', 'Programmatic', 'Social Media', 'Video'
  ],

  // 305 Worldwide NY
  'cogw2yfohmia55lhhk61t3d2': [
    'Analytics', 'Buying', 'Digital', 'Display', 'Mobile', 'Programmatic', 'Social Media', 'Video'
  ],

  // 305 Worldwide Miami
  'lwydd43ek57zidtzfoh9x7o8': [
    'Analytics', 'Buying', 'Digital', 'Display', 'Mobile', 'Programmatic', 'Social Media', 'Video'
  ],

  // Horizon Commerce NY
  'pr8hxph6n7dvmus3bzwn77mh': [
    'Analytics', 'Digital', 'Search', 'Social Media', 'Programmatic'
  ],

  // Night Market NY
  'vpde3x4486fwywfmu2wx07x8': [
    'Analytics', 'Buying', 'Digital', 'Display', 'Programmatic', 'Social Media', 'Video'
  ],

  // Horizon Media Boston
  'lepeyutywh4lat6hazcqo9z7': [
    'Analytics', 'Buying', 'Digital', 'Display', 'Local', 'Planning', 'Programmatic',
    'Regional', 'Social Media', 'Strategy', 'Video'
  ],

  // Big (NY)
  'rkp88023ehtd9nl9hzszhbe1': [
    'Analytics', 'Branded Content', 'Creative', 'Digital', 'Social Media', 'Strategy', 'Video'
  ],

  // Treehouse NY
  'w76bqlzdnfkfsn6q1pc31xeb': [
    'Analytics', 'Digital', 'Programmatic', 'Social Media', 'Video'
  ],

  // Treehouse LA
  'youth9vk0lafv3jox4w79v48': [
    'Analytics', 'Digital', 'Programmatic', 'Social Media', 'Video'
  ],

  // Horizon Media San Diego
  'rilzgqjr5xjgs6cvn3fg3a46': [
    'Analytics', 'Buying', 'Digital', 'Display', 'Local', 'Planning', 'Programmatic',
    'Regional', 'Social Media', 'Video'
  ],

  // Horizon Next Chicago
  'm3xs34x90af8v9qfahqcss2f': [
    'Analytics', 'Digital', 'Programmatic', 'Social Media'
  ],
};

async function main() {
  console.log('Assigning duties to Horizon Media agencies...\n');

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const [companyId, duties] of Object.entries(agencyDuties)) {
    // Get company name
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true }
    });

    if (!company) {
      console.log(`Company ${companyId} not found, skipping...`);
      continue;
    }

    console.log(`\n--- ${company.name} ---`);

    // Get existing duties for this company
    const existingDuties = await prisma.companyDuty.findMany({
      where: { companyId },
      select: { dutyId: true }
    });
    const existingDutyIds = new Set(existingDuties.map(d => d.dutyId));

    let created = 0;
    let skipped = 0;

    for (const dutyName of duties) {
      const dutyId = dutyIds[dutyName];
      if (!dutyId) {
        console.log(`  WARNING: Duty "${dutyName}" not found in mapping`);
        continue;
      }

      if (existingDutyIds.has(dutyId)) {
        skipped++;
        continue;
      }

      try {
        await prisma.companyDuty.create({
          data: {
            companyId,
            dutyId,
          }
        });
        created++;
      } catch (error: any) {
        console.log(`  ERROR: ${dutyName} - ${error.message}`);
      }
    }

    console.log(`  Created: ${created}, Skipped: ${skipped}`);
    totalCreated += created;
    totalSkipped += skipped;
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total created: ${totalCreated}`);
  console.log(`Total skipped: ${totalSkipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
