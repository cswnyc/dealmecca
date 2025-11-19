import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

const missingAgencies = [
  {
    name: 'wedu',
    city: undefined,
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'TravelDesk London',
    city: 'London',
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Petrol Advertising',
    city: 'Burbank',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Billups Atlanta',
    city: 'Atlanta',
    state: 'GA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Opinionated',
    city: 'Portland',
    state: 'OR',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'USIM LA',
    city: 'West Hollywood',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'The Variable',
    city: 'Winston-Salem',
    state: 'NC',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Love Advertising',
    city: 'Houston',
    state: 'TX',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Wpromote Denver',
    city: 'Denver',
    state: 'CO',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Canvas Worldwide Atlanta',
    city: 'Atlanta',
    state: 'GA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Inizio Evoke SF',
    city: 'San Francisco',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Liquid Advertising LA',
    city: 'El Segundo',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'RPA Dallas',
    city: 'Irving',
    state: 'TX',
    type: 'INDEPENDENT_AGENCY' as const,
  },
];

async function createMissingAgencies() {
  console.log('🚀 Creating missing agencies from Screenshot 107...\n');

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
