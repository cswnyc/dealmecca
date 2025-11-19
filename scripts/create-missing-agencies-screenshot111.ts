import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

const missingAgencies = [
  {
    name: 'Iluminere',
    city: 'Dallas',
    state: 'TX',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Jellyfish LA',
    city: 'Los Angeles',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Manhattan Media Services',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Idea Peddler',
    city: 'Austin',
    state: 'TX',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Prime Time Marketing',
    city: 'Chicago',
    state: 'IL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'The EGC Group NY',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Fors Marsh',
    city: undefined,
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'GS&F',
    city: 'Nashville',
    state: 'TN',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'PASHN Media Agency',
    city: undefined,
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'HUGE London',
    city: 'London',
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Venables Bell & Partners',
    city: 'San Francisco',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Mindgruve Charleston',
    city: 'Mount Pleasant',
    state: 'SC',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Good Giant Mobile',
    city: 'Mobile',
    state: 'AL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Critical Mass Toronto',
    city: 'Toronto',
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'MARCA Miami',
    city: 'Coconut Grove',
    state: 'FL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Mighty Union',
    city: 'North Andover',
    state: 'MA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
];

async function createMissingAgencies() {
  console.log('🚀 Creating missing agencies from Screenshot 111...\n');

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
