export interface SeoPageParams {
  city: string;
  bedrooms?: number;
  amenities?: string[];
}

export function parseSlugToParams(slug: string[]): SeoPageParams | null {
  if (slug.length === 0) return null;
  
  const params: SeoPageParams = {
    city: slug[0]
  };
  
  // Parse remaining segments
  for (let i = 1; i < slug.length; i++) {
    const segment = slug[i];
    
    // Check if it's a bedroom segment (ends with -bedroom)
    if (segment.endsWith('-bedroom')) {
      const bedroomMatch = segment.match(/^(\d+)-bedroom$/);
      if (bedroomMatch) {
        params.bedrooms = parseInt(bedroomMatch[1], 10);
      }
    } else {
      // Assume it's amenities segment (contains + or single amenity)
      const amenities = segment.split('+').map(amenity => 
        amenity.replace(/-/g, '_') // Convert kebab-case to snake_case
      );
      params.amenities = amenities;
    }
  }
  
  return params;
}

export function paramsToSlug(params: SeoPageParams): string {
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

export function getCanonicalUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}/${slug}`;
}

export function normalizeSlug(slug: string[]): string {
  const params = parseSlugToParams(slug);
  if (!params) return slug.join('/');
  return paramsToSlug(params);
}

export function buildListingWhereClause(params: SeoPageParams) {
  const where: any = {
    status: 'ACTIVE',
  };
  
  // City filter
  if (params.city) {
    where.city = {
      slug: params.city
    };
  }
  
  // Bedroom filter
  if (params.bedrooms) {
    where.bedrooms = {
      gte: params.bedrooms // Use gte to include larger properties
    };
  }
  
  // Amenities filter
  if (params.amenities && params.amenities.length > 0) {
    where.amenities = {
      some: {
        amenity: {
          key: {
            in: params.amenities
          }
        }
      }
    };
    
    // For multiple amenities, we want properties that have ALL of them
    if (params.amenities.length > 1) {
      where.AND = params.amenities.map(amenityKey => ({
        amenities: {
          some: {
            amenity: {
              key: amenityKey
            }
          }
        }
      }));
    }
  }
  
  return where;
}