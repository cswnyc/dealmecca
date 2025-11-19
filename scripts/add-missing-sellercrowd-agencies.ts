import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

/**
 * Add missing agencies from SellerCrowd imports
 *
 * Usage:
 *   npx tsx scripts/add-missing-sellercrowd-agencies.ts
 */

const missingAgencies = [
  '1000heads LA',
  'Aisle Rocket Chicago',
  'April Six SF',
  'ARGONAUT',
  'Arteaga & Arteaga',
  'Awin Global',
  'Bully Pulpit Interactive SF',
  'Colour Toronto',
  'Courage',
  'Crosby Marketing Annapolis',
  'Deep Focus NY',
  'DNA&STONE',
  'Duffy & Shanley',
  'Edelman LA',
  'Edelman San Diego',
  'Elite Media Team',
  'Evergreen Trading NY',
  'Four Agency Worldwide',
  'Gen3 Marketing',
  'GroupeConnect NY',
  'HAVAS Health & You NY',
  'Highdive',
  'Inspiria Outdoor Advertising',
  'Intersect Media',
  'Kvell Collective',
  'Laundry Service LA',
  'M&C Saatchi Performance LA',
  'Marina Maher Communications',
  'Mars United Commerce Minneapolis',
  'Mother LA',
  'Motive Denver',
  'Pangolin',
  'pep promotions',
  'PMG Cleveland',
  'Protiviti Digital SF',
  'Quigley Simpson NY',
  'Red',
  'Rhea + Kaiser Chicago',
  'Rise',
  'Rodgers Townsend',
  'Solve(d)',
  'SSCG Media Group',
  'Stella Rising CT',
  'SwellShark',
  'Swift Agency',
  'TBWA\\Chiat\\Day LA',
  'TBWA\\Chiat\\Day NY',
  'VaynerMedia LA',
  'VaynerMedia NY',
  'VaynerX NY',
  'VML Luxembourg',
  'Wasserman LA',
  'We Are Social NY',
  'Wilkins Media Minneapolis',
  'Zeno Group NY',
  '​IPG Mediabrands', // Note: has invisible character at start
];

// City/state mappings for known locations
const locationMappings: Record<string, { city: string; state?: string; country?: string }> = {
  'LA': { city: 'Los Angeles', state: 'CA', country: 'US' },
  'NY': { city: 'New York City', state: 'NY', country: 'US' },
  'SF': { city: 'San Francisco', state: 'CA', country: 'US' },
  'Chicago': { city: 'Chicago', state: 'IL', country: 'US' },
  'San Diego': { city: 'San Diego', state: 'CA', country: 'US' },
  'Annapolis': { city: 'Annapolis', state: 'MD', country: 'US' },
  'Toronto': { city: 'Toronto', country: 'Canada' },
  'Minneapolis': { city: 'Minneapolis', state: 'MN', country: 'US' },
  'Denver': { city: 'Denver', state: 'CO', country: 'US' },
  'Cleveland': { city: 'Cleveland', state: 'OH', country: 'US' },
  'CT': { city: 'Stamford', state: 'CT', country: 'US' }, // Default CT location
  'Luxembourg': { city: 'Luxembourg', country: 'Luxembourg' },
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
  const lastWord = trimmed.split(' ').pop()?.toUpperCase() || '';

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

  // Check for multi-word locations like "San Diego"
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
  console.log('🚀 Adding Missing SellerCrowd Agencies...');
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
