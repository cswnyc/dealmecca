import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const omnicom = await prisma.company.findFirst({ where: { name: 'Omnicom Group' } });

  if (!omnicom) {
    console.log('Omnicom Group not found');
    return;
  }

  // Define main network agencies
  const networks = [
    { name: 'BBDO', pattern: 'BBDO' },
    { name: 'DDB Worldwide', findBy: 'DDB', pattern: 'DDB' },
    { name: 'TBWA\\Worldwide', pattern: 'TBWA' },
    { name: 'OMD', pattern: 'OMD' },
    { name: 'PHD Media', pattern: 'PHD' },
    { name: 'Hearts & Science', pattern: 'Hearts & Science' },
    { name: 'FleishmanHillard', pattern: 'FleishmanHillard' },
    { name: 'Ketchum Inc', pattern: 'Ketchum' },
    { name: 'Porter Novelli', pattern: 'Porter Novelli' },
    { name: 'The Integer Group', pattern: 'Integer' },
    { name: 'GSD&M', pattern: 'GSD&M' },
    { name: 'The Martin Agency', pattern: 'Martin Agency' },
    { name: 'Zimmerman Advertising', pattern: 'Zimmerman' },
    { name: 'Omnicom Media Group', pattern: 'Omnicom Media Group' },
    { name: 'Organic Inc', pattern: 'Organic' },
    { name: 'Resolution Agency', pattern: 'Resolution Agency' },
    { name: 'Rapport', pattern: 'Rapport' },
    { name: 'OMG23', pattern: 'OMG23' },
    { name: 'Merkley+Partners', pattern: 'Merkley' },
    { name: 'DDB Health', pattern: 'DDB Health' },
    { name: 'DDB Remedy', pattern: 'DDB Remedy' },
    { name: 'Adam & Eve/DDB', pattern: 'Adam' },
    { name: 'Anderson DDB', pattern: 'Anderson DDB' },
    { name: 'TrackDDB', pattern: 'TrackDDB' },
    { name: 'EnergyBBDO', pattern: 'EnergyBBDO' },
    { name: 'Clemenger BBDO Melbourne', pattern: 'Clemenger' },
    { name: 'Colenso BBDO', pattern: 'Colenso' },
    { name: 'Abbott Mead Vickers BBDO', pattern: 'Abbott Mead' },
    { name: 'TBWA\\Chiat\\Day', pattern: 'TBWA\\Chiat\\Day' },
    { name: 'TBWA\\Media Arts Lab', pattern: 'TBWA\\Media Arts Lab' },
    { name: 'TBWA\\WorldHealth', pattern: 'TBWA\\WorldHealth' },
    { name: 'Manning Gottlieb OMD', pattern: 'Manning Gottlieb' },
    { name: 'Critical Mass', pattern: 'Critical Mass' },
    { name: 'Interbrand', pattern: 'Interbrand' },
    { name: 'Spike DDB', pattern: 'Spike DDB' },
  ];

  // Patterns to exclude from generic linking (they're not Omnicom)
  const excludePatterns = ['Valley', 'Estates', 'Tequila', 'Aubrey', 'Beam', 'Horizon', 'MaryRuth', 'Mielle', 'Pantalones', 'DASH TWO', 'CCOMGroup'];

  let linkedCount = 0;

  for (const network of networks) {
    // Find main network
    let mainNetwork = await prisma.company.findFirst({
      where: { name: network.name }
    });

    // Try alternate search
    if (!mainNetwork && network.findBy) {
      mainNetwork = await prisma.company.findFirst({
        where: { name: network.findBy }
      });
    }

    if (!mainNetwork) {
      // Try to find by pattern
      mainNetwork = await prisma.company.findFirst({
        where: { name: { startsWith: network.pattern } }
      });
    }

    if (mainNetwork) {
      // Link to Omnicom if not already
      if (!mainNetwork.parentCompanyId) {
        await prisma.company.update({
          where: { id: mainNetwork.id },
          data: { parentCompanyId: omnicom.id }
        });
        console.log('Linked ' + mainNetwork.name + ' to Omnicom Group');
        linkedCount++;
      }

      // Link locations that match pattern
      const locations = await prisma.company.findMany({
        where: {
          name: { startsWith: network.pattern },
          parentCompanyId: null,
          id: { not: mainNetwork.id }
        }
      });

      for (const loc of locations) {
        // Skip excluded patterns
        let skip = false;
        for (const excl of excludePatterns) {
          if (loc.name.includes(excl)) { skip = true; break; }
        }
        if (skip) continue;

        // Skip if it's another network's headquarters
        const isAnotherNetwork = networks.some(n => n.name === loc.name && n.name !== network.name);
        if (isAnotherNetwork) continue;

        await prisma.company.update({
          where: { id: loc.id },
          data: { parentCompanyId: mainNetwork.id }
        });
        linkedCount++;
      }
    } else {
      console.log('Network not found: ' + network.name);
    }
  }

  console.log('');
  console.log('Total linked: ' + linkedCount);

  // Show final structure
  const finalNetworks = await prisma.company.findMany({
    where: { parentCompanyId: omnicom.id },
    select: {
      name: true,
      _count: { select: { subsidiaries: true } }
    },
    orderBy: { name: 'asc' }
  });

  console.log('');
  console.log('=== Omnicom Group Networks (' + finalNetworks.length + ') ===');
  let totalLocs = 0;
  finalNetworks.forEach(n => {
    console.log(n.name + ' (' + n._count.subsidiaries + ')');
    totalLocs += n._count.subsidiaries;
  });
  console.log('');
  console.log('Total: ' + finalNetworks.length + ' networks, ' + totalLocs + ' locations');
}

main().catch(console.error).finally(() => prisma.$disconnect());
