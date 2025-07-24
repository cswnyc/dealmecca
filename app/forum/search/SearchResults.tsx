'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SearchResultsContentProps {
  // Add props if needed - currently none required
}

function SearchResultsContent(props: SearchResultsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    // TODO: Implement search functionality when forum is ready
    setLoading(false);
    setResults([]);
  }, [query, category]);

  if (loading) {
    return <div className="p-4">Loading search results...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Search Results for "{query}"
      </h2>
      {results.length === 0 ? (
        <p className="text-gray-600">No results found.</p>
      ) : (
        <div>
          {/* TODO: Render search results */}
        </div>
      )}
    </div>
  );
}

export default function SearchResults() {
  return (
    <Suspense fallback={
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
} 