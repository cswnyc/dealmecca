import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

const missingAgencies = [
  {
    name: 'Brunswick Group',
    city: undefined,
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'The Marketing Practice Denver',
    city: 'Denver',
    state: 'CO',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Grady Britton',
    city: 'Portland',
    state: 'OR',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Tierra Agency',
    city: undefined,
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Generator Media+Analytics Costa Mesa',
    city: 'Costa Mesa',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Bloom Ads',
    city: 'Woodland Hills',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Intertrend Communications LA',
    city: 'Long Beach',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Creative Artists Agency',
    city: 'Los Angeles',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'GYK Antler Boston',
    city: 'Boston',
    state: 'MA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Brandon Agency Charlotte',
    city: 'Charlotte',
    state: 'NC',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Cooper Smith Toledo',
    city: 'Toledo',
    state: 'OH',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'New Engen Mukilteo',
    city: 'Mukilteo',
    state: 'WA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'the7stars London',
    city: 'London',
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
];

async function createMissingAgencies() {
  console.log('🚀 Creating missing agencies from Screenshot 104...\n');

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
