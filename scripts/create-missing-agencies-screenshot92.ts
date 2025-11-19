import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

const missingAgencies = [
  {
    name: 'D\'Exposito & Partners',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Callan LA',
    city: 'Burbank',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Wingman Media',
    city: 'Westlake Village',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Incremental Media',
    city: 'Bellmore',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Labelium Chicago',
    city: 'Chicago',
    state: 'IL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Wild Hive',
    city: 'Austin',
    state: 'TX',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Archer Malmo Memphis',
    city: 'Memphis',
    state: 'TN',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Novus Media Minneapolis',
    city: 'Saint Louis Park',
    state: 'MN',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Walton Isaacson Chicago',
    city: 'Chicago',
    state: 'IL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
];

async function createMissingAgencies() {
  console.log('🚀 Creating missing agencies from Screenshot 92...\n');

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
