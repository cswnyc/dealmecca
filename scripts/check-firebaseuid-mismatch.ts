import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFirebaseUidMismatch() {
  console.log('🔍 Checking for FirebaseUID mismatches for cswnyc@gmail.com\n');

  const email = 'cswnyc@gmail.com';
  const normalizedEmail = email.toLowerCase();

  // Find user by email
  const userByEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      firebaseUid: true,
      accountStatus: true,
      createdAt: true
    }
  });

  if (!userByEmail) {
    console.log('❌ User not found by email:', normalizedEmail);
    await prisma.$disconnect();
    return;
  }

  console.log('📧 User found by EMAIL:');
  console.log('   ID:', userByEmail.id);
  console.log('   Email:', userByEmail.email);
  console.log('   FirebaseUID:', userByEmail.firebaseUid);
  console.log('   Status:', userByEmail.accountStatus);
  console.log('   Created:', userByEmail.createdAt);
  console.log('');

  // Now check if this firebaseUid points back to the same user
  if (userByEmail.firebaseUid) {
    const userByFirebaseUid = await prisma.user.findUnique({
      where: { firebaseUid: userByEmail.firebaseUid },
      select: {
        id: true,
        email: true,
        firebaseUid: true,
        accountStatus: true,
        createdAt: true
      }
    });

    console.log('🔑 User found by FIREBASEUID (' + userByEmail.firebaseUid + '):');
    if (userByFirebaseUid) {
      console.log('   ID:', userByFirebaseUid.id);
      console.log('   Email:', userByFirebaseUid.email);
      console.log('   FirebaseUID:', userByFirebaseUid.firebaseUid);
      console.log('   Status:', userByFirebaseUid.accountStatus);
      console.log('   Created:', userByFirebaseUid.createdAt);
      console.log('');

      if (userByEmail.id !== userByFirebaseUid.id) {
        console.log('❌ MISMATCH DETECTED!');
        console.log('   Email lookup points to user:', userByEmail.id);
        console.log('   FirebaseUID lookup points to user:', userByFirebaseUid.id);
        console.log('   This means the FirebaseUID was reassigned to a different user!\n');
      } else {
        console.log('✅ Same user found by both email and firebaseUid\n');
      }
    } else {
      console.log('   NOT FOUND - firebaseUid exists in user record but no user has it!\n');
    }
  } else {
    console.log('⚠️  User has no firebaseUid set!\n');
  }

  // Check for ALL users with this email (case-insensitive)
  const allMatches = await prisma.user.findMany({
    where: {
      email: {
        equals: normalizedEmail,
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      email: true,
      firebaseUid: true,
      accountStatus: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  if (allMatches.length > 1) {
    console.log('⚠️  Multiple users found with this email:');
    for (const user of allMatches) {
      console.log('   - ID:', user.id, '| Status:', user.accountStatus, '| FirebaseUID:', user.firebaseUid?.substring(0, 20) + '...');
    }
  }

  await prisma.$disconnect();
}

checkFirebaseUidMismatch().catch(console.error);
