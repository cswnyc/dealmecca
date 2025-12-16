import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

// Havas Group agencies from screenshots
const havasAgencies = [
  'Havas Media Group',
  'Havas Creative',
  'Republica HAVAS',
  'Havas Edge',
  'Arnold Worldwide',
  'Havas Lynx',
  'HAVAS Play',
  'The Annex 88',
  'Arena Media',
  'HAVAS Formula',
  'Health4Brands',
  'Jacques',
  'Havas Entertainment',
  'Red Havas',
  'Havas Life',
  'Camp + King',
  'Havas Health & You',
  'Havas CX Helia',
  'FullSix Group',
];

async function main() {
  // First find or create Havas Group
  let havas = await prisma.company.findFirst({
    where: { name: { contains: 'Havas', mode: 'insensitive' } }
  });

  // Check if it's the holding company
  if (havas && havas.name !== 'Havas Group') {
    // Look specifically for Havas Group
    const havasGroup = await prisma.company.findFirst({
      where: { name: 'Havas Group' }
    });
    if (havasGroup) {
      havas = havasGroup;
    } else {
      // Create Havas Group
      havas = await prisma.company.create({
        data: {
          id: createId(),
          name: 'Havas Group',
          slug: 'havas-group',
          companyType: 'MEDIA_HOLDING_COMPANY',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('Created Havas Group');
    }
  } else if (!havas) {
    // Create Havas Group
    havas = await prisma.company.create({
      data: {
        id: createId(),
        name: 'Havas Group',
        slug: 'havas-group',
        companyType: 'MEDIA_HOLDING_COMPANY',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log('Created Havas Group');
  }

  console.log('Havas Group ID: ' + havas.id);

  const found: string[] = [];
  const created: string[] = [];
  const linked: string[] = [];

  for (const name of havasAgencies) {
    const company = await prisma.company.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (company) {
      if (company.parentCompanyId === havas.id) {
        found.push(name);
      } else if (!company.parentCompanyId) {
        await prisma.company.update({
          where: { id: company.id },
          data: { parentCompanyId: havas.id }
        });
        linked.push(name);
      } else {
        console.log('Has different parent: ' + name + ' -> ' + company.parentCompanyId);
      }
    } else {
      // Create the agency
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      let finalSlug = slug;
      let slugExists = await prisma.company.findUnique({ where: { slug: finalSlug } });
      let counter = 1;
      while (slugExists) {
        finalSlug = slug + '-' + counter;
        slugExists = await prisma.company.findUnique({ where: { slug: finalSlug } });
        counter++;
      }

      await prisma.company.create({
        data: {
          id: createId(),
          name: name,
          slug: finalSlug,
          companyType: 'HOLDING_COMPANY_AGENCY',
          parentCompanyId: havas.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      created.push(name);
    }
  }

  console.log('\nAlready linked (' + found.length + '): ' + found.join(', '));
  console.log('\nNewly linked (' + linked.length + '): ' + linked.join(', '));
  console.log('\nCreated (' + created.length + '): ' + created.join(', '));

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
