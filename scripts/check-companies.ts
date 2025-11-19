import { prisma } from '../lib/prisma';

async function checkCompanies() {
  try {
    // Count total companies
    const totalCount = await prisma.company.count();
    console.log(`Total companies in database: ${totalCount}`);

    // Search for Opendoor
    const opendoor = await prisma.company.findMany({
      where: {
        name: {
          contains: 'opendoor',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        companyType: true,
        city: true,
        state: true
      }
    });
    console.log('\nOpendoor companies:', opendoor);

    // Search for WPP
    const wpp = await prisma.company.findMany({
      where: {
        name: {
          contains: 'wpp',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        companyType: true,
        city: true,
        state: true
      }
    });
    console.log('\nWPP companies:', wpp);

    // Get first 5 and last 5 companies alphabetically
    const firstFive = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      take: 5,
      select: { name: true }
    });
    console.log('\nFirst 5 companies alphabetically:', firstFive.map(c => c.name));

    const lastFive = await prisma.company.findMany({
      orderBy: { name: 'desc' },
      take: 5,
      select: { name: true }
    });
    console.log('\nLast 5 companies alphabetically:', lastFive.map(c => c.name).reverse());

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompanies();
