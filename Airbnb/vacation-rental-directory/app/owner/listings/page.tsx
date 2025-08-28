import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '../../lib/db';
import { getActiveSubscription, getTierDisplayName } from '../../lib/subscriptions';
import { getTierLimits } from '../../lib/billing-restrictions';
import { UpgradePrompt } from '../../components/billing/UpgradePrompt';
import { updateListingStatusAction } from './actions';

// Mock owner ID for demo - in real app, get from session
const DEMO_OWNER_ID = 'demo-owner-1';

async function ListingStatusButton({ 
  listingId, 
  currentStatus, 
  ownerId,
  currentTier,
  activeListingCount
}: { 
  listingId: string; 
  currentStatus: string; 
  ownerId: string; 
  currentTier: any;
  activeListingCount: number;
}) {
  const limits = getTierLimits(currentTier);
  const canActivate = limits.maxListings === -1 || activeListingCount < limits.maxListings;
  
  if (currentStatus === 'ACTIVE') {
    return (
      <form action={updateListingStatusAction.bind(null, listingId, 'DRAFT')}>
        <button
          type="submit"
          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
        >
          Deactivate
        </button>
      </form>
    );
  }
  
  if (!canActivate && currentStatus !== 'ACTIVE') {
    const requiredTier = currentTier === 'BRONZE' ? 'SILVER' : 
                        currentTier === 'SILVER' ? 'GOLD' : 'PLATINUM';
    return (
      <div className="space-y-2">
        <button
          disabled
          className="px-3 py-1 bg-gray-300 text-gray-500 text-sm rounded cursor-not-allowed"
        >
          🔒 Activate
        </button>
        <UpgradePrompt 
          currentTier={currentTier}
          requiredTier={requiredTier}
          feature="Additional active listings"
          compact={true}
        />
      </div>
    );
  }
  
  return (
    <form action={updateListingStatusAction.bind(null, listingId, 'ACTIVE')}>
      <button
        type="submit"
        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
      >
        Activate
      </button>
    </form>
  );
}

async function ListingsContent() {
  const [limits, listings, subscription] = await Promise.all([
    getOwnerListingLimits(DEMO_OWNER_ID),
    prisma.listing.findMany({
      where: { ownerId: DEMO_OWNER_ID },
      include: {
        city: true,
        photos: { take: 1, orderBy: { order: 'asc' } },
        _count: {
          select: {
            inquiries: true,
            reviews: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    }),
    getActiveSubscription(DEMO_OWNER_ID)
  ]);
  
  const activeListingCount = listings.filter(l => l.status === 'ACTIVE').length;
  const currentTier = subscription?.tier || null;
  
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Listings</h1>
          <p className="text-gray-600 mt-1">
            {limits.currentListings} of {limits.maxListings === 999999 ? '∞' : limits.maxListings} listings
            {subscription && (
              <span className="ml-2 text-sm">({getTierDisplayName(subscription.tier)})</span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {limits.canCreateMore && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              + Add Listing
            </button>
          )}
          {!limits.hasActiveSub && (
            <Link
              href="/owner/billing"
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Subscribe to Add Listings
            </Link>
          )}
        </div>
      </div>
      
      {/* Subscription Status */}
      {!limits.hasActiveSub && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="font-medium text-yellow-800">Subscription Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your listings cannot be activated without an active subscription. 
                <Link href="/owner/billing" className="underline ml-1">
                  Choose a plan to get started
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-600 mb-6">Create your first listing to start hosting guests.</p>
          {limits.canCreateMore ? (
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Create Your First Listing
            </button>
          ) : (
            <Link
              href="/owner/billing"
              className="inline-block px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Subscribe to Create Listings
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white border rounded-lg overflow-hidden">
              {/* Photo */}
              <div className="aspect-video bg-gray-200 relative">
                {listing.photos[0] ? (
                  <img
                    src={listing.photos[0].url}
                    alt={listing.photos[0].alt || listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    listing.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800'
                      : listing.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : listing.status === 'SUSPENDED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {listing.status}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 truncate">{listing.title}</h3>
                  <p className="text-sm text-gray-600">{listing.city.name}, {listing.city.state}</p>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <span>{listing.bedrooms} bed</span>
                  <span>{listing.bathrooms} bath</span>
                  <span>Sleeps {listing.sleeps || listing.maxGuests}</span>
                </div>
                
                {(listing.priceMin || listing.priceMax) && (
                  <div className="text-sm text-gray-900 font-medium">
                    ${listing.priceMin}
                    {listing.priceMax && listing.priceMax !== listing.priceMin && (
                      <>-${listing.priceMax}</>
                    )}
                    <span className="text-gray-600 font-normal">/night</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <span>{listing._count.inquiries} inquiries</span>
                  <span>{listing._count.reviews} reviews</span>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex space-x-2">
                    <Link
                      href={`/listing/${listing.slug}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                      target="_blank"
                    >
                      View →
                    </Link>
                    <button className="text-sm text-gray-600 hover:text-gray-800">
                      Edit
                    </button>
                  </div>
                  
                  <Suspense fallback={
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                  }>
                    <ListingStatusButton
                      listingId={listing.id}
                      currentStatus={listing.status}
                      ownerId={DEMO_OWNER_ID}
                      currentTier={currentTier}
                      activeListingCount={activeListingCount}
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}