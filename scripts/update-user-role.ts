import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    // Update the user role to ADMIN
    const user = await prisma.user.update({
      where: { firebaseUid: 'dKTRYZzB6FTX8rxV9J8aXPzRqaI2' },
      data: { role: 'ADMIN' },
      select: { id: true, email: true, role: true, firebaseUid: true }
    });

    console.log('✅ Successfully updated user role:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Firebase UID: ${user.firebaseUid}`);
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
