import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  MessageSquare, 
  Star, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Get admin stats
  const [
    pendingListings,
    totalListings,
    totalOwners,
    pendingInquiries,
    flaggedReviews,
    recentActivity
  ] = await Promise.all([
    // Pending listings
    prisma.listing.findMany({
      where: { status: "PENDING" },
      include: {
        owner: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        city: true,
        photos: { take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    
    // Total listings count by status
    prisma.listing.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    
    // Total owners
    prisma.ownerProfile.count(),
    
    // Pending inquiries
    prisma.inquiry.count({
      where: { status: "PENDING" },
    }),
    
    // Flagged reviews (not approved)
    prisma.review.count({
      where: { approved: false },
    }),
    
    // Recent activity
    prisma.listing.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        owner: {
          include: {
            user: { select: { name: true } },
          },
        },
        city: true,
      },
    }),
  ]);

  const stats = {
    pendingApproval: pendingListings.length,
    activeListings: totalListings.find(t => t.status === "ACTIVE")?._count.id || 0,
    suspendedListings: totalListings.find(t => t.status === "SUSPENDED")?._count.id || 0,
    totalOwners,
    pendingInquiries,
    flaggedReviews,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage listings, users, and content moderation</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/listings">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  All Listings
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
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingApproval}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeListings}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Owners</p>
                  <p className="text-2xl font-bold">{stats.totalOwners}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Flagged Reviews</p>
                  <p className="text-2xl font-bold text-red-600">{stats.flaggedReviews}</p>
                </div>
                <Star className="w-8 h-8 text-red-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/admin/listings?status=pending">
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Review Pending
                  {stats.pendingApproval > 0 && (
                    <Badge className="ml-2 bg-orange-500">{stats.pendingApproval}</Badge>
                  )}
                </Button>
              </Link>
              <Link href="/admin/reviews">
                <Button variant="outline" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Moderate Reviews
                  {stats.flaggedReviews > 0 && (
                    <Badge className="ml-2 bg-red-500">{stats.flaggedReviews}</Badge>
                  )}
                </Button>
              </Link>
              <Link href="/admin/owners">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Owners
                </Button>
              </Link>
              <Link href="/admin/inquiries">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Inquiries
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Listings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Listings Awaiting Approval</CardTitle>
                <Link href="/admin/listings?status=pending">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {pendingListings.length > 0 ? (
                <div className="space-y-4">
                  {pendingListings.slice(0, 5).map((listing) => (
                    <div key={listing.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {listing.photos[0] ? (
                          <img
                            src={listing.photos[0].url}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Home className="w-5 h-5 text-gray-400 m-auto mt-3" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{listing.title}</h4>
                        <p className="text-sm text-gray-600">
                          by {listing.owner.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {listing.city.name}, {listing.city.state}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/admin/listings/${listing.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                  <p className="text-gray-600">All listings reviewed!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((listing) => (
                  <div key={listing.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Badge
                        variant={
                          listing.status === "ACTIVE"
                            ? "default"
                            : listing.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {listing.status.toLowerCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{listing.title}</p>
                      <p className="text-xs text-gray-500">
                        Updated by {listing.owner.user.name} • {
                          new Date(listing.updatedAt).toLocaleDateString()
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}