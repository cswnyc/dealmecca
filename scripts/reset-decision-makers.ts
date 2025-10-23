#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDecisionMakers() {
  console.log('\n🔄 Resetting all contacts to isDecisionMaker: false\n');
  console.log('='.repeat(80));

  try {
    // Update all contacts to NOT be decision makers
    const result = await prisma.contact.updateMany({
      where: {
        isDecisionMaker: true
      },
      data: {
        isDecisionMaker: false,
        updatedAt: new Date()
      }
    });

    console.log(`\n✅ Updated ${result.count} contacts to isDecisionMaker: false`);
    console.log('\n='.repeat(80));
    console.log('\n💡 Note: You can manually mark specific contacts as decision makers');
    console.log('   by editing them individually in the admin interface.\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetDecisionMakers().catch(console.error);
