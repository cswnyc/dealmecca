import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Complete list of IPG agencies from screenshots
const ipgAgencies = [
  'Rapport',
  'Initiative',
  'Kinesso',
  'FCB',
  'The Martin Agency',
  'Healix',
  'Universal McCann',
  'Mediahub Worldwide',
  'Resolute Digital',
  'Media Experts',
  'IPG Mediabrands',
  'Carmichael Lynch',
  'FCB Health',
  'McCann Health',
  'Magna Global',
  'Weber Shandwick Worldwide',
  'McCann',
  'Deutsch',
  'MRM',
  'Orion Worldwide',
  'MullenLowe Group U.S.',
  'Solve(d)',
  'IW Group',
  'Golin',
  'Area 23',
  'Momentum Worldwide',
  'Campbell Ewald',
  'J3',
  'Jack Morton Worldwide',
  'IPG Media Lab',
  'Casanova//McCann',
  'Genuine',
  'MullenLowe Group',
  'Xpeto',
  'EP+Co',
  '215mccann',
  'The Axis Agency',
  'Frukt',
  'MullenLowe Profero',
  'Rise & Run',
  'Octagon',
  'FCBCURE',
  'Rogers & Cowan PMK',
  'Performance Art',
  'Neon NYC',
  'Identity Worldwide',
  'FutureBrand',
  'Elephant',
  'The Brooklyn Brothers',
  'Current Global',
  'Reprise Digital',
  'FCB Inferno',
  'Big Family Table',
  'New Honor Society',
  'AFG&',
  'FCB/SIX',
  'HUSTLE',
];

async function main() {
  const ipg = await prisma.company.findFirst({ where: { name: { contains: 'Interpublic' } } });
  if (!ipg) { console.log('IPG not found'); return; }

  console.log('=== Checking IPG Agencies ===\n');

  const found: string[] = [];
  const notFound: string[] = [];
  const notLinked: string[] = [];

  for (const agency of ipgAgencies) {
    const company = await prisma.company.findFirst({
      where: { name: { equals: agency, mode: 'insensitive' } }
    });

    if (!company) {
      // Try partial match
      const partial = await prisma.company.findFirst({
        where: { name: { contains: agency, mode: 'insensitive' } }
      });
      if (partial) {
        // Check if linked to IPG
        if (partial.parentCompanyId === ipg.id) {
          found.push(agency + ' (as ' + partial.name + ')');
        } else {
          notLinked.push(agency + ' (as ' + partial.name + ', parent: ' + partial.parentCompanyId + ')');
        }
      } else {
        notFound.push(agency);
      }
    } else {
      if (company.parentCompanyId === ipg.id) {
        found.push(agency);
      } else {
        notLinked.push(agency + ' (parent: ' + company.parentCompanyId + ')');
      }
    }
  }

  console.log('FOUND & LINKED (' + found.length + '):');
  found.forEach(f => console.log('  ✓ ' + f));

  console.log('\nNOT FOUND (' + notFound.length + '):');
  notFound.forEach(f => console.log('  ✗ ' + f));

  console.log('\nEXISTS BUT NOT LINKED TO IPG (' + notLinked.length + '):');
  notLinked.forEach(f => console.log('  ! ' + f));
}

main().catch(console.error).finally(() => prisma.$disconnect());
