import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

const missingAgencies = [
  {
    name: 'Dieste LA',
    city: 'Los Angeles',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: '8SSixty San Diego',
    city: 'Del Mar',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'MERGE Boston',
    city: 'Boston',
    state: 'MA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Zero Gravity Marketing',
    city: undefined,
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Cooper Smith NY',
    city: 'Stamford',
    state: 'CT',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Eversana Intouch Solutions Kansas City',
    city: 'Overland Park',
    state: 'KS',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Klick Health Chicago',
    city: undefined,
    state: undefined,
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Chemistry Pittsburgh',
    city: 'Pittsburgh',
    state: 'PA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: '160over90 Charlotte',
    city: 'Charlotte',
    state: 'NC',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Yes& Agency',
    city: 'Alexandria',
    state: 'VA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Coyne PR NY',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Coyne PR Newark',
    city: 'Parsippany',
    state: 'NJ',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'MERGE Kansas City',
    city: 'Kansas City',
    state: 'MO',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'ICON International Ft. Lauderdale',
    city: 'Fort Lauderdale',
    state: 'FL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'MBuy Chicago',
    city: 'Chicago',
    state: 'IL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Stratocomm DC',
    city: 'Washington',
    state: 'DC',
    type: 'INDEPENDENT_AGENCY' as const,
  },
];

async function createMissingAgencies() {
  console.log('🚀 Creating missing agencies from Screenshot 105...\n');

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
