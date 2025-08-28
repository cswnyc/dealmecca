import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { SearchForm } from "@/components/search/search-form";
import { ListingCard } from "@/components/listings/listing-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users } from "lucide-react";

interface SearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  bedrooms?: string;
  priceMin?: string;
  priceMax?: string;
  amenities?: string;
  page?: string;
}

interface SearchPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <SearchForm defaultValues={params} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <Suspense fallback={<FiltersSkeleton />}>
              <SearchFilters searchParams={params} />
            </Suspense>
          </div>

          {/* Results */}
          <div className="flex-1">
            <Suspense fallback={<SearchResultsSkeleton />}>
              <SearchResults searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

async function SearchResults({ searchParams }: { searchParams: SearchParams }) {
  const {
    location,
    checkIn,
    checkOut,
    guests,
    bedrooms,
    priceMin,
    priceMax,
    amenities,
    page = "1",
  } = searchParams;

  const pageSize = 20;
  const skip = (parseInt(page) - 1) * pageSize;

  // Build where conditions
  const whereConditions: any = {
    status: "ACTIVE",
  };

  // Location filter
  if (location) {
    whereConditions.OR = [
      { city: { name: { contains: location, mode: "insensitive" } } },
      { city: { slug: { contains: location, mode: "insensitive" } } },
      { neighborhood: { name: { contains: location, mode: "insensitive" } } },
    ];
  }

  // Guests filter
  if (guests) {
    whereConditions.maxGuests = { gte: parseInt(guests) };
  }

  // Bedrooms filter
  if (bedrooms) {
    whereConditions.bedrooms = { gte: parseInt(bedrooms) };
  }

  // Price filters
  if (priceMin || priceMax) {
    whereConditions.basePrice = {};
    if (priceMin) whereConditions.basePrice.gte = parseInt(priceMin) * 100; // Convert to cents
    if (priceMax) whereConditions.basePrice.lte = parseInt(priceMax) * 100;
  }

  // Amenities filter
  if (amenities) {
    const amenityList = amenities.split(",");
    whereConditions.amenities = {
      some: {
        amenity: {
          key: { in: amenityList },
        },
      },
    };
  }

  // Execute search query
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where: whereConditions,
      include: {
        city: true,
        neighborhood: true,
        photos: {
          take: 1,
          orderBy: { order: "asc" },
        },
        amenities: {
          include: { amenity: true },
          take: 5,
        },
        reviews: {
          where: { approved: true },
          select: { rating: true },
        },
      },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
      take: pageSize,
      skip,
    }),
    prisma.listing.count({ where: whereConditions }),
  ]);

  // Calculate average ratings
  const listingsWithRatings = listings.map((listing) => ({
    ...listing,
    averageRating: listing.reviews.length
      ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
      : null,
    reviewCount: listing.reviews.length,
  }));

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {total} {total === 1 ? "property" : "properties"}
            {location && (
              <span className="text-gray-600"> in {location}</span>
            )}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            {checkIn && checkOut && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}
              </div>
            )}
            {guests && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {guests} {parseInt(guests) === 1 ? "guest" : "guests"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {listingsWithRatings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {listingsWithRatings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={{
                id: listing.id,
                title: listing.title,
                slug: listing.slug,
                city: listing.city.name,
                neighborhood: listing.neighborhood?.name,
                bedrooms: listing.bedrooms,
                bathrooms: listing.bathrooms,
                maxGuests: listing.maxGuests || listing.sleeps,
                basePrice: listing.basePrice,
                photos: listing.photos,
                averageRating: listing.averageRating,
                reviewCount: listing.reviewCount,
                featured: listing.featured,
                tier: listing.tier,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search criteria to find more properties.
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`px-4 py-2 rounded-lg ${
                  pageNum === parseInt(page)
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

async function SearchFilters({ searchParams }: { searchParams: SearchParams }) {
  // Fetch filter options from database
  const [cities, amenities] = await Promise.all([
    prisma.city.findMany({
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.amenity.findMany({
      select: { key: true, name: true, category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Property Type</h3>
          <div className="space-y-2">
            {propertyTypes.map((type) => (
              <label key={type.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={type.value}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{type.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Price Range</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Min</label>
                <input
                  type="number"
                  placeholder="$0"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max</label>
                <input
                  type="number"
                  placeholder="$1000+"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Amenities</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {amenities.map((amenity) => (
              <label key={amenity.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={amenity.key}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{amenity.name}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 9 }, (_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-[4/3] bg-gray-200" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded mb-4 w-2/3" />
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }, (_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="h-5 bg-gray-200 rounded w-24 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const propertyTypes = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "villa", label: "Villa" },
  { value: "cabin", label: "Cabin" },
];