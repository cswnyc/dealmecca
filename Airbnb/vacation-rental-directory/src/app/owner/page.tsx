import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Star, 
  Plus,
  Eye,
  Edit
} from "lucide-react";
import Link from "next/link";

export default async function OwnerDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get owner profile and listings
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      listings: {
        include: {
          city: true,
          photos: {
            take: 1,
            orderBy: { order: "asc" },
          },
          inquiries: {
            where: { status: "PENDING" },
          },
          reviews: {
            where: { approved: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      subs: {
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!ownerProfile) {
    redirect("/owner/onboarding");
  }

  const currentSubscription = ownerProfile.subs[0];
  
  // Calculate stats
  const stats = {
    totalListings: ownerProfile.listings.length,
    activeListings: ownerProfile.listings.filter(l => l.status === "ACTIVE").length,
    pendingInquiries: ownerProfile.listings.reduce((sum, l) => sum + l.inquiries.length, 0),
    totalReviews: ownerProfile.listings.reduce((sum, l) => sum + l.reviews.length, 0),
    averageRating: ownerProfile.listings.reduce((sum, listing) => {
      if (listing.reviews.length === 0) return sum;
      const avgRating = listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length;
      return sum + avgRating;
    }, 0) / Math.max(ownerProfile.listings.filter(l => l.reviews.length > 0).length, 1),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {session.user.name || ownerProfile.businessName}
              </h1>
              <p className="text-gray-600">Manage your properties and bookings</p>
            </div>
            <div className="flex items-center gap-4">
              {currentSubscription && (
                <TierBadge tier={currentSubscription.tier as any} />
              )}
              <Link href="/owner/listings/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold">{stats.activeListings}</p>
                </div>
                <Home className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Inquiries</p>
                  <p className="text-2xl font-bold">{stats.pendingInquiries}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold">{stats.totalReviews}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold">
                    {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : "—"}
                  </p>
                </div>
                <Star className="w-8 h-8 text-green-600 fill-current" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/owner/listings/new">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Property
                </Button>
              </Link>
              <Link href="/owner/inquiries">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Inquiries
                  {stats.pendingInquiries > 0 && (
                    <Badge className="ml-2">{stats.pendingInquiries}</Badge>
                  )}
                </Button>
              </Link>
              <Link href="/owner/calendar">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Calendar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Properties</CardTitle>
              <Link href="/owner/listings">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {ownerProfile.listings.length > 0 ? (
              <div className="space-y-4">
                {ownerProfile.listings.slice(0, 5).map((listing) => (
                  <div key={listing.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {listing.photos[0] ? (
                        <img
                          src={listing.photos[0].url}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Home className="w-6 h-6 text-gray-400 m-auto mt-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{listing.title}</h3>
                        <Badge
                          variant={
                            listing.status === "ACTIVE"
                              ? "default"
                              : listing.status === "PENDING"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {listing.status.toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {listing.city.name}, {listing.city.state}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{listing.inquiries.length} pending inquiries</span>
                        <span>{listing.reviews.length} reviews</span>
                        {listing.basePrice && (
                          <span>${Math.floor(listing.basePrice / 100)}/night</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/listing/${listing.slug}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/owner/listings/${listing.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No properties yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by adding your first vacation rental property.
                </p>
                <Link href="/owner/listings/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Property
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}