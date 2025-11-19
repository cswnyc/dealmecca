import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Audit advertisers that may have been scraped while minimized
 * (typically showing exactly 3 agencies instead of full list)
 *
 * Usage:
 *   npx tsx scripts/audit-minimized-advertisers.ts
 */

async function auditMinimizedAdvertisers() {
  console.log('🔍 Auditing Advertisers for Missing Agency Partnerships...');
  console.log('================================================================================\n');

  // Find all advertisers with partnership counts
  const advertisersWithCounts = await prisma.company.findMany({
    where: {
      companyType: 'ADVERTISER'
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          CompanyPartnership_advertiserIdToCompany: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log(`Total advertisers: ${advertisersWithCounts.length}\n`);

  // Group by partnership count
  const byCount: Record<number, typeof advertisersWithCounts> = {};
  advertisersWithCounts.forEach(adv => {
    const count = adv._count.CompanyPartnership_advertiserIdToCompany;
    if (!byCount[count]) {
      byCount[count] = [];
    }
    byCount[count].push(adv);
  });

  // Show statistics
  console.log('📊 PARTNERSHIP COUNT DISTRIBUTION');
  console.log('─'.repeat(80));
  Object.keys(byCount)
    .map(k => parseInt(k))
    .sort((a, b) => a - b)
    .forEach(count => {
      console.log(`${count.toString().padStart(3)} agencies: ${byCount[count].length.toString().padStart(4)} advertisers`);
    });

  // Suspicious advertisers (exactly 3 partnerships - typical minimized view)
  const suspicious = byCount[3] || [];
  console.log('\n' + '='.repeat(80));
  console.log('⚠️  SUSPICIOUS: Advertisers with exactly 3 agencies (likely minimized during scraping)');
  console.log('='.repeat(80));
  console.log(`Found ${suspicious.length} advertisers with exactly 3 agencies:\n`);

  suspicious.forEach((adv, idx) => {
    console.log(`${(idx + 1).toString().padStart(3)}. ${adv.name}`);
  });

  // Very suspicious advertisers (0-2 partnerships)
  const veryFew = [...(byCount[0] || []), ...(byCount[1] || []), ...(byCount[2] || [])];
  if (veryFew.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('🚨 VERY SUSPICIOUS: Advertisers with 0-2 agencies');
    console.log('='.repeat(80));
    console.log(`Found ${veryFew.length} advertisers with 0-2 agencies:\n`);

    veryFew.forEach((adv, idx) => {
      console.log(`${(idx + 1).toString().padStart(3)}. ${adv.name} (${adv._count.CompanyPartnership_advertiserIdToCompany} agencies)`);
    });
  }

  // Known problematic ones we already fixed
  const knownFixed = ['Facebook', 'Galderma', 'Mini USA', 'IKEA', 'Campbell Soup Company'];
  const fixedAdvertisers = await prisma.company.findMany({
    where: {
      name: { in: knownFixed },
      companyType: 'ADVERTISER'
    },
    select: {
      name: true,
      _count: {
        select: {
          CompanyPartnership_advertiserIdToCompany: true
        }
      }
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ KNOWN FIXED: Advertisers we already manually fixed');
  console.log('='.repeat(80));
  fixedAdvertisers.forEach(adv => {
    console.log(`${adv.name}: ${adv._count.CompanyPartnership_advertiserIdToCompany} agencies`);
  });

  // Export suspicious list to CSV for easy checking
  const csvLines = ['Advertiser Name,Partnership Count'];
  suspicious.forEach(adv => {
    csvLines.push(`"${adv.name}",${adv._count.CompanyPartnership_advertiserIdToCompany}`);
  });

  const fs = require('fs');
  fs.writeFileSync('/Users/csw/DealMecca/suspicious-advertisers-3-agencies.csv', csvLines.join('\n'));

  console.log('\n' + '='.repeat(80));
  console.log('📝 Exported suspicious advertisers to: suspicious-advertisers-3-agencies.csv');
  console.log('='.repeat(80));

  console.log('\n✨ Audit Complete!');
  console.log('\n💡 RECOMMENDATION:');
  console.log('   1. Review the CSV file to identify which advertisers need re-scraping');
  console.log('   2. For each suspicious advertiser, check SellerCrowd to see actual agency count');
  console.log('   3. Create manual partnership addition scripts for confirmed cases');
  console.log('   4. Going forward, ensure all advertisers are EXPANDED before scraping each batch');
}

auditMinimizedAdvertisers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
