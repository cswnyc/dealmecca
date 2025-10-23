#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLogos() {
  // First, check what company types exist
  const allCompanies = await prisma.company.findMany({
    where: {
      OR: [
        { name: { in: ['WPP', 'Omnicom Group', 'Publicis Groupe', 'Interpublic Group', 'Dentsu', 'Havas', 'Stagwell', 'S4 Capital'] } },
        { name: { contains: 'IPG', mode: 'insensitive' } },
        { name: { contains: 'Interpublic', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      companyType: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log('\n📊 Holding Company Logos:\n');
  console.log('='.repeat(80));

  if (allCompanies.length === 0) {
    console.log('\n⚠️  No holding companies found in database!');
    console.log('   Expected: WPP, Omnicom Group, Publicis Groupe, etc.\n');
  } else {
    allCompanies.forEach(company => {
      console.log(`\n${company.name}`);
      console.log(`  ID: ${company.id}`);
      console.log(`  Type: ${company.companyType}`);
      console.log(`  Logo URL: ${company.logoUrl || '(none)'}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\nTotal: ${allCompanies.length} holding companies`);

  await prisma.$disconnect();
}

checkLogos().catch(console.error);
