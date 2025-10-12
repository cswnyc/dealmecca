import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateUsers() {
  console.log('=== Fixing Duplicate Users ===\n');

  // Step 1: Migrate SharpHearts comments to SolarWren
  console.log('Step 1: Checking SharpHearts comments...');
  const sharpHeartsComments = await prisma.forumComment.count({
    where: { authorId: 'cmgivge9r0000jp04hpwkox4l' }
  });

  console.log(`  Found ${sharpHeartsComments} comments by SharpHearts`);

  if (sharpHeartsComments > 0) {
    console.log('  Migrating comments to SolarWren...');
    await prisma.forumComment.updateMany({
      where: { authorId: 'cmgivge9r0000jp04hpwkox4l' },
      data: { authorId: 'dKTRYZzB6FTX8rxV9J8aXPzRqaI2' }
    });
    console.log('  ✓ Comments migrated');
  }

  // Check other data
  const sharpHeartsData = await prisma.user.findUnique({
    where: { id: 'cmgivge9r0000jp04hpwkox4l' },
    include: {
      _count: {
        select: {
          ForumPost: true,
          ForumVote: true,
          ForumBookmark: true,
          PostBookmark: true,
          PostFollow: true
        }
      }
    }
  });

  console.log('\n  SharpHearts other data:');
  console.log(`    Posts: ${sharpHeartsData?._count.ForumPost || 0}`);
  console.log(`    Votes: ${sharpHeartsData?._count.ForumVote || 0}`);
  console.log(`    Bookmarks: ${sharpHeartsData?._count.ForumBookmark || 0}`);
  console.log(`    Post Bookmarks: ${sharpHeartsData?._count.PostBookmark || 0}`);
  console.log(`    Post Follows: ${sharpHeartsData?._count.PostFollow || 0}`);

  // Step 2: Delete SharpHearts user
  console.log('\nStep 2: Deleting SharpHearts duplicate user...');
  await prisma.user.delete({
    where: { id: 'cmgivge9r0000jp04hpwkox4l' }
  });
  console.log('  ✓ SharpHearts user deleted');

  // Step 3: Fix SolarWren firebaseUid
  console.log('\nStep 3: Fixing SolarWren firebaseUid...');
  await prisma.user.update({
    where: { id: 'dKTRYZzB6FTX8rxV9J8aXPzRqaI2' },
    data: { firebaseUid: 'dKTRYZzB6FTX8rxV9J8aXPzRqaI2' }
  });
  console.log('  ✓ SolarWren firebaseUid fixed');

  // Step 4: Fix other users with missing firebaseUid
  console.log('\nStep 4: Fixing other users with missing firebaseUid...');

  const usersToFix = [
    { id: 'o45naDpYTfOjzp3m5ixJOGTEp5D2', name: 'CrystalChannels' },
    { id: 'tcxKpn3JwAeGNRcFgGxACLjocr32', name: 'TechHopes' }
  ];

  for (const user of usersToFix) {
    await prisma.user.update({
      where: { id: user.id },
      data: { firebaseUid: user.id }
    });
    console.log(`  ✓ Fixed ${user.name}`);
  }

  // Step 5: Verify all users now have firebaseUid
  console.log('\nStep 5: Verifying all users...');
  const usersWithoutFirebaseUid = await prisma.user.count({
    where: { firebaseUid: null }
  });

  if (usersWithoutFirebaseUid === 0) {
    console.log('  ✓ All users now have firebaseUid!');
  } else {
    console.log(`  ⚠ WARNING: ${usersWithoutFirebaseUid} users still missing firebaseUid`);
  }

  // Show final user list
  console.log('\n=== Final User List ===');
  const allUsers = await prisma.user.findMany({
    select: {
      anonymousUsername: true,
      email: true,
      firebaseUid: true,
      role: true
    },
    orderBy: { createdAt: 'asc' }
  });

  allUsers.forEach(u => {
    console.log(`  - ${u.anonymousUsername} (${u.email || 'no email'}) [${u.role}] - UID: ${u.firebaseUid ? '✓' : '✗'}`);
  });
}

fixDuplicateUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
