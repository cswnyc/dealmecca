import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

async function main() {
  const ipg = await prisma.company.findFirst({ where: { name: { contains: 'Interpublic' } } });

  if (!ipg) {
    console.log('IPG not found');
    return;
  }

  console.log('Found IPG: ' + ipg.name + ' (' + ipg.id + ')');

  // Missing IPG agencies to add
  const missingAgencies = [
    { name: 'Acxiom' },
    { name: 'Ansible' },
    { name: 'CBIG' },
    { name: 'Fitzgerald' },
    { name: 'Gotham' },
    { name: 'Heathworld' },
    { name: 'RXM' },
    { name: 'WARC' },
    { name: 'Wireside' },
    { name: 'Work & Co' },
  ];

  let addedCount = 0;

  for (const agency of missingAgencies) {
    // Check if already exists
    const existing = await prisma.company.findFirst({
      where: { name: agency.name }
    });

    if (existing) {
      console.log('Already exists: ' + agency.name);
      // Link to IPG if not already linked
      if (!existing.parentCompanyId) {
        await prisma.company.update({
          where: { id: existing.id },
          data: { parentCompanyId: ipg.id }
        });
        console.log('  -> Linked to IPG');
      }
      continue;
    }

    // Generate slug
    let slug = agency.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check for slug uniqueness
    let slugExists = await prisma.company.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${agency.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')}-${counter}`;
      slugExists = await prisma.company.findUnique({ where: { slug } });
      counter++;
    }

    // Create new company
    const newCompany = await prisma.company.create({
      data: {
        id: createId(),
        name: agency.name,
        slug: slug,
        companyType: 'AGENCY',
        parentCompanyId: ipg.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('Added: ' + newCompany.name);
    addedCount++;
  }

  console.log('\nTotal added: ' + addedCount);

  // Show updated IPG structure
  const networks = await prisma.company.findMany({
    where: { parentCompanyId: ipg.id },
    select: {
      name: true,
      _count: { select: { subsidiaries: true } }
    },
    orderBy: { name: 'asc' }
  });

  console.log('\n=== Updated IPG Networks (' + networks.length + ') ===');
  let total = 0;
  networks.forEach(n => {
    console.log(n.name + ' (' + n._count.subsidiaries + ')');
    total += n._count.subsidiaries;
  });
  console.log('\nTotal: ' + networks.length + ' networks, ' + total + ' locations');
}

main().catch(console.error).finally(() => prisma.$disconnect());
