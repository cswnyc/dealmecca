import { SearchForm } from "@/components/search/search-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Users, Calendar } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect{" "}
              <span className="text-blue-600">Vacation Rental</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover unique homes and experiences with verified hosts across amazing destinations
            </p>
          </div>
          
          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Destinations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDestinations.map((destination) => (
              <Card key={destination.slug} className="group hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90">
                      {destination.listings} listings
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <h3 className="font-semibold text-lg">{destination.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{destination.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{destination.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      From ${destination.priceFrom}/night
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start hosting?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of hosts who trust us with their properties
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            List Your Property
          </button>
        </div>
      </section>
    </div>
  );
}

const featuredDestinations = [
  {
    name: "Palm Springs, CA",
    slug: "palm-springs",
    description: "Desert oasis with mid-century modern charm",
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    listings: 25,
    rating: 4.8,
    priceFrom: 189,
  },
  {
    name: "Big Bear Lake, CA",
    slug: "big-bear-lake",
    description: "Mountain retreat perfect for outdoor adventures",
    image: "https://images.unsplash.com/photo-1571603671565-1fc6c2b6bbb1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    listings: 18,
    rating: 4.9,
    priceFrom: 149,
  },
  {
    name: "Redondo Beach, CA",
    slug: "redondo-beach",
    description: "Coastal living with beach access and city views",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    listings: 12,
    rating: 4.7,
    priceFrom: 229,
  },
];

const features = [
  {
    icon: Users,
    title: "Verified Hosts",
    description: "All our hosts are verified and vetted for quality and reliability",
  },
  {
    icon: Calendar,
    title: "Instant Booking",
    description: "Book instantly with real-time availability and secure payments",
  },
  {
    icon: Star,
    title: "Quality Guaranteed",
    description: "Every property is inspected and rated by our quality team",
  },
];