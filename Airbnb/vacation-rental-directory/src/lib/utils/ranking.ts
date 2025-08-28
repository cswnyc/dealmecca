import { Listing, Review, Tier, Photo } from "@prisma/client";

interface ListingWithReviews extends Listing {
  reviews: Review[];
  photos: Photo[];
}

interface RankingFactors {
  averageRating: number;
  reviewCount: number;
  recency: number;
  completeness: number;
  tierBoost: number;
  featuredBoost: number;
  photoQuality: number;
  responseTime: number;
}

interface RankedListing extends ListingWithReviews {
  rankingScore: number;
  rankingFactors: RankingFactors;
}

/**
 * Calculate ranking score for vacation rental listings
 * Higher scores = better rankings in search results
 */
export function calculateListingRank(listings: ListingWithReviews[]): RankedListing[] {
  return listings.map(listing => {
    const factors = calculateRankingFactors(listing);
    const score = calculateWeightedScore(factors);
    
    return {
      ...listing,
      rankingScore: score,
      rankingFactors: factors,
    };
  }).sort((a, b) => b.rankingScore - a.rankingScore);
}

function calculateRankingFactors(listing: ListingWithReviews): RankingFactors {
  // Average rating (0-5 stars)
  const averageRating = listing.reviews.length > 0
    ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
    : 0;

  // Review count factor (logarithmic scale to prevent skew)
  const reviewCount = Math.log10(listing.reviews.length + 1);

  // Recency factor (newer listings get slight boost for first 90 days)
  const daysSinceCreated = (Date.now() - listing.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const recency = daysSinceCreated <= 90 ? Math.max(0, 1 - daysSinceCreated / 90) : 0;

  // Profile completeness
  const completeness = calculateCompletenessScore(listing);

  // Tier boost
  const tierBoost = getTierMultiplier(listing.tier);

  // Featured listing boost
  const featuredBoost = listing.featured ? 1.0 : 0;

  // Photo quality score
  const photoQuality = calculatePhotoScore(listing.photos);

  // Response time (placeholder - would need historical data)
  const responseTime = 0.5; // Assume average response time for now

  return {
    averageRating,
    reviewCount,
    recency,
    completeness,
    tierBoost,
    featuredBoost,
    photoQuality,
    responseTime,
  };
}

function calculateWeightedScore(factors: RankingFactors): number {
  // Weighted scoring system (weights sum to 1.0)
  const weights = {
    averageRating: 0.30,    // 30% - Most important factor
    reviewCount: 0.20,      // 20% - Social proof
    completeness: 0.15,     // 15% - Complete profiles rank higher
    photoQuality: 0.10,     // 10% - Visual appeal
    tierBoost: 0.10,        // 10% - Paid tier benefits
    responseTime: 0.08,     // 8%  - Host responsiveness
    featuredBoost: 0.05,    // 5%  - Featured listing boost
    recency: 0.02,          // 2%  - New listing boost
  };

  const baseScore = (
    factors.averageRating * weights.averageRating +
    factors.reviewCount * weights.reviewCount +
    factors.completeness * weights.completeness +
    factors.photoQuality * weights.photoQuality +
    factors.responseTime * weights.responseTime +
    factors.recency * weights.recency
  );

  // Apply tier and featured multipliers
  const tierMultiplier = 1 + (factors.tierBoost * weights.tierBoost);
  const featuredMultiplier = 1 + (factors.featuredBoost * weights.featuredBoost);

  return baseScore * tierMultiplier * featuredMultiplier;
}

function calculateCompletenessScore(listing: ListingWithReviews): number {
  const fields = [
    listing.title?.trim(),
    listing.summary?.trim(),
    listing.description?.trim(),
    listing.basePrice,
    listing.bedrooms,
    listing.bathrooms,
    listing.maxGuests || listing.sleeps,
    listing.photos.length > 0,
    listing.photos.length >= 3, // Bonus for multiple photos
    listing.photos.length >= 5, // Extra bonus for 5+ photos
  ];

  const filledFields = fields.filter(Boolean).length;
  return filledFields / fields.length;
}

function getTierMultiplier(tier: Tier | null): number {
  switch (tier) {
    case "BRONZE": return 0.05;   // 5% boost
    case "SILVER": return 0.10;   // 10% boost  
    case "GOLD": return 0.15;     // 15% boost
    case "PLATINUM": return 0.25; // 25% boost
    default: return 0;
  }
}

function calculatePhotoScore(photos: Photo[]): number {
  if (photos.length === 0) return 0;

  let score = 0;

  // Base score for having photos
  score += Math.min(photos.length / 5, 1); // Up to 1.0 for 5+ photos

  // Quality indicators (if width/height are available)
  const highQualityPhotos = photos.filter(photo => 
    photo.width && photo.height && 
    photo.width >= 800 && photo.height >= 600
  ).length;

  score += (highQualityPhotos / photos.length) * 0.5; // Up to 0.5 bonus

  // Diversity bonus (having multiple photos is better)
  if (photos.length >= 3) score += 0.2;
  if (photos.length >= 5) score += 0.3;

  return Math.min(score, 1.0); // Cap at 1.0
}

/**
 * Apply search-specific ranking adjustments
 */
export function applySearchRanking(
  listings: RankedListing[],
  searchParams: {
    location?: string;
    priceMin?: number;
    priceMax?: number;
    guests?: number;
    bedrooms?: number;
  }
): RankedListing[] {
  return listings.map(listing => {
    let searchBoost = 0;

    // Exact location match boost
    if (searchParams.location) {
      const location = searchParams.location.toLowerCase();
      const cityMatch = listing.city?.name?.toLowerCase().includes(location);
      const titleMatch = listing.title.toLowerCase().includes(location);
      
      if (cityMatch) searchBoost += 0.2;
      if (titleMatch) searchBoost += 0.1;
    }

    // Price competitiveness boost
    if (searchParams.priceMin && searchParams.priceMax && listing.basePrice) {
      const listingPrice = listing.basePrice / 100; // Convert from cents
      const priceRange = searchParams.priceMax - searchParams.priceMin;
      const midPoint = searchParams.priceMin + (priceRange / 2);
      
      // Boost listings priced near the middle of the search range
      const priceDistance = Math.abs(listingPrice - midPoint);
      const priceBoost = Math.max(0, 1 - (priceDistance / (priceRange / 2))) * 0.1;
      searchBoost += priceBoost;
    }

    // Capacity match boost
    if (searchParams.guests && listing.maxGuests) {
      if (listing.maxGuests >= searchParams.guests) {
        // Exact capacity match gets higher boost than over-capacity
        const capacityRatio = searchParams.guests / listing.maxGuests;
        searchBoost += capacityRatio >= 0.8 ? 0.15 : 0.05;
      }
    }

    return {
      ...listing,
      rankingScore: listing.rankingScore + searchBoost,
    };
  }).sort((a, b) => b.rankingScore - a.rankingScore);
}

/**
 * Get ranking explanation for debugging/testing
 */
export function explainRanking(listing: RankedListing): string[] {
  const explanations: string[] = [];
  const factors = listing.rankingFactors;

  explanations.push(`Total Score: ${listing.rankingScore.toFixed(3)}`);
  
  if (factors.averageRating > 0) {
    explanations.push(`⭐ ${factors.averageRating.toFixed(1)} star rating`);
  }
  
  if (factors.reviewCount > 0) {
    explanations.push(`💬 ${Math.floor(Math.pow(10, factors.reviewCount) - 1)} reviews`);
  }
  
  if (factors.completeness < 1) {
    explanations.push(`📝 ${(factors.completeness * 100).toFixed(0)}% profile complete`);
  }
  
  if (factors.tierBoost > 0) {
    explanations.push(`🏆 ${listing.tier} tier benefits`);
  }
  
  if (factors.featuredBoost > 0) {
    explanations.push(`✨ Featured listing`);
  }
  
  if (factors.recency > 0) {
    explanations.push(`🆕 New listing bonus`);
  }

  return explanations;
}