// app/search/page.tsx
import { prisma } from '../lib/db';
import { scoreListing } from '../lib/ranking';
import { ListingGrid } from '../components/ListingCard';

type SearchParams = {
  city?: string;
  minBeds?: string;
  minSleeps?: string;
  maxPrice?: string;
};

function toInt(v: string | undefined) {
  if (!v) return undefined;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const city = params.city || undefined;
  const minBeds = toInt(params.minBeds);
  const minSleeps = toInt(params.minSleeps);
  const maxPrice = toInt(params.maxPrice);

  const listings = await prisma.listing.findMany({
    where: {
      status: 'ACTIVE',
      ...(city ? { city: { slug: city } } : {}),
      ...(minBeds ? { bedrooms: { gte: minBeds } } : {}),
      ...(minSleeps ? { sleeps: { gte: minSleeps } } : {}),
      ...(maxPrice ? { priceMax: { lte: maxPrice } } : {}),
    },
    include: {
      city: true,
      neighborhood: true,
      photos: { orderBy: { order: 'asc' }, take: 1 },
      reviews: { select: { rating: true } },
    },
    take: 60,
  });

  const ranked = listings
    .map((l) => ({ l, s: scoreListing(l) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.l);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-emerald-600/20"></div>
        
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Search Results
              </span>
            </h1>
            <p className="text-xl text-white/90">
              {ranked.length} {ranked.length === 1 ? 'property' : 'properties'} found
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        {ranked.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-gray-500">🔍</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No results found</h2>
            <p className="text-xl text-gray-600 max-w-md mx-auto">
              No listings matched your filters. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <ListingGrid listings={ranked} />
        )}
      </main>
    </div>
  );
}