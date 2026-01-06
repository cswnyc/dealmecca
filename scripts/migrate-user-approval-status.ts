import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateUserApprovalStatus(): Promise<void> {
  try {
    console.log('🔄 Starting user approval status migration...');

    // Since accountStatus has a default value of APPROVED, all existing users
    // should already have APPROVED status. Let's just update those without approvedAt
    const result = await prisma.user.updateMany({
      where: {
        accountStatus: 'APPROVED',
        approvedAt: null,
      },
      data: {
        approvedAt: new Date(),
        approvalNotes: 'Auto-approved during migration (existing user)',
      },
    });

    console.log(`✅ Migration complete: ${result.count} existing users updated with approval timestamp`);

    // Show summary stats
    const stats = await prisma.user.groupBy({
      by: ['accountStatus'],
      _count: {
        accountStatus: true,
      },
    });

    console.log('\n📊 User approval status summary:');
    stats.forEach((stat) => {
      console.log(`   ${stat.accountStatus}: ${stat._count.accountStatus} users`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateUserApprovalStatus();

