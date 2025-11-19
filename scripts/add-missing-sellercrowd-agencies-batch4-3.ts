import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

/**
 * Add missing agencies from SellerCrowd batch 4 (3) import
 *
 * Usage:
 *   npx tsx scripts/add-missing-sellercrowd-agencies-batch4-3.ts
 */

const missingAgencies = [
  '2.718 Marketing',
  '9Rooftops Baltimore',
  'Accenture Song Seattle',
  'Advantage Unified Commerce',
  'Ansira Dallas',
  'Arm Candy',
  'BAM Strategy',
  'Bailey Lauerman',
  'Bakery Agency',
  'Billups Nashville',
  'Burns Group',
  'Copacino+Fujikado',
  'Erich & Kallman',
  'Explore Communications',
  'FKQ',
  'Fahlgren Mortine Cincinnati',
  'Finn Partners',
  'Fuseideas Portland',
  'GdB',
  'Gelia Buffalo',
  'Generator Media+Analytics NY',
  'Gravity Global Detroit',
  'Gravity Global Houston',
  'Greater Than One NY',
  'Greenhaus',
  'Hart Associates Toledo',
  'Haworth LA',
  'Hunter Hamersmith',
  'Hybrid Media Services',
  'JAY Advertising',
  'JNS Next',
  'Jellyfish Boston',
  'Jellyfish London',
  'JuiceMedia.ai',
  'Just Global Singapore',
  'Lambert',
  'Laughlin Constable Chicago',
  'Luckie & Company Atlanta',
  'MMGY Digital Spring',
  'MMGY Global Denver',
  'MX | Locations Experts London',
  'Mediaspot',
  'Miles Partnership',
  'Mindstream Media Group Columbus',
  'Novus Media Toronto',
  'ODN Seattle',
  'Oliver Agency SF',
  'One Day Agency',
  'PB&',
  'Pacific Communications',
  'Padilla SF',
  'Pavone',
  'People Who Think',
  'Planet Propaganda',
  'PodSearch, Inc.',
  'Precision AQ Costa Mesa',
  'PureRED Atlanta',
  'Refuel Agency',
  'Reingold, Inc.',
  'SJ&P Jacksonville',
  'Schafer Condon Carter',
  'Scoutdoor Media',
  'Spring & Bond',
  'Syneos Health',
  'TBWA\\Chiat\\Day LA',
  'TBWA\\Chiat\\Day NY',
  'TBWA\\WorldHealth NY',
  'TMPG / Uncover',
  'The Shipyard Columbus',
  'The Shipyard Sacramento',
  'The Tombras Group',
  'Tinuiti Charlotte',
  'Transmission Singapore',
  'True Media Kansas City',
  'Two by Four Chicago',
  'UWG Inc.',
  'quench agency Chicago',
  '​IPG Mediabrands',
];

// City/state mappings for known locations
const locationMappings: Record<string, { city: string; state?: string; country?: string }> = {
  'LA': { city: 'Los Angeles', state: 'CA', country: 'US' },
  'NY': { city: 'New York City', state: 'NY', country: 'US' },
  'SF': { city: 'San Francisco', state: 'CA', country: 'US' },
  'Chicago': { city: 'Chicago', state: 'IL', country: 'US' },
  'Seattle': { city: 'Seattle', state: 'WA', country: 'US' },
  'Boston': { city: 'Boston', state: 'MA', country: 'US' },
  'Atlanta': { city: 'Atlanta', state: 'GA', country: 'US' },
  'Toronto': { city: 'Toronto', country: 'Canada' },
  'Denver': { city: 'Denver', state: 'CO', country: 'US' },
  'Dallas': { city: 'Dallas', state: 'TX', country: 'US' },
  'Portland': { city: 'Portland', state: 'OR', country: 'US' },
  'Cincinnati': { city: 'Cincinnati', state: 'OH', country: 'US' },
  'Toledo': { city: 'Toledo', state: 'OH', country: 'US' },
  'Nashville': { city: 'Nashville', state: 'TN', country: 'US' },
  'Baltimore': { city: 'Baltimore', state: 'MD', country: 'US' },
  'Detroit': { city: 'Detroit', state: 'MI', country: 'US' },
  'Houston': { city: 'Houston', state: 'TX', country: 'US' },
  'Jacksonville': { city: 'Jacksonville', state: 'FL', country: 'US' },
  'Charlotte': { city: 'Charlotte', state: 'NC', country: 'US' },
  'Buffalo': { city: 'Buffalo', state: 'NY', country: 'US' },
  'Columbus': { city: 'Columbus', state: 'OH', country: 'US' },
  'Sacramento': { city: 'Sacramento', state: 'CA', country: 'US' },
  'London': { city: 'London', country: 'UK' },
  'Singapore': { city: 'Singapore', country: 'Singapore' },
  'Spring': { city: 'Spring', state: 'TX', country: 'US' },
  'Kansas City': { city: 'Kansas City', state: 'MO', country: 'US' },
  'Costa Mesa': { city: 'Costa Mesa', state: 'CA', country: 'US' },
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
  // Patterns: "Agency Name LA", "Agency Name Seattle", etc.
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

  // Check for multi-word locations like "Kansas City", "Costa Mesa"
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
  console.log('🚀 Adding Missing SellerCrowd Agencies (Batch 4-3)...');
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
