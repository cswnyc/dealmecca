import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function approveUser(): Promise<void> {
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: npx ts-node scripts/approve-user.ts <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        accountStatus: 'APPROVED',
        approvedAt: new Date(),
        approvalNotes: 'Approved via CLI script',
      },
      select: {
        id: true,
        email: true,
        accountStatus: true,
        approvedAt: true,
      },
    });

    console.log('\n✅ User approved successfully!\n');
    console.log(`Email:          ${user.email}`);
    console.log(`Account Status: ${user.accountStatus}`);
    console.log(`Approved At:    ${user.approvedAt}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveUser();

