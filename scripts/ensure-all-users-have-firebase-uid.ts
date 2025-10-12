import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

/**
 * Script to ensure ALL users have a firebaseUid
 * This prevents authentication issues where users can't log in
 */
async function ensureAllUsersHaveFirebaseUid() {
  console.log('=== Checking all users for firebaseUid ===\n');

  const usersWithoutFirebaseUid = await prisma.user.findMany({
    where: { firebaseUid: null },
    select: {
      id: true,
      email: true,
      anonymousUsername: true,
      createdAt: true
    }
  });

  if (usersWithoutFirebaseUid.length === 0) {
    console.log('✅ All users have firebaseUid!');
    return;
  }

  console.log(`Found ${usersWithoutFirebaseUid.length} users without firebaseUid:\n`);

  for (const user of usersWithoutFirebaseUid) {
    console.log(`  - ${user.anonymousUsername || 'unnamed'} (${user.email || 'no email'})`);
    console.log(`    User ID: ${user.id}`);

    // Strategy: Check if the user.id looks like a Firebase UID
    // Firebase UIDs are typically alphanumeric strings
    if (user.id.match(/^[a-zA-Z0-9]{20,}$/)) {
      console.log(`    ✓ User ID looks like a Firebase UID, using it`);

      // Check if this firebaseUid is already taken
      const conflictingUser = await prisma.user.findUnique({
        where: { firebaseUid: user.id }
      });

      if (conflictingUser) {
        console.log(`    ⚠ WARNING: Firebase UID ${user.id} is already taken by another user!`);
        console.log(`    This user needs manual intervention.`);
      } else {
        // Update user with firebaseUid = id
        await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid: user.id }
        });
        console.log(`    ✓ Updated firebaseUid to match ID`);
      }
    } else {
      console.log(`    ⚠ User ID doesn't look like a Firebase UID`);
      console.log(`    Generating a new Firebase-compatible UID...`);

      // Generate a Firebase-compatible UID (28 characters, alphanumeric)
      const newFirebaseUid = randomBytes(14).toString('base64url'); // Base64url is Firebase-compatible

      await prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: newFirebaseUid }
      });
      console.log(`    ✓ Generated new firebaseUid: ${newFirebaseUid}`);
    }

    console.log('');
  }

  console.log('\n=== Final verification ===');
  const remainingUsersWithoutFirebaseUid = await prisma.user.count({
    where: { firebaseUid: null }
  });

  if (remainingUsersWithoutFirebaseUid === 0) {
    console.log('✅ All users now have firebaseUid!');
  } else {
    console.log(`⚠ ${remainingUsersWithoutFirebaseUid} users still missing firebaseUid`);
    console.log('These users need manual review.');
  }
}

ensureAllUsersHaveFirebaseUid()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
