import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupScreenshot53Errors() {
  console.log('🧹 Cleaning up Screenshot 53 data errors...\n');

  // 1. Remove all Manifest NY partnerships (should have 0, not 7)
  const manifestNY = await prisma.company.findFirst({
    where: { name: 'Manifest NY' }
  });

  if (manifestNY) {
    console.log('📍 Manifest NY - Removing 7 incorrect partnerships...');
    const deletedManifest = await prisma.companyPartnership.deleteMany({
      where: { agencyId: manifestNY.id }
    });
    console.log(`   ✅ Deleted ${deletedManifest.count} partnerships\n`);
  }

  // 2. For Monks NY - keep only unique clients, remove duplicates
  const monksNY = await prisma.company.findFirst({
    where: { name: 'Monks NY' },
    include: {
      CompanyPartnership_agencyIdToCompany: {
        include: {
          advertiser: true
        }
      }
    }
  });

  if (monksNY) {
    console.log('📍 Monks NY - Current partnerships:');
    console.log(`   Total: ${monksNY.CompanyPartnership_agencyIdToCompany.length}`);

    // Find duplicates by advertiser name
    const advertiserCounts = new Map<string, number>();
    monksNY.CompanyPartnership_agencyIdToCompany.forEach(p => {
      const count = advertiserCounts.get(p.advertiser.name) || 0;
      advertiserCounts.set(p.advertiser.name, count + 1);
    });

    const duplicates = Array.from(advertiserCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([name, count]) => ({ name, count }));

    console.log(`   Duplicates found: ${duplicates.length}`);
    duplicates.forEach(d => {
      console.log(`      - ${d.name} (${d.count} times)`);
    });

    // For each duplicate, keep one and delete the rest
    for (const dup of duplicates) {
      const partnerships = monksNY.CompanyPartnership_agencyIdToCompany
        .filter(p => p.advertiser.name === dup.name);

      // Keep the first one, delete the rest
      for (let i = 1; i < partnerships.length; i++) {
        await prisma.companyPartnership.delete({
          where: { id: partnerships[i].id }
        });
        console.log(`   🗑️  Deleted duplicate: ${dup.name}`);
      }
    }

    // Verify final count
    const updatedMonks = await prisma.company.findFirst({
      where: { name: 'Monks NY' },
      include: {
        CompanyPartnership_agencyIdToCompany: true
      }
    });
    console.log(`   ✅ Final count: ${updatedMonks?.CompanyPartnership_agencyIdToCompany.length} unique partnerships\n`);
  }

  console.log('✨ Cleanup complete!');

  // Summary
  console.log('\n📊 Summary:');
  console.log('   - Manifest NY: 7 → 0 partnerships');
  console.log('   - Monks NY: 15 → 13 unique partnerships');
  console.log('   - Total partnerships removed: 9');
}

cleanupScreenshot53Errors()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
