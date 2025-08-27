import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Users, Bed, Bath } from "lucide-react";

export interface ListingCardProps {
  listing: {
    id: string;
    slug: string;
    title: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    sleeps?: number | null;
    maxGuests?: number | null;
    priceMin?: number | null; // in dollars
    priceMax?: number | null; // in dollars  
    basePrice?: number | null; // in cents
    tier?: string | null;
    featured?: boolean;
    photos: { url: string; alt?: string | null }[];
    city: { name: string; state: string };
    neighborhood?: { name: string } | null;
    reviews?: { rating: number }[];
  };
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const averageRating = listing.reviews?.length
    ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
    : 0;

  const displayPrice = (listing.basePrice / 100).toFixed(0); // Convert from cents

  return (
    <Card className={`group hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <Link href={`/listing/${listing.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
          {listing.photos?.[0] && (
            <Image
              src={listing.photos[0].url}
              alt={listing.photos[0].alt || listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          {listing.featured && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 hover:from-yellow-500 hover:to-yellow-600">
              Featured
            </Badge>
          )}
          {averageRating > 0 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1 text-sm font-medium">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link href={`/listing/${listing.slug}`} className="block">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
              {listing.title}
            </h3>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4" />
            <span>
              {listing.neighborhood?.name && `${listing.neighborhood.name}, `}
              {listing.city.name}, {listing.city.state}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <Bed className="h-4 w-4" />
              <span>{listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bed`}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="h-4 w-4" />
              <span>{listing.bathrooms} bath</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{listing.maxGuests} guests</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="capitalize">
              {listing.propertyType}
            </Badge>
            <div className="text-right">
              <div className="font-bold text-lg">
                ${displayPrice}
                <span className="text-sm font-normal text-gray-600">/night</span>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}