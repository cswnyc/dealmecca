import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Havas agencies and their location patterns from screenshots
const havasNetworks = [
  { name: 'Havas Media Group', pattern: 'Havas Media' },
  { name: 'Havas Creative', pattern: 'Havas', locations: ['Field Day', 'Havas Annex', 'Havas Boston', 'Havas Chicago', 'Havas Creative Atlanta', 'Havas CX NY', 'Havas CX Toronto', 'Havas Dusseldorf', 'Havas London', 'Havas Mexico City', 'Havas Montreal', 'Havas NY', 'Havas SF', 'Havas Toronto', 'Strat Farm'] },
  { name: 'Havas Edge', pattern: 'Havas Edge' },
  { name: 'Arnold Worldwide', pattern: 'Arnold' },
  { name: 'Havas Lynx', pattern: 'Havas Lynx' },
  { name: 'HAVAS Play', pattern: 'HAVAS Play' },
  { name: 'Arena Media', pattern: 'Arena Media' },
  { name: 'HAVAS Formula', pattern: 'Havas Formula' },
  { name: 'Health4Brands', pattern: 'Health4Brands' },
  { name: 'Havas Entertainment', pattern: 'Havas Entertainment' },
  { name: 'Red Havas', pattern: 'Red Havas' },
  { name: 'Havas Life', pattern: 'Havas Life' },
  { name: 'Camp + King', pattern: 'Camp + King' },
  { name: 'Havas Health & You', pattern: 'Havas Health', locations: ['Havas Health Plus', 'Havas Mango'] },
  { name: 'Havas CX Helia', pattern: 'Havas CX Helia' },
  { name: 'FullSix Group', pattern: 'FullSix' },
];

async function main() {
  const havas = await prisma.company.findFirst({ where: { name: 'Havas Group' } });
  if (!havas) {
    console.log('Havas Group not found');
    return;
  }

  let linkedCount = 0;

  for (const network of havasNetworks) {
    // Find the main network
    const mainNetwork = await prisma.company.findFirst({
      where: { name: network.name }
    });

    if (!mainNetwork) {
      console.log('Network not found: ' + network.name);
      continue;
    }

    console.log('\n--- ' + network.name + ' ---');

    // If specific locations are listed, use those
    if (network.locations) {
      for (const locName of network.locations) {
        const loc = await prisma.company.findFirst({
          where: { name: { equals: locName, mode: 'insensitive' } }
        });
        if (loc && loc.id !== mainNetwork.id) {
          if (!loc.parentCompanyId) {
            await prisma.company.update({
              where: { id: loc.id },
              data: { parentCompanyId: mainNetwork.id }
            });
            console.log('  Linked: ' + loc.name);
            linkedCount++;
          } else if (loc.parentCompanyId === havas.id) {
            // Move from Havas to network
            await prisma.company.update({
              where: { id: loc.id },
              data: { parentCompanyId: mainNetwork.id }
            });
            console.log('  Moved: ' + loc.name);
            linkedCount++;
          }
        }
      }
    }

    // Also find by pattern
    if (network.pattern) {
      const locations = await prisma.company.findMany({
        where: {
          name: { startsWith: network.pattern },
          id: { not: mainNetwork.id }
        }
      });

      for (const loc of locations) {
        // Skip if it's another network's HQ
        const isNetwork = havasNetworks.some(n => n.name === loc.name);
        if (isNetwork) continue;

        if (!loc.parentCompanyId) {
          await prisma.company.update({
            where: { id: loc.id },
            data: { parentCompanyId: mainNetwork.id }
          });
          console.log('  Linked: ' + loc.name);
          linkedCount++;
        } else if (loc.parentCompanyId === havas.id) {
          // Move from Havas to network
          await prisma.company.update({
            where: { id: loc.id },
            data: { parentCompanyId: mainNetwork.id }
          });
          console.log('  Moved: ' + loc.name);
          linkedCount++;
        }
      }
    }
  }

  console.log('\n\nTotal linked: ' + linkedCount);

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
