#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AMENITY_FACETS = [
  'pet_friendly',
  'pool', 
  'hot_tub',
  'ev_charger',
  'near_hiking',
  'beachfront',
  'ocean_view'
] as const;

const BEDROOM_FACETS = [1, 2, 3, 4, 5] as const;

interface SeoPageParams {
  city: string;
  bedrooms?: number;
  amenities?: string[];
}

function generateSlug(params: SeoPageParams): string {
  const parts: string[] = [params.city];
  
  if (params.amenities && params.amenities.length > 0) {
    // Sort amenities alphabetically for consistency
    const sortedAmenities = [...params.amenities].sort();
    const amenitySegment = sortedAmenities.map(a => a.replace(/_/g, '-')).join('+');
    parts.push(amenitySegment);
  }
  
  if (params.bedrooms) {
    parts.push(`${params.bedrooms}-bedroom`);
  }
  
  return parts.join('/');
}

function generateTitle(cityName: string, params: SeoPageParams): string {
  const parts: string[] = [];
  
  if (params.bedrooms) {
    parts.push(`${params.bedrooms} Bedroom`);
  }
  
  if (params.amenities && params.amenities.length > 0) {
    const amenityLabels = params.amenities.map(amenity => {
      return amenity
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    });
    parts.push(...amenityLabels);
  }
  
  parts.push('Vacation Rentals');
  parts.push(`in ${cityName}`);
  
  return parts.join(' ');
}

function generateDescription(cityName: string, params: SeoPageParams): string {
  let base = `Find and book vacation rentals in ${cityName}`;
  
  if (params.bedrooms) {
    base += ` with ${params.bedrooms} bedroom${params.bedrooms > 1 ? 's' : ''}`;
  }
  
  if (params.amenities && params.amenities.length > 0) {
    const amenityLabels = params.amenities.map(amenity => {
      return amenity
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    });
    
    if (amenityLabels.length === 1) {
      base += ` featuring ${amenityLabels[0].toLowerCase()}`;
    } else if (amenityLabels.length === 2) {
      base += ` featuring ${amenityLabels[0].toLowerCase()} and ${amenityLabels[1].toLowerCase()}`;
    } else {
      base += ` featuring ${amenityLabels.slice(0, -1).map(a => a.toLowerCase()).join(', ')}, and ${amenityLabels[amenityLabels.length - 1].toLowerCase()}`;
    }
  }
  
  base += '. Book direct with local owners, no booking fees.';
  
  return base;
}

function generateContent(cityName: string, params: SeoPageParams): string {
  const amenityDescriptions: Record<string, string> = {
    'pet_friendly': 'pet-friendly accommodations',
    'pool': 'private pools',
    'hot_tub': 'relaxing hot tubs',
    'ev_charger': 'electric vehicle charging',
    'near_hiking': 'proximity to hiking trails',
    'beachfront': 'beachfront locations',
    'ocean_view': 'stunning ocean views'
  };
  
  let content = `Discover exceptional vacation rentals in ${cityName}`;
  
  if (params.bedrooms) {
    content += ` perfect for groups seeking ${params.bedrooms}-bedroom accommodations`;
  }
  
  if (params.amenities && params.amenities.length > 0) {
    const descriptions = params.amenities
      .map(amenity => amenityDescriptions[amenity])
      .filter(Boolean);
    
    if (descriptions.length > 0) {
      content += `. These handpicked properties feature ${descriptions.join(', ')}`;
    }
  }
  
  content += `.\n\nEach listing is managed by local property owners who provide personalized service and insider knowledge about ${cityName}. Book directly and avoid platform fees while supporting the local community.`;
  
  return content;
}

async function generateSeoPages() {
  console.log('🚀 Starting SEO page generation...');
  
  // Get all cities
  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' }
  });
  
  console.log(`Found ${cities.length} cities`);
  
  let totalGenerated = 0;
  let totalUpdated = 0;
  
  for (const city of cities) {
    console.log(`\n📍 Processing ${city.name}, ${city.state}...`);
    
    // Generate combinations
    const combinations: SeoPageParams[] = [];
    
    // Base city page (no filters)
    combinations.push({ city: city.slug });
    
    // Bedroom-only pages
    for (const bedrooms of BEDROOM_FACETS) {
      combinations.push({ 
        city: city.slug, 
        bedrooms 
      });
    }
    
    // Amenity-only pages (single amenity)
    for (const amenity of AMENITY_FACETS) {
      combinations.push({ 
        city: city.slug, 
        amenities: [amenity] 
      });
    }
    
    // Combined amenity + bedroom pages (limited to avoid explosion)
    for (const bedrooms of [2, 3, 4]) { // Most popular bedroom counts
      for (const amenity of ['pool', 'pet_friendly', 'beachfront']) { // Most popular amenities
        combinations.push({
          city: city.slug,
          bedrooms,
          amenities: [amenity]
        });
      }
    }
    
    // Popular amenity combinations
    const popularCombos = [
      ['pool', 'hot_tub'],
      ['pet_friendly', 'pool'],
      ['beachfront', 'ocean_view'],
    ];
    
    for (const amenities of popularCombos) {
      combinations.push({
        city: city.slug,
        amenities
      });
    }
    
    console.log(`  Generating ${combinations.length} page combinations...`);
    
    for (const params of combinations) {
      const slug = generateSlug(params);
      const title = generateTitle(city.name, params);
      const description = generateDescription(city.name, params);
      const content = generateContent(city.name, params);
      
      const existingPage = await prisma.seoPage.findUnique({
        where: { slug }
      });
      
      if (existingPage) {
        // Update existing page
        await prisma.seoPage.update({
          where: { slug },
          data: {
            title,
            description,
            content,
            params: JSON.stringify(params),
            updatedAt: new Date(),
          }
        });
        totalUpdated++;
      } else {
        // Create new page
        await prisma.seoPage.create({
          data: {
            slug,
            title,
            description,
            content,
            params: JSON.stringify(params),
            citySlug: city.slug,
            bedrooms: params.bedrooms || null,
            amenities: params.amenities ? JSON.stringify(params.amenities) : null,
            indexed: true,
          }
        });
        totalGenerated++;
      }
    }
    
    console.log(`  ✅ Generated ${combinations.length} pages for ${city.name}`);
  }
  
  console.log(`\n🎉 SEO page generation complete!`);
  console.log(`📊 Stats:`);
  console.log(`  - New pages created: ${totalGenerated}`);
  console.log(`  - Existing pages updated: ${totalUpdated}`);
  console.log(`  - Total pages: ${totalGenerated + totalUpdated}`);
}

async function main() {
  try {
    await generateSeoPages();
  } catch (error) {
    console.error('❌ Error generating SEO pages:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this file is executed directly
main();

export { generateSeoPages, generateSlug, generateTitle, generateDescription };