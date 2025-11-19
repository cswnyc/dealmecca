import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

const missingAgencies = [
  {
    name: 'Bounteous Atlanta',
    city: 'Atlanta',
    state: 'GA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Wpromote Atlanta',
    city: 'Atlanta',
    state: 'GA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Infinity Marketing',
    city: 'Greenville',
    state: 'SC',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'rygr',
    city: 'Carbondale',
    state: 'CO',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Starmark',
    city: 'Fort Lauderdale',
    state: 'FL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Cundari Toronto',
    city: 'Toronto',
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Wieden + Kennedy London',
    city: 'London',
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'KSM South',
    city: 'Austin',
    state: 'TX',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Casual Astronaut',
    city: 'Phoenix',
    state: 'AZ',
    type: 'INDEPENDENT_AGENCY' as const,
  },
];

async function createMissingAgencies() {
  console.log('🚀 Creating missing agencies from Screenshot 94...\n');

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
