/**
 * Backfill publicHandle for existing users before running migration
 */
import { prisma } from '../lib/prisma';
import { makeAlias } from '../server/alias';

async function main() {
  console.log('🔍 Checking for users without publicHandle...');

  const usersWithoutHandle = await prisma.user.findMany({
    where: {
      publicHandle: null
    },
    select: {
      id: true,
      email: true,
      firebaseUid: true,
      publicHandle: true
    }
  });

  console.log(`Found ${usersWithoutHandle.length} users without publicHandle`);

  if (usersWithoutHandle.length === 0) {
    console.log('✅ All users already have publicHandle');
    return;
  }

  console.log('📝 Backfilling publicHandle for existing users...');

  for (const user of usersWithoutHandle) {
    // Generate handle from firebaseUid or email
    const seed = user.firebaseUid || user.email || user.id;
    const handle = makeAlias(seed);

    await prisma.user.update({
      where: { id: user.id },
      data: { publicHandle: handle }
    });

    console.log(`✓ User ${user.id}: ${handle}`);
  }

  console.log(`✅ Backfilled publicHandle for ${usersWithoutHandle.length} users`);
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
