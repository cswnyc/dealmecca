import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

async function main() {
  const ipg = await prisma.company.findFirst({ where: { name: { contains: 'Interpublic' } } });
  if (!ipg) { console.log('IPG not found'); return; }

  console.log('Found IPG: ' + ipg.id);

  // Agencies that need to be linked directly to IPG
  const linkToIPG = [
    'Resolute Digital',
    'Media Experts',
    'Solve(d)',
    'IW Group',
    'J3',
    'IPG Media Lab',
    'Genuine',
    'Xpeto',
    'EP+Co',
    '215mccann',
    'The Axis Agency',
    'Frukt',
    'Rise & Run',
    'Rogers & Cowan PMK',
    'Neon NYC',
    'Identity Worldwide',
    'The Brooklyn Brothers',
    'Big Family Table',
    'New Honor Society',
    'AFG&',
    'HUSTLE',
  ];

  // Fix The Martin Agency - move from Omnicom to IPG
  const martinAgency = await prisma.company.findFirst({ where: { name: 'The Martin Agency' } });
  if (martinAgency) {
    await prisma.company.update({
      where: { id: martinAgency.id },
      data: { parentCompanyId: ipg.id }
    });
    console.log('Moved The Martin Agency to IPG');
  }

  // Link orphaned agencies to IPG
  for (const name of linkToIPG) {
    const company = await prisma.company.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (company) {
      if (!company.parentCompanyId) {
        await prisma.company.update({
          where: { id: company.id },
          data: { parentCompanyId: ipg.id }
        });
        console.log('Linked: ' + company.name);
      } else {
        console.log('Already has parent: ' + company.name);
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
          companyType: 'AGENCY',
          parentCompanyId: ipg.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('Created & linked: ' + name);
    }
  }

  // Also link Mediahub main to IPG (if not already)
  const mediahub = await prisma.company.findFirst({ where: { name: 'Mediahub' } });
  if (mediahub && !mediahub.parentCompanyId) {
    await prisma.company.update({
      where: { id: mediahub.id },
      data: { parentCompanyId: ipg.id }
    });
    console.log('Linked: Mediahub');
  }

  // Create Mediahub Worldwide if it doesn't exist as HQ
  const mediahubWW = await prisma.company.findFirst({ where: { name: 'Mediahub Worldwide' } });
  if (!mediahubWW) {
    await prisma.company.create({
      data: {
        id: createId(),
        name: 'Mediahub Worldwide',
        slug: 'mediahub-worldwide',
        companyType: 'AGENCY',
        parentCompanyId: ipg.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log('Created & linked: Mediahub Worldwide');
  }

  console.log('\nDone!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
