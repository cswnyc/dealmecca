import Link from 'next/link';

export interface ListingCardData {
  id: string;
  slug: string;
  title: string;
  bedrooms: number;
  sleeps: number | null;
  priceMin: number | null;
  priceMax: number | null;
  city: {
    name: string;
  };
  neighborhood?: {
    name: string;
  } | null;
  photos: {
    url: string;
  }[];
}

interface ListingCardProps {
  listing: ListingCardData;
  className?: string;
}

export function ListingCard({ listing, className = '' }: ListingCardProps) {
  return (
    <li className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Property Image */}
      {listing.photos[0]?.url ? (
        <img
          src={listing.photos[0].url}
          alt={listing.title}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="h-40 w-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {/* Property Details */}
      <div className="p-4 space-y-2">
        <Link
          href={`/listing/${listing.slug}`}
          className="font-medium hover:underline line-clamp-1 block"
        >
          {listing.title}
        </Link>
        
        <div className="text-sm text-gray-600">
          {listing.city.name}
          {listing.neighborhood ? ` • ${listing.neighborhood.name}` : ''}
        </div>
        
        <div className="text-sm">
          {listing.bedrooms} bd • Sleeps {listing.sleeps || 'TBD'}
        </div>
        
        {(listing.priceMin || listing.priceMax) && (
          <div className="text-sm font-semibold">
            {listing.priceMin && listing.priceMax ? (
              <>
                {listing.priceMin === listing.priceMax 
                  ? `$${listing.priceMin}` 
                  : `$${listing.priceMin}–$${listing.priceMax}`
                } / night
              </>
            ) : (
              <>
                ${listing.priceMin || listing.priceMax} / night
              </>
            )}
          </div>
        )}
        
        <Link
          href={`/listing/${listing.slug}`}
          className="inline-block mt-2 rounded bg-black text-white px-3 py-1 text-sm hover:opacity-90"
        >
          View Details
        </Link>
      </div>
    </li>
  );
}

export function ListingGrid({ 
  listings, 
  className = '' 
}: { 
  listings: ListingCardData[]; 
  className?: string; 
}) {
  return (
    <ul className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </ul>
  );
}