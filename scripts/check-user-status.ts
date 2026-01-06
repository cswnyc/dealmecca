import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserStatus(): Promise<void> {
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: npx ts-node scripts/check-user-status.ts <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        accountStatus: true,
        approvedAt: true,
        approvalNotes: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    console.log('\n📊 User Status:\n');
    console.log(`Email:          ${user.email}`);
    console.log(`Name:           ${user.name || '(not set)'}`);
    console.log(`Account Status: ${user.accountStatus}`);
    console.log(`Role:           ${user.role}`);
    console.log(`Approved At:    ${user.approvedAt || '(not approved)'}`);
    console.log(`Approval Notes: ${user.approvalNotes || '(none)'}`);
    console.log(`Created At:     ${user.createdAt}`);
    console.log(`User ID:        ${user.id}\n`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStatus();

