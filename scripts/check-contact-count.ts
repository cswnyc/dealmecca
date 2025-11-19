import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkContactCount() {
  try {
    const totalCount = await prisma.contact.count();
    console.log('Total contacts in database:', totalCount);

    // Also check if there are any filters or conditions
    const contactsByType = await prisma.contact.groupBy({
      by: ['organizationType'],
      _count: true,
    });

    console.log('\nContacts by organization type:');
    contactsByType.forEach(item => {
      console.log(`  ${item.organizationType}: ${item._count}`);
    });

  } catch (error) {
    console.error('Error checking contact count:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContactCount();
