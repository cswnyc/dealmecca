import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

const missingAgencies = [
  {
    name: 'Mother London',
    city: 'London',
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Planet Central Richmond',
    city: 'Richmond',
    state: 'VA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Partners + Napier NYC',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Iced Media',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'True Media Columbia',
    city: 'Columbia',
    state: 'MO',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'French/West/Vaughan',
    city: 'Raleigh',
    state: 'NC',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Ignited LA',
    city: 'El Segundo',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'SEEZ',
    city: 'Raleigh',
    state: 'NC',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Tier10 Marketing DC',
    city: 'Herndon',
    state: 'VA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Luckie & Company Birmingham',
    city: 'Birmingham',
    state: 'AL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Merlino Media',
    city: 'Seattle',
    state: 'WA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'RQ Agency',
    city: 'Hollywood',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'MERGE LA',
    city: 'Costa Mesa',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Big Village NY',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'The DuMont Project',
    city: 'Marina del Rey',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Moroch Milwaukee',
    city: 'Milwaukee',
    state: 'WI',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'AnalogFolk UK',
    city: 'London',
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'One Nine Media',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
];

async function createMissingAgencies() {
  console.log('🚀 Creating missing agencies from Screenshot 117...\n');

  for (const agency of missingAgencies) {
    try {
      // Check if agency already exists
      const existing = await prisma.company.findFirst({
        where: { name: agency.name },
      });

      if (existing) {
        console.log(`⚠️  Agency already exists: ${agency.name}`);
        continue;
      }

      // Generate slug
      let slug = agency.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

      // Check if slug exists and append suffix if needed
      let slugExists = await prisma.company.findUnique({ where: { slug } });
      let counter = 1;
      while (slugExists) {
        slug = `${agency.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-${counter}`;
        counter++;
        slugExists = await prisma.company.findUnique({ where: { slug } });
      }

      // Create the agency
      const newAgency = await prisma.company.create({
        data: {
          id: createId(),
          name: agency.name,
          slug: slug,
          city: agency.city,
          state: agency.state,
          companyType: agency.type,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const location = agency.city && agency.state
        ? `${agency.city}, ${agency.state}`
        : agency.city
        ? agency.city
        : '(location not specified)';

      console.log(`✅ Created agency: ${newAgency.name} (${location}) - slug: ${slug}`);
    } catch (error) {
      console.error(`❌ Error creating ${agency.name}:`, error);
    }
  }

  console.log('\n✨ Done creating missing agencies!');
}

createMissingAgencies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
