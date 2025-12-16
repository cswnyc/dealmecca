import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + createId().slice(0, 8);
}

function inferSeniority(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('director')) return 'DIRECTOR';
  if (t.includes('supervisor') || t.includes('manager')) return 'MANAGER';
  if (t.includes('specialist')) return 'SPECIALIST';
  return 'SPECIALIST';
}

async function main() {
  console.log('Importing &well agency...\n');

  // Check if &well exists
  let agency = await prisma.company.findFirst({
    where: { name: { equals: '&well', mode: 'insensitive' } }
  });

  if (!agency) {
    agency = await prisma.company.create({
      data: {
        id: createId(),
        name: '&well',
        slug: generateSlug('&well'),
        companyType: 'AGENCY',
        website: 'https://and-well.com',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log(`CREATED Agency: &well (${agency.id})`);
  } else {
    console.log(`&well already exists (${agency.id})`);
  }

  const contacts = [
    { firstName: 'Caroline', lastName: 'Matthews', title: 'Media Director', email: 'caroline.matthews@and-well.com' },
    { firstName: 'Jocelyn', lastName: 'Smith', title: 'Media Supervisor', email: 'jocelyn.smith@and-well.com' },
    { firstName: 'Amanda', lastName: 'Broering', title: 'Media Specialist', email: 'amanda.broering@and-well.com' }
  ];

  let created = 0;
  for (const c of contacts) {
    const existing = await prisma.contact.findFirst({
      where: { email: c.email }
    });

    if (existing) {
      console.log(`SKIP: ${c.firstName} ${c.lastName} (already exists)`);
      continue;
    }

    const contact = await prisma.contact.create({
      data: {
        id: createId(),
        firstName: c.firstName,
        lastName: c.lastName,
        fullName: `${c.firstName} ${c.lastName}`,
        title: c.title,
        email: c.email,
        companyId: agency.id,
        verified: true,
        seniority: inferSeniority(c.title) as any,
        updatedAt: new Date()
      }
    });
    console.log(`CREATED: ${contact.fullName} (${c.title})`);
    created++;
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Agency: ${agency.name}`);
  console.log(`Contacts created: ${created}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
