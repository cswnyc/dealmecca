import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findDuplicateUsers() {
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firebaseUid: true,
      anonymousUsername: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log('Total users:', allUsers.length);

  const missingFirebaseUid = allUsers.filter(u => !u.firebaseUid);
  const withFirebaseUid = allUsers.filter(u => u.firebaseUid);

  console.log('\nUsers with missing firebaseUid:', missingFirebaseUid.length);
  missingFirebaseUid.forEach(u => {
    console.log(`  - ${u.anonymousUsername || 'unnamed'} (id: ${u.id}, email: ${u.email || 'null'})`);
  });

  // Check for duplicate firebaseUids
  const uidMap = new Map<string, typeof allUsers>();
  withFirebaseUid.forEach(u => {
    const uid = u.firebaseUid!;
    if (!uidMap.has(uid)) {
      uidMap.set(uid, []);
    }
    uidMap.get(uid)!.push(u);
  });

  console.log('\nDuplicate firebaseUid found:');
  let hasDuplicates = false;
  uidMap.forEach((users, uid) => {
    if (users.length > 1) {
      hasDuplicates = true;
      console.log(`  Firebase UID ${uid}:`);
      users.forEach(u => {
        console.log(`    - ${u.anonymousUsername} (created: ${u.createdAt.toISOString()})`);
      });
    }
  });

  if (!hasDuplicates) {
    console.log('  None found');
  }
}

findDuplicateUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
