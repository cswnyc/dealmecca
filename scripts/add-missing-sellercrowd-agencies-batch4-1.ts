import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

/**
 * Add missing agencies from SellerCrowd batch 4 (1) import
 *
 * Usage:
 *   npx tsx scripts/add-missing-sellercrowd-agencies-batch4-1.ts
 */

const missingAgencies = [
  'Acceleration Partners Boston',
  'Ad Cucina',
  'Adams & Knight',
  'Adswerve, Inc.',
  'Allen & Gerritsen Boston',
  'Allied Sports',
  'Allied Sports NY',
  'Asher Media',
  'BB3 Advertising Atlanta',
  'BPD',
  'Bayard Advertising',
  'Breaking Ads',
  'Briggs & Caldwell',
  'Bully Pulpit Interactive Chicago',
  'Civilian San Diego',
  'Connelly Partners',
  'Corinthian Media',
  'Cossette Montreal',
  'Daybreak Studio',
  'Decoded Advertising NY',
  'DiD Agency',
  'Edelman DXI Chicago',
  'Edelman Toronto',
  'Empower Atlanta',
  'Empower Chicago',
  'Empower Cincinnati',
  'Envoy',
  'Evolve OOH NY',
  'Fahlgren Mortine Cleveland',
  'Fahlgren Mortine Columbus',
  'Familiar Creatures',
  'Fat Free Media Inc',
  'GKV',
  'GLOW',
  'GSE NY',
  'Generation Media',
  'Good Kind Digital',
  'Graham Oleson',
  'Grain Group',
  'Hill Holliday NY',
  'Horizon Next LA',
  'Intertrend Communications',
  'JPL',
  'Jellyfish Sao Paulo',
  'Known LA',
  'LaFORCE',
  'Laundry Service NY',
  'Leveraged Media',
  'Luquire',
  'Marriner Marketing',
  'Martin Retail Danbury',
  'Media Culture Dallas',
  'Mekanism SF',
  'Miles Partnership Sarasota',
  'Mindgruve San Diego',
  'Modco Media',
  'Mynt Agency',
  'NP Digital',
  'ODN Chattanooga',
  'Ocean Media NY',
  'Off Madison Ave Phoenix',
  'Orci',
  'PATHOS',
  'Perficient Digital',
  'Phoenix Creative',
  'Publicis Collective Atlanta',
  'Publicis Hawkeye Toronto',
  'QNY Creative',
  'RPA Chicago',
  'RPA Denver',
  'RPA Portland',
  'Red House Communications',
  'Robertson+Partners Las Vegas',
  'Robindale Media',
  'SCORCH Agency',
  'Screen Strategies',
  'Signal Theory Kansas City',
  'Solve',
  'Strategic America',
  'TBWA\\Chiat\\Day LA',
  'TBWA\\Chiat\\Day NY',
  'TWINOAKS NY',
  'The Goat Agency',
  'The Radio Agency',
  'The Shipyard San Diego',
  'The Wood Agency',
  'TriMark Digital',
  'Trilia Media Greenville',
  'Twigeo NY',
  'Two Rivers Marketing',
  'VaynerMedia',
  'VaynerMedia Toronto',
  'Visibility + Conversions',
  'Vladimir Jones Denver',
  'WE Communications NY',
  'Walton Isaacson Dallas',
  'Wilkins Media',
];

