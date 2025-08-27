import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchForm } from "@/components/search/search-form";
import { ListingCard } from "@/components/listings/listing-card";
import { prisma } from "@/lib/prisma";
import { MapPin, Star, Users, Building, ArrowRight } from "lucide-react";

async function getFeaturedListings() {
  return await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      tier: { not: null }, // Featured listings based on tier
    },
    include: {
      city: true,
      neighborhood: true,
      photos: {
        orderBy: { order: "asc" },
        take: 5,
      },
      reviews: {
        where: { approved: true },
        select: { rating: true },
      },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
}

async function getPopularCities() {
  return await prisma.city.findMany({
    include: {
      _count: {
        select: {
          listings: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
    orderBy: {
      listings: {
        _count: "desc",
      },
    },
    take: 8,
  });
}

async function getStats() {
  const [totalListings, totalCities, totalOwners, averageRating] = await Promise.all([
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.city.count(),
    prisma.ownerProfile.count(),
    prisma.review.aggregate({
      where: { approved: true },
      _avg: { rating: true },
    }),
  ]);

  return {
    totalListings,
    totalCities,
    totalOwners,
    averageRating: averageRating._avg.rating?.toFixed(1) || "5.0",
  };
}

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Book Direct.{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Save More.
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Discover amazing vacation rentals and book directly from owners. 
            Skip the fees, support local hosts, and get the best deals.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-12">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-1" />
              <span>No Booking Fees</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>Direct Owner Contact</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1" />
              <span>Verified Properties</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <SearchForm variant="hero" />
        </div>
      </div>
    </section>
  );
}

function StatsSection({ stats }: { stats: Awaited<ReturnType<typeof getStats>> }) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
              {stats.totalListings.toLocaleString()}+
            </div>
            <div className="text-gray-600">Active Properties</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
              {stats.totalCities}+
            </div>
            <div className="text-gray-600">Cities</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
              {stats.totalOwners}+
            </div>
            <div className="text-gray-600">Property Owners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-yellow-600 mb-2">
              {stats.averageRating}
            </div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedListingsSection({ listings }: { listings: Awaited<ReturnType<typeof getFeaturedListings>> }) {
  if (listings.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Featured Properties
            </h2>
            <p className="text-gray-600">
              Hand-picked by our team for exceptional quality and value
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/search?featured=true">
              View All Featured
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PopularCitiesSection({ cities }: { cities: Awaited<ReturnType<typeof getPopularCities>> }) {
  if (cities.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Popular Destinations
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the most sought-after vacation rental destinations
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/search?location=${encodeURIComponent(city.name + ', ' + city.state)}`}
              className="group block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  {city.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {city.state}
              </p>
              <Badge variant="secondary" className="mt-2">
                {city._count.listings} properties
              </Badge>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <Link href="/search">
              Browse All Destinations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to List Your Property?
        </h2>
        <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-lg">
          Join thousands of property owners who earn more by connecting directly with guests.
          No middleman fees, just pure profit.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg" variant="secondary">
            <Link href="/auth/signup">
              Start Hosting Today
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
            <Link href="/search">
              Browse Properties
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [featuredListings, popularCities, stats] = await Promise.all([
    getFeaturedListings(),
    getPopularCities(),
    getStats(),
  ]);

  return (
    <main>
      <HeroSection />
      
      <Suspense fallback={<div>Loading stats...</div>}>
        <StatsSection stats={stats} />
      </Suspense>

      <Suspense fallback={<div>Loading featured properties...</div>}>
        <FeaturedListingsSection listings={featuredListings} />
      </Suspense>

      <Suspense fallback={<div>Loading popular cities...</div>}>
        <PopularCitiesSection cities={popularCities} />
      </Suspense>

      <CTASection />
    </main>
  );
}