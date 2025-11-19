import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAndOtherStories() {
  console.log('🔄 Updating & Other Stories...\n');

  try {
    const company = await prisma.company.findUnique({
      where: { id: 'ezzv6qr080l9br2msf8z9lt4' }
    });

    if (!company) {
      console.error('❌ Company not found!');
      return;
    }

    console.log('Found company:', company.name);
    console.log('Current data:');
    console.log('  Website:', company.website);
    console.log('  Logo URL:', company.logoUrl);
    console.log('  Description:', company.description);

    // Update the company
    const updated = await prisma.company.update({
      where: { id: 'ezzv6qr080l9br2msf8z9lt4' },
      data: {
        website: 'https://www.stories.com/en-us/',
        // Add logoUrl here if you have uploaded it somewhere
        // logoUrl: 'https://your-cdn-url/logo.png',
        updatedAt: new Date()
      }
    });

    console.log('\n✅ Company updated successfully!');
    console.log('New data:');
    console.log('  Website:', updated.website);
    console.log('  Logo URL:', updated.logoUrl);
    console.log('  Description:', updated.description);

  } catch (error) {
    console.error('❌ Error updating company:', error);
  }

  await prisma.$disconnect();
}

updateAndOtherStories().catch(console.error);
