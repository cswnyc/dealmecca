import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

const missingAgencies = [
  {
    name: 'Basis Technologies Chicago',
    city: 'Chicago',
    state: 'IL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Vision Media',
    city: 'Redmond',
    state: 'WA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Veritas Media Group',
    city: 'Oakland',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Transmission NY',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Mindgruve NY',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Mars United Commerce NY',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Situation Interactive',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Strategic Media Services',
    city: 'Arlington',
    state: 'VA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'The Wilson Group',
    city: 'Dallas',
    state: 'TX',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Eversana Intouch Solutions NY',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'LMO Advertising DC',
    city: 'Arlington',
    state: 'VA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Powers of Reasoning',
    city: undefined,
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Wilkins Media Milwaukee',
    city: 'Glendale',
    state: 'WI',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'R&R Partners Phoenix',
    city: 'Phoenix',
    state: 'AZ',
    type: 'INDEPENDENT_AGENCY' as const,
  },
];

async function createMissingAgencies() {
  console.log('🚀 Creating missing agencies from Screenshot 110...\n');

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
