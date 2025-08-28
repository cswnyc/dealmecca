import { Suspense } from 'react';
import Link from 'next/link';
import { hasActiveSub } from '../lib/subscriptions';

// Mock owner ID for demo - in real app, get from session
const DEMO_OWNER_ID = 'demo-owner-1';

async function OwnerNavigation() {
  const hasActiveSubscription = await hasActiveSub(DEMO_OWNER_ID);
  
  return (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Local Stays
            </Link>
            <nav className="flex space-x-6">
              <Link
                href="/owner/listings"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Listings
              </Link>
              <Link
                href="/owner/billing"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Billing
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {!hasActiveSubscription && (
              <Link
                href="/owner/billing"
                className="bg-yellow-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-yellow-700"
              >
                Subscribe Now
              </Link>
            )}
            <div className="text-sm text-gray-600">Demo Owner</div>
          </div>
        </div>
      </div>
      
      {/* Subscription Warning Banner */}
      {!hasActiveSubscription && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Your listings are limited until you subscribe
                  </p>
                  <p className="text-xs text-yellow-700">
                    Subscribe to activate your listings and access all features
                  </p>
                </div>
              </div>
              <Link
                href="/owner/billing"
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
              >
                Choose a plan →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex space-x-6">
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      }>
        <OwnerNavigation />
      </Suspense>
      
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}