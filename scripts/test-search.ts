import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testSearch() {
  try {
    const query = 'B';
    console.log(`Testing search for query: "${query}"\n`);

    // Test companies search
    console.log('🏢 Searching companies...');
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { website: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { state: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        city: true,
        state: true,
        verified: true,
        companyType: true
      },
      take: 3,
      orderBy: [
        { verified: 'desc' },
        { name: 'asc' }
      ]
    });
    console.log(`Found ${companies.length} companies:`);
    companies.forEach(c => console.log(`  - ${c.name} (${c.companyType})`));

    // Test contacts search
    console.log('\n👤 Searching contacts...');
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          { company: { name: { contains: query, mode: 'insensitive' } } }
        ]
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            verified: true
          }
        }
      },
      take: 3,
      orderBy: [
        { verified: 'desc' },
        { fullName: 'asc' }
      ]
    });
    console.log(`Found ${contacts.length} contacts:`);
    contacts.forEach(c => console.log(`  - ${c.fullName}${c.company ? ` @ ${c.company.name}` : ''}`));

    console.log('\n✅ Search test completed successfully!');
  } catch (error) {
    console.error('❌ Search test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSearch();
