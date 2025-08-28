import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ImageGallery } from "@/components/listings/image-gallery";
import { AmenityPills } from "@/components/listings/amenity-pills";
import { AvailabilityCalendar } from "@/components/calendar/availability-calendar";
import { LeadForm } from "@/components/forms/lead-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Star, 
  Shield, 
  Wifi, 
  Car,
  ChefHat
} from "lucide-react";

interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;

  const listing = await prisma.listing.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      owner: {
        include: {
          user: {
            select: { name: true, image: true },
          },
        },
      },
      city: true,
      neighborhood: true,
      photos: {
        orderBy: { order: "asc" },
      },
      amenities: {
        include: {
          amenity: true,
        },
      },
      reviews: {
        where: { approved: true },
        include: {
          guest: {
            select: { name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      availability: {
        where: {
          startDate: { gte: new Date() },
        },
        take: 90,
        orderBy: { startDate: "asc" },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  const averageRating = listing.reviews.length
    ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header with photos */}
      <div className="relative">
        <ImageGallery 
          photos={listing.photos.map(photo => ({
            url: photo.url,
            alt: photo.alt || `${listing.title} - Photo`,
            width: photo.width || 800,
            height: photo.height || 600,
          }))}
          title={listing.title}
        />
        
        {/* Floating tier badge */}
        {listing.tier && (
          <div className="absolute top-6 left-6">
            <TierBadge tier={listing.tier} />
          </div>
        )}
        
        {/* Featured badge */}
        {listing.featured && (
          <div className="absolute top-6 right-6">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              Featured
            </Badge>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and location */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {listing.neighborhood?.name ? `${listing.neighborhood.name}, ` : ''}
                    {listing.city.name}, {listing.city.state}
                  </span>
                </div>
                {averageRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                    <span>({listing.reviews.length} reviews)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-6 py-4 border-y">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{listing.maxGuests || listing.sleeps} guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{listing.bedrooms} bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{listing.bathrooms} bathrooms</span>
              </div>
            </div>

            {/* Description */}
            {(listing.summary || listing.description) && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">About this space</h2>
                {listing.summary && (
                  <p className="text-gray-700 mb-4 text-lg font-medium">
                    {listing.summary}
                  </p>
                )}
                {listing.description && (
                  <div className="prose max-w-none">
                    <p className="text-gray-600 whitespace-pre-line">
                      {listing.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              <AmenityPills
                amenities={listing.amenities.map(a => ({
                  key: a.amenity.key,
                  name: a.amenity.name,
                  icon: a.amenity.icon,
                  category: a.amenity.category,
                }))}
              />
            </div>

            {/* Availability Calendar */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Availability</h2>
              <Suspense fallback={<CalendarSkeleton />}>
                <AvailabilityCalendar
                  listingId={listing.id}
                  availability={listing.availability.map(avail => ({
                    startDate: avail.startDate,
                    endDate: avail.endDate,
                    status: avail.status,
                    price: avail.price,
                  }))}
                  basePrice={listing.basePrice}
                />
              </Suspense>
            </div>

            {/* Reviews */}
            {listing.reviews.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-semibold">Reviews</h2>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-medium">{averageRating?.toFixed(1)}</span>
                    <span className="text-gray-500">• {listing.reviews.length} reviews</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listing.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {review.guestName?.charAt(0) || review.guest?.name?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <div className="font-medium">
                              {review.guestName || review.guest?.name || 'Anonymous'}
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating }, (_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>
                        {review.title && (
                          <h4 className="font-medium mb-2">{review.title}</h4>
                        )}
                        {review.body && (
                          <p className="text-gray-600 text-sm">{review.body}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Host info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {listing.owner.user.name?.charAt(0) || 'H'}
                  </div>
                  <div>
                    <div>Hosted by {listing.owner.user.name || 'Host'}</div>
                    {listing.owner.verified && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <Shield className="w-4 h-4" />
                        Verified Host
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {listing.owner.bio && (
                  <p className="text-gray-600">{listing.owner.bio}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with booking form */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="text-2xl font-bold mb-1">
                      {listing.basePrice ? (
                        <>
                          ${Math.floor(listing.basePrice / 100)}
                          <span className="text-base font-normal text-gray-600">/night</span>
                        </>
                      ) : (
                        <span className="text-gray-600">Contact for pricing</span>
                      )}
                    </div>
                    {listing.cleaningFee && (
                      <div className="text-sm text-gray-600">
                        +${Math.floor(listing.cleaningFee / 100)} cleaning fee
                      </div>
                    )}
                  </div>

                  <LeadForm listingId={listing.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="bg-gray-100 rounded-lg h-64 animate-pulse" />
  );
}

export async function generateMetadata({ params }: ListingPageProps) {
  const { slug } = await params;
  
  const listing = await prisma.listing.findUnique({
    where: { slug, status: "ACTIVE" },
    select: {
      title: true,
      summary: true,
      metaTitle: true,
      metaDescription: true,
      city: { select: { name: true, state: true } },
      photos: { take: 1, orderBy: { order: "asc" } },
    },
  });

  if (!listing) {
    return {
      title: "Property Not Found",
      description: "The requested property could not be found.",
    };
  }

  return {
    title: listing.metaTitle || `${listing.title} - ${listing.city.name}, ${listing.city.state}`,
    description: listing.metaDescription || listing.summary || `Beautiful vacation rental in ${listing.city.name}, ${listing.city.state}`,
    openGraph: {
      title: listing.title,
      description: listing.summary || `Vacation rental in ${listing.city.name}`,
      images: listing.photos[0] ? [listing.photos[0].url] : [],
    },
  };
}