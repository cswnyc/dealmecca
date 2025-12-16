import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const havas = await prisma.company.findFirst({ where: { name: 'Havas Group' } });
  if (!havas) { console.log('Havas Group not found'); return; }

  // First, fix Havas Group - it should NOT be under Havas Creative
  await prisma.company.update({
    where: { id: havas.id },
    data: { parentCompanyId: null }
  });
  console.log('Fixed: Havas Group (removed parent)');

  // Remove Arnold & Porter from Arnold Worldwide (it's a law firm)
  const arnoldPorter = await prisma.company.findFirst({ where: { name: 'Arnold & Porter' } });
  if (arnoldPorter) {
    await prisma.company.update({
      where: { id: arnoldPorter.id },
      data: { parentCompanyId: null }
    });
    console.log('Fixed: Arnold & Porter (removed from Arnold Worldwide)');
  }

  // Move locations to correct parent networks
  const fixes = [
    // Havas Edge locations
    { pattern: 'Havas Edge', parent: 'Havas Edge' },
    // Havas CX Helia locations
    { pattern: 'Havas CX Helia', parent: 'Havas CX Helia' },
    // Havas Formula locations
    { pattern: 'Havas Formula', parent: 'HAVAS Formula' },
    // Havas Lynx locations
    { pattern: 'Havas Lynx', parent: 'Havas Lynx' },
    // Havas Life locations
    { pattern: 'Havas Life', parent: 'Havas Life' },
    // Havas Entertainment locations
    { pattern: 'Havas Entertainment', parent: 'Havas Entertainment' },
    // Havas Health locations
    { pattern: 'Havas Health', parent: 'Havas Health & You' },
    { pattern: 'Havas Mango', parent: 'Havas Health & You' },
  ];

  for (const fix of fixes) {
    const parent = await prisma.company.findFirst({ where: { name: fix.parent } });
    if (!parent) {
      console.log('Parent not found: ' + fix.parent);
      continue;
    }

    const locations = await prisma.company.findMany({
      where: {
        name: { startsWith: fix.pattern },
        id: { not: parent.id }
      }
    });

    for (const loc of locations) {
      if (loc.parentCompanyId !== parent.id) {
        await prisma.company.update({
          where: { id: loc.id },
          data: { parentCompanyId: parent.id }
        });
        console.log('Moved ' + loc.name + ' to ' + fix.parent);
      }
    }
  }

  // Show final structure
  const networks = await prisma.company.findMany({
    where: { parentCompanyId: havas.id },
    select: {
      name: true,
      _count: { select: { subsidiaries: true } }
    },
    orderBy: { name: 'asc' }
  });

  console.log('\n=== Havas Group Networks (' + networks.length + ') ===');
  let total = 0;
  networks.forEach(n => {
    console.log(n.name + ' (' + n._count.subsidiaries + ')');
    total += n._count.subsidiaries;
  });
  console.log('\nTotal: ' + networks.length + ' networks, ' + total + ' locations');
}

main().catch(console.error).finally(() => prisma.$disconnect());
