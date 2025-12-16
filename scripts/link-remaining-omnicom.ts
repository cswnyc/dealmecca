import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const omnicom = await prisma.company.findFirst({ where: { name: 'Omnicom Group' } });

  if (!omnicom) {
    console.log('Omnicom Group not found');
    return;
  }

  // All the missing networks and their patterns
  const networksToLink = [
    { name: 'Agency 720', pattern: 'Agency 720' },
    { name: 'Alma Agency', altPattern: 'Alma', excludePatterns: ['Cuba', 'Almased', 'Almatica', 'Balmain', 'CalMac', 'Malman', 'Walmart'] },
    { name: 'Beanstalk', pattern: 'Beanstalk' },
    { name: 'Biolumina', pattern: 'Biolumina' },
    { name: 'BRIGHT RED', pattern: 'BRIGHT RED' },
    { name: 'CDM', pattern: 'CDM' },
    { name: 'Cone Communications', pattern: 'Cone Communications' },
    { name: 'Content Collective', pattern: 'Content Collective' },
    { name: 'Doremus', pattern: 'Doremus' },
    { name: 'eg+ worldwide', pattern: 'eg+ worldwide' },
    { name: 'fluent360', pattern: 'fluent360' },
    { name: 'GMMB', pattern: 'GMMB' },
    { name: 'GS&P', pattern: 'GS&P' },
    { name: 'Gutenberg Global', pattern: 'Gutenberg' },
    { name: 'High Road Communications', pattern: 'High Road' },
    { name: 'Javelin', pattern: 'Javelin' },
    { name: 'KERN', pattern: 'KERN' },
    { name: 'MMG', pattern: 'MMG', excludePatterns: ['MMGY'] },
    { name: 'Omnicom Precision Marketing Group', pattern: 'Omnicom Precision' },
    { name: 'One&All', pattern: 'One&All' },
    { name: 'OPTIMUM Sports', pattern: 'Optimum Sports', excludePatterns: ['Telecom'] },
    { name: 'Outdoor Media Group', pattern: 'Outdoor Media Group' },
    { name: 'Outdoor Media Alliance', pattern: 'Outdoor Media Alliance' },
    { name: 'Ptarmigan Media', pattern: 'Ptarmigan' },
    { name: 'Rowland', pattern: 'Rowland' },
    { name: 'Targetbase', pattern: 'Targetbase' },
    { name: 'TCA.tv', pattern: 'TCA', excludePatterns: ['TCAA', 'PaintCare', 'Bootcamp', 'Breastcancer'] },
    { name: 'TeamX', pattern: 'TeamX' },
    { name: 'The Marketing Arm', pattern: 'Marketing Arm' },
    { name: 'THIRD EAR', pattern: 'THIRD EAR' },
    { name: 'TogoRun', pattern: 'TogoRun' },
    { name: 'Touche!', pattern: 'Touche' },
    { name: 'TPN', pattern: 'TPN' },
    { name: 'VOX Global', pattern: 'VOX Global' },
  ];

  let linkedCount = 0;

  for (const network of networksToLink) {
    // Find main network
    let mainNetwork = await prisma.company.findFirst({
      where: { name: network.name }
    });

    if (!mainNetwork) {
      console.log('Network not found: ' + network.name);
      continue;
    }

    // Link to Omnicom if not already
    if (!mainNetwork.parentCompanyId) {
      await prisma.company.update({
        where: { id: mainNetwork.id },
        data: { parentCompanyId: omnicom.id }
      });
      console.log('Linked ' + mainNetwork.name + ' to Omnicom Group');
      linkedCount++;
    }

    // Link locations
    const pattern = network.pattern || network.altPattern;
    if (pattern) {
      const locations = await prisma.company.findMany({
        where: {
          name: { startsWith: pattern },
          parentCompanyId: null,
          id: { not: mainNetwork.id }
        }
      });

      for (const loc of locations) {
        // Skip excluded patterns
        let skip = false;
        if (network.excludePatterns) {
          for (const excl of network.excludePatterns) {
            if (loc.name.includes(excl)) { skip = true; break; }
          }
        }
        if (skip) continue;

        await prisma.company.update({
          where: { id: loc.id },
          data: { parentCompanyId: mainNetwork.id }
        });
        linkedCount++;
      }
    }
  }

  // Handle Alma separately (complex pattern)
  const almaNetwork = await prisma.company.findFirst({ where: { name: 'Alma Agency' } });
  if (almaNetwork) {
    const almaLocs = ['Alma', 'Alma Chicago', 'Alma Miami', 'Alma SF', 'Alma Tallahassee'];
    for (const name of almaLocs) {
      const loc = await prisma.company.findFirst({ where: { name } });
      if (loc && !loc.parentCompanyId && loc.id !== almaNetwork.id) {
        await prisma.company.update({
          where: { id: loc.id },
          data: { parentCompanyId: almaNetwork.id }
        });
        linkedCount++;
      }
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
