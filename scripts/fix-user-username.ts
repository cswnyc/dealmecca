import { prisma } from '../server/prisma';

async function fixUsername() {
  const firebaseUid = 'DysEp8gCwAYEhRBJvppGx929P2v2'; // Your Firebase UID from logs

  // Check current user data
  const user = await prisma.user.findUnique({
    where: { firebaseUid },
    select: {
      id: true,
      email: true,
      name: true,
      publicHandle: true,
      anonymousUsername: true,
      anonymousHandle: true,
    }
  });

  console.log('Current user data:', JSON.stringify(user, null, 2));

  if (user) {
    // Update anonymousUsername if it's not set
    if (!user.anonymousUsername) {
      const updated = await prisma.user.update({
        where: { firebaseUid },
        data: {
          anonymousUsername: 'SmartFeelings',
        }
      });
      console.log('✅ Updated user anonymousUsername to: SmartFeelings');
      console.log('Updated user:', JSON.stringify(updated, null, 2));
    } else {
      console.log('✅ User already has anonymousUsername:', user.anonymousUsername);
    }
  } else {
    console.log('❌ User not found with firebaseUid:', firebaseUid);
  }

  await prisma.$disconnect();
}

fixUsername().catch(console.error);
