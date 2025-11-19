import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

/**
 * Add missing agencies from SellerCrowd batch 3 imports
 *
 * Usage:
 *   npx tsx scripts/add-missing-sellercrowd-agencies-batch3.ts
 */

const missingAgencies = [
  '180 Global',
  '186 Advertising',
  'AMP NY',
  'APCO Raleigh',
  'Active International NY',
  'Ad Results',
  'Advantage Solutions',
  'Allied Global Marketing Boston',
  'Allied Global Marketing LA',
  'Allied Global Marketing Philadelphia',
  'BOHAN',
  'BRUNNER Pittsburgh',
  'Backbone Media Denver',
  'Barkley OKRP Pittsburgh',
  'Barrows Minneapolis',
  'Basis Technologies DC',
  'Blue Plate Media Services',
  'Booyah Advertising',
  'Brainchild Creative',
  'Burrell Communications Chicago',
  'CCOMGroup',
  'Canvas Worldwide Chicago',
  'Cendyn',
  'Common Good Agency',
  'Crossmedia NY',
  'Culture Brands',
  'DNY',
  'Davis Elen Seattle',
  'Delta Media Portland',
  'Designory LA',
  'Direct Agents NY',
  'EchoPoint Media',
  'Edelman London',
  'Edelman NY',
  'Elevation Marketing',
  'EvansHardy+Young',
  'Five Eighty',
  'FordDirect',
  'G7 Marketing',
  'GMR Marketing Milwaukee',
  'Garage Team Mazda LA',
  'Garage Team Mazda NY',
  'Graf Media',
  'GroupM Nexus',
  'GroupM Nexus Chicago',
  'GroupM Nexus NY',
  'HERO Collective',
  'HUGE Detroit',
  'HangarFour Creative',
  'Horizon Next Toronto',
  'Innocean London',
  'Innocean Toronto',
  'Innovative Media Partners',
  'Intertrend Communications Plano',
  'Junction 37',
  'Kepler Group Chicago',
  'Kepler Group SF',
  'Kiosk SF',
  'Lopez Negrete LA',
  'M&C Saatchi Performance London',
  'M&C Saatchi Performance NY',
  'M&K Media',
  'MERGE Chicago',
  'MWWPR NY',
  'MX | Locations Experts NY',
  'Mars United Commerce Cincinnati',
  'Mars United Commerce London',
  'Mars United Commerce Seattle',
  'Material+ NY',
  'Media CanDo',
  'MediaTroopers',
  'Mediaspace Solutions',
  'Mekanism Chicago',
  'Mekanism Toronto',
  'Mercury Advertising and Marketing',
  'Mile Marker Danbury',
  'Mischief @ No Fixed Address',
  'MissionOne Media',
  'Moontide Agency',
  'Moroch Chicago',
  'Moroch Dallas',
  'Moroch Detroit',
  'Mosaic Chicago',
  'Motivate, Inc.',
  'NORTH',
  'Nice+Company',
  'Notorious111',
  'ODN Chicago',
  'Ocean Media LA',
  'Odney Bismarck',
  'Optimal Austin',
  'Optimal Los Angeles',
  'PIVnet',
  'Pinnacle Advertising Scottsdale',
  'Power Marketing',
  'Publicis UK',
  'Quad Milwaukee',
  'Radancy Boston',
  'Radancy Chicago',
  'Radancy DC',
  'Radancy NY',
  'SSCG Media Group NY',
  'Stone Ward Little Rock',
  'TBWA\\Chiat\\Day Chicago',
  'TBWA\\Chiat\\Day LA',
  'TBWA\\Chiat\\Day NY',
  'TBWA\\Chiat\\Day Nashville',
  'TCAA Boston',
  'Tatari SF',
  'Team Epiphany',
  'The Midas Exchange',
  'Thrive Digital',
  'Tinuiti Philadelphia',
  'Tombras Group NY',
  'Tombras Group Nashville',
  'UWG Detroit',
  'UWG Miami',
  'UWG NY',
  'VCCP NY',
  'Verte Agency',
  'iNvolved Media NY',
  'iProspect Pittsburgh',
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
  'CT': { city: 'Stamford', state: 'CT', country: 'US' },
  'Luxembourg': { city: 'Luxembourg', country: 'Luxembourg' },
  'Pittsburgh': { city: 'Pittsburgh', state: 'PA', country: 'US' },
  'Boston': { city: 'Boston', state: 'MA', country: 'US' },
  'Philadelphia': { city: 'Philadelphia', state: 'PA', country: 'US' },
  'Raleigh': { city: 'Raleigh', state: 'NC', country: 'US' },
  'DC': { city: 'Washington', state: 'DC', country: 'US' },
  'Seattle': { city: 'Seattle', state: 'WA', country: 'US' },
  'Portland': { city: 'Portland', state: 'OR', country: 'US' },
  'London': { city: 'London', country: 'UK' },
  'Milwaukee': { city: 'Milwaukee', state: 'WI', country: 'US' },
  'Detroit': { city: 'Detroit', state: 'MI', country: 'US' },
  'Cincinnati': { city: 'Cincinnati', state: 'OH', country: 'US' },
  'Plano': { city: 'Plano', state: 'TX', country: 'US' },
  'Danbury': { city: 'Danbury', state: 'CT', country: 'US' },
  'Dallas': { city: 'Dallas', state: 'TX', country: 'US' },
  'Bismarck': { city: 'Bismarck', state: 'ND', country: 'US' },
  'Austin': { city: 'Austin', state: 'TX', country: 'US' },
  'Los Angeles': { city: 'Los Angeles', state: 'CA', country: 'US' },
  'Scottsdale': { city: 'Scottsdale', state: 'AZ', country: 'US' },
  'Little Rock': { city: 'Little Rock', state: 'AR', country: 'US' },
  'Nashville': { city: 'Nashville', state: 'TN', country: 'US' },
  'Miami': { city: 'Miami', state: 'FL', country: 'US' },
  'UK': { city: 'London', country: 'UK' },
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

  // Check for multi-word locations like "San Diego", "Los Angeles", "Little Rock"
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
  console.log('🚀 Adding Missing SellerCrowd Agencies (Batch 3)...');
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
