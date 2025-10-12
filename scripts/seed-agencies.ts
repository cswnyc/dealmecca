import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const agencies = [
  {
    name: 'Kinesso SF',
    slug: 'kinesso-sf',
    companyType: 'INDEPENDENT_AGENCY',
    agencyType: 'DATA_ANALYTICS',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    verified: true,
    teamCount: 12,
  },
  {
    name: 'OMD Chicago',
    slug: 'omd-chicago',
    companyType: 'INDEPENDENT_AGENCY',
    agencyType: 'MEDIA_BUYING',
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    verified: true,
    teamCount: 22,
  },
  {
    name: 'The Marketing Practice Denver',
    slug: 'the-marketing-practice-denver',
    companyType: 'INDEPENDENT_AGENCY',
    agencyType: 'FULL_SERVICE',
    city: 'Denver',
    state: 'CO',
    country: 'US',
    verified: true,
    teamCount: 8,
  },
  {
    name: 'Billups NY',
    slug: 'billups-ny',
    companyType: 'INDEPENDENT_AGENCY',
    agencyType: 'MEDIA_BUYING',
    city: 'New York City',
    state: 'NY',
    country: 'US',
    verified: true,
    teamCount: 81,
    description: 'Leading out-of-home (OOH) advertising agency specializing in outdoor media planning and buying.',
  },
  {
    name: 'EssenceMediacom NY',
    slug: 'essencemediacom-ny',
    companyType: 'INDEPENDENT_AGENCY',
    agencyType: 'MEDIA_SPECIALIST',
    city: 'New York City',
    state: 'NY',
    country: 'US',
    verified: true,
    teamCount: 49,
  },
  {
    name: 'Wieden+Kennedy',
    slug: 'wieden-kennedy',
    companyType: 'INDEPENDENT_AGENCY',
    agencyType: 'CREATIVE_SPECIALIST',
    city: 'Portland',
    state: 'OR',
    country: 'US',
    verified: true,
    teamCount: 67,
  },
  {
    name: 'GroupM',
    slug: 'groupm',
    companyType: 'MEDIA_HOLDING_COMPANY',
    agencyType: 'FULL_SERVICE',
    city: 'New York City',
    state: 'NY',
    country: 'US',
    verified: true,
    teamCount: 89,
    description: 'Global media investment group and parent company to WPP media agencies.',
  },
  {
    name: 'Publicis Media',
    slug: 'publicis-media',
    companyType: 'HOLDING_COMPANY_AGENCY',
    agencyType: 'MEDIA_SPECIALIST',
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    verified: true,
    teamCount: 71,
  },
  {
    name: 'Havas Media',
    slug: 'havas-media',
    companyType: 'HOLDING_COMPANY_AGENCY',
    agencyType: 'MEDIA_SPECIALIST',
    city: 'Los Angeles',
    state: 'CA',
    country: 'US',
    verified: true,
    teamCount: 54,
  },
  {
    name: 'IPG Mediabrands',
    slug: 'ipg-mediabrands',
    companyType: 'HOLDING_COMPANY_AGENCY',
    agencyType: 'FULL_SERVICE',
    city: 'New York City',
    state: 'NY',
    country: 'US',
    verified: true,
    teamCount: 93,
  },
  {
    name: 'Dentsu',
    slug: 'dentsu',
    companyType: 'HOLDING_COMPANY_AGENCY',
    agencyType: 'FULL_SERVICE',
    city: 'New York City',
    state: 'NY',
    country: 'US',
    verified: true,
    teamCount: 76,
  },
  {
    name: 'R/GA',
    slug: 'rga',
    companyType: 'INDEPENDENT_AGENCY',
    agencyType: 'DIGITAL_SPECIALIST',
    city: 'New York City',
    state: 'NY',
    country: 'US',
    verified: true,
    teamCount: 45,
  },
  {
    name: 'BBDO',
    slug: 'bbdo',
    companyType: 'HOLDING_COMPANY_AGENCY',
    agencyType: 'CREATIVE_SPECIALIST',
    city: 'New York City',
    state: 'NY',
    country: 'US',
    verified: true,
    teamCount: 82,
  },
  {
    name: 'DDB',
    slug: 'ddb',
    companyType: 'HOLDING_COMPANY_AGENCY',
    agencyType: 'FULL_SERVICE',
    city: 'New York City',
    state: 'NY',
    country: 'US',
    verified: true,
    teamCount: 67,
  },
  {
    name: 'McCann',
    slug: 'mccann',
    companyType: 'HOLDING_COMPANY_AGENCY',
    agencyType: 'FULL_SERVICE',
    city: 'New York City',
    state: 'NY',
    country: 'US',
    verified: true,
    teamCount: 74,
  },
  {
    name: 'Interpublic Group',
    slug: 'interpublic-group',
    companyType: 'MEDIA_HOLDING_COMPANY',
    agencyType: 'FULL_SERVICE',
    city: 'New York',
    state: 'NY',
    country: 'US',
    verified: true,
    teamCount: 150,
    description: 'One of the world\'s largest advertising and marketing services organizations.',
  },
  {
    name: 'MediaCom',
    slug: 'mediacom',
    companyType: 'INDEPENDENT_AGENCY',
    agencyType: 'MEDIA_BUYING',
    city: 'New York',
    state: 'NY',
    country: 'US',
    verified: true,
    teamCount: 95,
    description: 'Global media agency network and part of WPP\'s GroupM.',
  },
];

async function main() {
  console.log('Starting to seed agencies...');

  for (const agency of agencies) {
    try {
      // Check if agency already exists
      const existing = await prisma.companies.findFirst({
        where: {
          OR: [
            { slug: agency.slug },
            { name: agency.name }
          ]
        }
      });

      if (existing) {
        console.log(`Agency "${agency.name}" already exists, skipping...`);
        continue;
      }

      // Create the agency
      await prisma.companies.create({
        data: {
          id: `agency_${agency.slug}`,
          ...agency,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      console.log(`✓ Created agency: ${agency.name}`);
    } catch (error) {
      console.error(`✗ Failed to create agency "${agency.name}":`, error);
    }
  }

  console.log('Finished seeding agencies!');
}

main()
  .catch((e) => {
    console.error('Error seeding agencies:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