// City/state mappings for known locations
const locationMappings: Record<string, { city: string; state?: string; country?: string }> = {
  'LA': { city: 'Los Angeles', state: 'CA', country: 'US' },
  'NY': { city: 'New York City', state: 'NY', country: 'US' },
  'SF': { city: 'San Francisco', state: 'CA', country: 'US' },
  'Chicago': { city: 'Chicago', state: 'IL', country: 'US' },
  'San Diego': { city: 'San Diego', state: 'CA', country: 'US' },
  'Boston': { city: 'Boston', state: 'MA', country: 'US' },
  'Atlanta': { city: 'Atlanta', state: 'GA', country: 'US' },
  'Toronto': { city: 'Toronto', country: 'Canada' },
  'Denver': { city: 'Denver', state: 'CO', country: 'US' },
  'Cleveland': { city: 'Cleveland', state: 'OH', country: 'US' },
  'Columbus': { city: 'Columbus', state: 'OH', country: 'US' },
  'Greenville': { city: 'Greenville', state: 'SC', country: 'US' },
  'Sarasota': { city: 'Sarasota', state: 'FL', country: 'US' },
  'Danbury': { city: 'Danbury', state: 'CT', country: 'US' },
  'Dallas': { city: 'Dallas', state: 'TX', country: 'US' },
  'Cincinnati': { city: 'Cincinnati', state: 'OH', country: 'US' },
  'Phoenix': { city: 'Phoenix', state: 'AZ', country: 'US' },
  'Chattanooga': { city: 'Chattanooga', state: 'TN', country: 'US' },
  'Sao Paulo': { city: 'Sao Paulo', country: 'Brazil' },
  'Montreal': { city: 'Montreal', country: 'Canada' },
  'Portland': { city: 'Portland', state: 'OR', country: 'US' },
  'Kansas City': { city: 'Kansas City', state: 'MO', country: 'US' },
  'Las Vegas': { city: 'Las Vegas', state: 'NV', country: 'US' },
};

interface ParsedAgency {
  name: string;
  city?: string;
  state?: string;
  country?: string;
  originalName: string;
}

function parseAgencyName(fullName: string): ParsedAgency {
  const trimmed = fullName.trim().replace(/^​/, ''); // Remove invisible character

  // Try to extract location from name
  // Patterns: "Agency Name LA", "Agency Name San Diego", etc.
  const lastWord = trimmed.split(' ').pop()?.trim() || '';

  if (locationMappings[lastWord]) {
    // Remove location from agency name
    const nameParts = trimmed.split(' ');
    const agencyName = nameParts.slice(0, -1).join(' ');

    return {
      name: agencyName,
      ...locationMappings[lastWord],
      originalName: trimmed
    };
  }

  // Check for multi-word locations like "San Diego", "Kansas City", "Las Vegas"
  const lastTwoWords = trimmed.split(' ').slice(-2).join(' ');
  if (locationMappings[lastTwoWords]) {
    const nameParts = trimmed.split(' ');
    const agencyName = nameParts.slice(0, -2).join(' ');

    return {
      name: agencyName,
      ...locationMappings[lastTwoWords],
      originalName: trimmed
    };
  }

  // No location in name - use full name
  return {
    name: trimmed,
    originalName: trimmed
  };
}

async function addMissingAgencies() {
  console.log('🚀 Adding Missing SellerCrowd Agencies (Batch 4-1)...');
  console.log('================================================================================\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const agencyName of missingAgencies) {
    try {
      // Parse name and location
      const parsed = parseAgencyName(agencyName);

      // Check if already exists (case-insensitive)
      const existing = await prisma.company.findFirst({
        where: {
          name: { equals: parsed.originalName, mode: 'insensitive' }
        }
      });

      if (existing) {
        console.log(`⏭️  [${created + skipped + 1}/${missingAgencies.length}] Already exists: ${parsed.originalName}`);
        skipped++;
        continue;
      }

      // Generate slug
      let slug = parsed.originalName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Check for slug uniqueness
      let slugExists = await prisma.company.findUnique({ where: { slug } });
      let counter = 1;
      while (slugExists) {
        slug = `${parsed.originalName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')}-${counter}`;
        slugExists = await prisma.company.findUnique({ where: { slug } });
        counter++;
      }

      // Create agency
      await prisma.company.create({
        data: {
          id: createId(),
          name: parsed.originalName,
          slug: slug,
          companyType: 'AGENCY',
          city: parsed.city,
          state: parsed.state,
          country: parsed.country,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      created++;
      const location = parsed.city
        ? ` (${parsed.city}${parsed.state ? ', ' + parsed.state : ''})`
        : '';
      console.log(`✅ [${created + skipped}/${missingAgencies.length}] Created: ${parsed.originalName}${location}`);

    } catch (error: any) {
      errors++;
      console.error(`❌ Error adding ${agencyName}: ${error.message}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total agencies:      ${missingAgencies.length}`);
  console.log(`Agencies created:    ${created}`);
  console.log(`Already existed:     ${skipped}`);
  console.log(`Errors:              ${errors}`);
  console.log('\n✨ Complete!');
}

addMissingAgencies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
