import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

const missingAgencies = [
  {
    name: 'Deloitte Digital Chicago',
    city: 'Chicago',
    state: 'IL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Precision AQ Boston',
    city: 'Boston',
    state: 'MA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'PETERMAYER',
    city: 'New Orleans',
    state: 'LA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Jellyfish SF',
    city: 'San Francisco',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'LEWIS San Diego',
    city: 'San Diego',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Closed Loop',
    city: undefined,
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Extra',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Singleton & Partners',
    city: undefined,
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Moore',
    city: 'Lanham',
    state: 'MD',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'KSV Burlington',
    city: 'Burlington',
    state: 'VT',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Add3 Seattle',
    city: 'Seattle',
    state: 'WA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Laughlin Constable Milwaukee',
    city: 'Milwaukee',
    state: 'WI',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'IMRE NY',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'john st. Toronto',
    city: 'Toronto',
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Absolute Marketing',
    city: 'Miami',
    state: 'FL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Curious Jane',
    city: 'Lakeland',
    state: 'FL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
];

async function createMissingAgencies() {
  console.log('🚀 Creating missing agencies from Screenshot 106...\n');

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
