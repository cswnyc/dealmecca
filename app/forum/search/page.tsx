import { Suspense } from 'react';
import SearchResults from './SearchResults';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Search Forum</h1>
          <p className="mt-2 text-gray-600">
            Find discussions, opportunities, and insights across all forum categories
          </p>
        </div>

        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search bar skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Results skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 