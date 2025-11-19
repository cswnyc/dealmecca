import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

const missingAgencies = [
  {
    name: '160over90 Chicago',
    city: 'Chicago',
    state: 'IL',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'BSSP SF',
    city: 'Sausalito',
    state: 'CA',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'GDC Marketing & Ideation',
    city: 'San Antonio',
    state: 'TX',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'KSV NY',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'Medium Giant',
    city: 'Dallas',
    state: 'TX',
    type: 'INDEPENDENT_AGENCY' as const,
  },
  {
    name: 'MOI Global NY',
    city: 'New York City',
    state: 'NY',
    type: 'INDEPENDENT_AGENCY' as const,
  },
];

async function createMissingAgencies() {
  console.log('🚀 Creating missing agencies from Screenshot 50...\n');

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

      console.log(`✅ Created agency: ${newAgency.name} (${newAgency.city}, ${newAgency.state}) - slug: ${slug}`);
    } catch (error) {
      console.error(`❌ Error creating ${agency.name}:`, error);
    }
  }

  console.log('\n✨ Done creating missing agencies!');
}

createMissingAgencies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
