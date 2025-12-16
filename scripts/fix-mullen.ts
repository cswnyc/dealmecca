import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check MullenLowe situation
  const ml = await prisma.company.findFirst({ where: { name: 'MullenLowe' } });
  const mlGroup = await prisma.company.findFirst({ where: { name: 'MullenLowe Group' } });

  if (ml && mlGroup) {
    console.log('MullenLowe: ' + ml.id + ' (parent: ' + ml.parentCompanyId + ')');
    console.log('MullenLowe Group: ' + mlGroup.id + ' (parent: ' + mlGroup.parentCompanyId + ')');

    // MullenLowe should be under MullenLowe Group
    if (ml.parentCompanyId !== mlGroup.id) {
      await prisma.company.update({ where: { id: ml.id }, data: { parentCompanyId: mlGroup.id } });
      console.log('Moved MullenLowe under MullenLowe Group');
    }
  }

  // Also check Mullen entries
  const mullens = await prisma.company.findMany({ where: { name: { contains: 'Mullen' } } });
  console.log('\nAll Mullen entries:');
  mullens.forEach(m => console.log('  ' + m.name + ' (parent: ' + (m.parentCompanyId || 'none') + ')'));
}

main().catch(console.error).finally(() => prisma.$disconnect());
