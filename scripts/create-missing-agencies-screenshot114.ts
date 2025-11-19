import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

const missingAgencies = [
  {
    name: 'Deeplocal',
    city: 'Pittsburgh',
    state: 'PA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Interbrand NY',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Brogan & Partners Detroit',
    city: 'Birmingham',
    state: 'MI',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'cairns oneil strategic media',
    city: 'Toronto',
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'VCCP UK',
    city: 'London',
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'TouchPoint Integrated Communications',
    city: 'Darien',
    state: 'CT',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Inception Marketing',
    city: 'San Francisco',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'GSW NY',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Rebel Street',
    city: 'Phoenix',
    state: 'AZ',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'ICF Next Minneapolis',
    city: 'Minneapolis',
    state: 'MN',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'SS+K NY',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'New Standard',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Omnivore Milwaukee',
    city: 'Milwaukee',
    state: 'WI',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Albion',
    city: 'London',
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'The Community FL',
    city: 'Miami',
    state: 'FL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Saxton Horne',
    city: 'Sandy',
    state: 'UT',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Bernstein-Rein',
    city: 'Kansas City',
    state: 'MO',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Pulsar Advertising LA',
    city: 'Los Angeles',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
];

async function createMissingAgencies() {
  console.log('🚀 Creating missing agencies from Screenshot 114...\n');

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
