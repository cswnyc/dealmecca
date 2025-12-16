import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ipg = await prisma.company.findFirst({ where: { name: { contains: 'Interpublic' } } });

  if (!ipg) {
    console.log('IPG not found');
    return;
  }

  console.log('Found: ' + ipg.name);

  // IPG networks and their patterns
  const networks = [
    { name: 'McCann Worldgroup', pattern: 'McCann', excludePatterns: ['215mccann'] },
    { name: 'FCB', pattern: 'FCB' },
    { name: 'FCB Health', pattern: 'FCB Health' },
    { name: 'FCB/SIX', pattern: 'FCB/SIX' },
    { name: 'FCB/RED', pattern: 'FCB/RED' },
    { name: 'FCBCURE', pattern: 'FCBCURE' },
    { name: 'FCB Inferno', pattern: 'FCB Inferno' },
    { name: 'MullenLowe Group', pattern: 'MullenLowe' },
    { name: 'Mullen', pattern: 'Mullen', excludePatterns: ['MullenLowe'] },
    { name: 'R/GA', pattern: 'R/GA' },
    { name: 'HUGE', pattern: 'HUGE' },
    { name: 'Weber Shandwick', pattern: 'Weber Shandwick' },
    { name: 'Golin', pattern: 'Golin' },
    { name: 'Deutsch', pattern: 'Deutsch', excludePatterns: ['Family Wine'] },
    { name: 'Hill Holliday', pattern: 'Hill Holliday' },
    { name: 'Carmichael Lynch', pattern: 'Carmichael Lynch' },
    { name: 'UM', pattern: 'UM ' },
    { name: 'Initiative', pattern: 'Initiative' },
    { name: 'IPG Mediabrands', pattern: 'Mediabrands' },
    { name: 'Kinesso', pattern: 'Kinesso' },
    { name: 'MAGNA', pattern: 'MAGNA' },
    { name: 'Acxiom', pattern: 'Acxiom' },
    { name: 'Octagon', pattern: 'Octagon' },
    { name: 'Jack Morton', pattern: 'Jack Morton' },
    { name: 'Momentum Worldwide', pattern: 'Momentum' },
    { name: 'Current Global', pattern: 'Current Global' },
    { name: 'DeVries Global', pattern: 'DeVries' },
    { name: 'Campbell Ewald', pattern: 'Campbell Ewald' },
    { name: 'Casanova//McCann', pattern: 'Casanova' },
    { name: 'Commonwealth//McCann', pattern: 'Commonwealth//McCann' },
    { name: 'Craft Worldwide', pattern: 'Craft' },
    { name: 'Tierney', pattern: 'Tierney' },
    { name: 'MRM', pattern: 'MRM' },
    { name: 'Mediahub', pattern: 'Mediahub' },
    { name: 'Orion Worldwide', pattern: 'Orion' },
    { name: 'Reprise', pattern: 'Reprise' },
    { name: 'Matterkind', pattern: 'Matterkind' },
    { name: 'The Martin Agency', pattern: 'Martin Agency' },
    { name: 'Lowe and Partners', pattern: 'Lowe' },
    { name: 'UM Studios', pattern: 'UM Studios' },
  ];

  // Patterns to exclude (not IPG related)
  const globalExcludes = ['Museum', 'Consortium', 'Aquarium', 'Edison', 'Kentucky', 'Curium', 'Pharma', 'Hotels', 'Craft', 'Booch', '21c'];

  let linkedCount = 0;

  for (const network of networks) {
    // Find main network
    let mainNetwork = await prisma.company.findFirst({
      where: { name: network.name }
    });

    // If not found, try to find first matching pattern
    if (!mainNetwork) {
      mainNetwork = await prisma.company.findFirst({
        where: {
          name: { startsWith: network.pattern },
          parentCompanyId: null
        }
      });
    }

    if (!mainNetwork) {
      console.log('Network not found: ' + network.name);
      continue;
    }

    // Link to IPG if not already
    if (!mainNetwork.parentCompanyId) {
      await prisma.company.update({
        where: { id: mainNetwork.id },
        data: { parentCompanyId: ipg.id }
      });
      console.log('Linked ' + mainNetwork.name + ' to IPG');
      linkedCount++;
    }

    // Link locations
    const locations = await prisma.company.findMany({
      where: {
        name: { startsWith: network.pattern },
        parentCompanyId: null,
        id: { not: mainNetwork.id }
      }
    });

    for (const loc of locations) {
      // Skip global excludes
      let skip = false;
      for (const excl of globalExcludes) {
        if (loc.name.includes(excl)) { skip = true; break; }
      }
      // Skip network-specific excludes
      if (network.excludePatterns) {
        for (const excl of network.excludePatterns) {
          if (loc.name.includes(excl)) { skip = true; break; }
        }
      }
      if (skip) continue;

      // Skip if it's another network's HQ
      const isAnotherNetwork = networks.some(n => n.name === loc.name && n.name !== network.name);
      if (isAnotherNetwork) continue;

      await prisma.company.update({
        where: { id: loc.id },
        data: { parentCompanyId: mainNetwork.id }
      });
      linkedCount++;
    }
  }

  console.log('');
  console.log('Total linked: ' + linkedCount);

  // Show final structure
  const finalNetworks = await prisma.company.findMany({
    where: { parentCompanyId: ipg.id },
    select: {
      name: true,
      _count: { select: { subsidiaries: true } }
    },
    orderBy: { name: 'asc' }
  });

  console.log('');
  console.log('=== IPG Networks (' + finalNetworks.length + ') ===');
  let totalLocs = 0;
  finalNetworks.forEach(n => {
    console.log(n.name + ' (' + n._count.subsidiaries + ')');
    totalLocs += n._count.subsidiaries;
  });
  console.log('');
  console.log('Total: ' + finalNetworks.length + ' networks, ' + totalLocs + ' locations');
}

main().catch(console.error).finally(() => prisma.$disconnect());
