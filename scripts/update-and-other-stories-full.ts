import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAndOtherStories() {
  console.log('🔄 Updating & Other Stories with all fields...\n');

  try {
    const company = await prisma.company.findUnique({
      where: { id: 'ezzv6qr080l9br2msf8z9lt4' }
    });

    if (!company) {
      console.error('❌ Company not found!');
      return;
    }

    console.log('Found company:', company.name);
    console.log('\nCurrent data:');
    console.log('  Industry:', company.industry);
    console.log('  Country:', company.country);
    console.log('  Verified:', company.verified);
    console.log('  Website:', company.website);

    // Update the company with all the fields you're trying to set
    const updated = await prisma.company.update({
      where: { id: 'ezzv6qr080l9br2msf8z9lt4' },
      data: {
        industry: 'RETAIL_ECOMMERCE',
        country: 'US',
        verified: true,
        lastVerified: new Date(),
        website: 'https://www.stories.com/en-us/',
        updatedAt: new Date()
      }
    });

    console.log('\n✅ Company updated successfully!');
    console.log('\nNew data:');
    console.log('  Industry:', updated.industry);
    console.log('  Country:', updated.country);
    console.log('  Verified:', updated.verified);
    console.log('  Last Verified:', updated.lastVerified);
    console.log('  Website:', updated.website);

  } catch (error) {
    console.error('❌ Error updating company:', error);
  }

  await prisma.$disconnect();
}

updateAndOtherStories().catch(console.error);
