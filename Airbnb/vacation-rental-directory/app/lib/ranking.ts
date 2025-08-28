// app/lib/ranking.ts
import { Listing, Tier, Review } from '@prisma/client';

type RankInput = Pick<Listing, 'tier' | 'updatedAt'> & {
  photos: { id: string }[];
  reviews: Pick<Review, 'rating'>[];
};

const tierWeight: Record<Tier, number> = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
};

export function scoreListing(l: RankInput) {
  const t = tierWeight[l.tier] * 100;
  const avg =
    l.reviews.length > 0
      ? l.reviews.reduce((s, r) => s + r.rating, 0) / l.reviews.length
      : 0;
  const reviewScore = avg * 20; // up to ~100
  const photoScore = Math.min(l.photos.length, 8) * 5; // up to 40
  const daysSinceUpdate = Math.max(
    0,
    Math.floor((Date.now() - l.updatedAt.getTime()) / 86_400_000)
  );
  const recencyBoost = Math.max(0, 30 - daysSinceUpdate); // 0..30
  return t + reviewScore + photoScore + recencyBoost;
}