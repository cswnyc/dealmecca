import { prisma } from '../lib/prisma';

async function testContactsQuery() {
  try {
    console.log('Testing contacts query...');

    const where: any = {};

    // Test 1: Simple count
    console.log('\n1. Testing simple count...');
    const total = await prisma.contact.count({ where });
    console.log(`✓ Total contacts: ${total}`);

    // Test 2: Aggregate
    console.log('\n2. Testing aggregate...');
    const adminStats = await prisma.contact.aggregate({
      where,
      _count: { id: true },
      _avg: { communityScore: true }
    });
    console.log(`✓ Admin stats:`, adminStats);

    // Test 3: Verification stats group by
    console.log('\n3. Testing verification stats groupBy...');
    const verificationStats = await prisma.contact.groupBy({
      by: ['verified'],
      where,
      _count: { id: true }
    });
    console.log(`✓ Verification stats:`, verificationStats);

    // Test 4: Quality stats group by
    console.log('\n4. Testing quality stats groupBy...');
    const qualityStats = await prisma.contact.groupBy({
      by: ['dataQuality'],
      where,
      _count: { id: true }
    });
    console.log(`✓ Quality stats:`, qualityStats);

    // Test 5: Department stats group by
    console.log('\n5. Testing department stats groupBy...');
    const departmentStats = await prisma.contact.groupBy({
      by: ['department'],
      where,
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' }
      },
      take: 10
    });
    console.log(`✓ Department stats:`, departmentStats);

    // Test 6: Unique companies
    console.log('\n6. Testing unique companies...');
    const uniqueCompaniesResult = await prisma.contact.findMany({
      where,
      select: { companyId: true },
      distinct: ['companyId']
    });
    console.log(`✓ Unique companies: ${uniqueCompaniesResult.length}`);

    // Test 7: Contacts this month
    console.log('\n7. Testing contacts this month...');
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const contactsThisMonth = await prisma.contact.count({
      where: {
        ...where,
        createdAt: { gte: startOfMonth }
      }
    });
    console.log(`✓ Contacts this month: ${contactsThisMonth}`);

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testContactsQuery();
