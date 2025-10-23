'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { mobileOptimizer, useMobileOptimization } from '@/lib/mobile-performance';
import {
  Search,
  Filter,
  SortAsc,
  Loader2,
  Users,
  Building,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  Smartphone
} from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  title: string;
  company: {
    name: string;
    website?: string;
  };
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  relevanceScore?: number;
}

interface MobileOptimizedSearchProps {
  onSearch?: (query: string, filters: any) => Promise<SearchResult[]>;
  placeholder?: string;
  maxResults?: number;
}

export default function MobileOptimizedSearch({
  onSearch,
  placeholder = "Search for contacts...",
  maxResults = 1000
}: MobileOptimizedSearchProps) {
  const { deviceInfo, isMobile, optimizeDataset, createInfiniteScroll, measurePerformance } = useMobileOptimization();
  
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'company'>('relevance');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  
  // Debounced search to avoid excessive API calls
  const debouncedSearch = useCallback(
    mobileOptimizer.debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const searchResults = await performSearch(searchQuery, filters);
        setResults(searchResults);
        setPage(1); // Reset pagination
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, 300),
    [filters]
  );

  // Mock search function - replace with actual API call
  const performSearch = async (searchQuery: string, searchFilters: any): Promise<SearchResult[]> => {
    return measurePerformance(() => {
      // Simulate API delay
      return new Promise<SearchResult[]>(resolve => {
        setTimeout(() => {
          const mockResults: SearchResult[] = Array.from({ length: maxResults }, (_, i) => ({
            id: `contact_${i}`,
            name: `Contact ${i + 1}`,
            title: ['Software Engineer', 'Product Manager', 'Designer', 'Data Scientist'][i % 4],
            company: {
              name: `Company ${Math.floor(i / 10) + 1}`,
              website: `https://company${Math.floor(i / 10) + 1}.com`
            },
            email: Math.random() > 0.3 ? `contact${i + 1}@example.com` : undefined,
            phone: Math.random() > 0.5 ? `+1-555-${String(i).padStart(4, '0')}` : undefined,
            location: ['San Francisco', 'New York', 'London', 'Berlin'][i % 4],
            linkedinUrl: `https://linkedin.com/in/contact${i + 1}`,
            relevanceScore: 100 - (i * 2) + Math.random() * 10
          })).filter(contact => 
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.company.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          
          resolve(mockResults);
        }, 300);
      });
    }, 'Search Operation').result;
  };

  // Optimize results for mobile display
  const { visibleItems: optimizedResults, hasMore, optimizationApplied } = optimizeDataset(results, page);

  // Handle infinite scroll for mobile
  const infiniteScroll = createInfiniteScroll(async (nextPage: number) => {
    const { visibleItems } = optimizeDataset(results, nextPage);
    return visibleItems;
  });

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  useEffect(() => {
    if (resultsContainerRef.current && isMobile) {
      resultsContainerRef.current.addEventListener('scroll', infiniteScroll.handleScroll);
      return () => {
        resultsContainerRef.current?.removeEventListener('scroll', infiniteScroll.handleScroll);
      };
    }
  }, [infiniteScroll.handleScroll, isMobile]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const renderMobileResult = (result: SearchResult, index: number) => (
    <Card key={result.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {result.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-200 truncate">
              {result.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
              {result.company.name}
            </p>
            {result.location && (
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                {result.location}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end space-y-1 ml-2">
            {result.email && (
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <Mail className="h-4 w-4" />
              </Button>
            )}
            {result.phone && (
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <Phone className="h-4 w-4" />
              </Button>
            )}
            {result.linkedinUrl && (
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {result.relevanceScore && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {Math.round(result.relevanceScore)}% match
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderDesktopResult = (result: SearchResult, index: number) => (
    <div key={result.id} className="border-b border-gray-200 dark:border-slate-700 py-4 last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex-1 grid grid-cols-4 gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {result.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-200">
              {result.title}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-900 dark:text-white">
              {result.company.name}
            </p>
            {result.location && (
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                {result.location}
              </div>
            )}
          </div>
          <div className="text-sm">
            {result.email && (
              <div className="flex items-center text-gray-600 dark:text-slate-200 mb-1">
                <Mail className="h-3 w-3 mr-2" />
                {result.email}
              </div>
            )}
            {result.phone && (
              <div className="flex items-center text-gray-600 dark:text-slate-200">
                <Phone className="h-3 w-3 mr-2" />
                {result.phone}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end space-x-2">
            {result.relevanceScore && (
              <Badge variant="secondary" className="text-xs">
                {Math.round(result.relevanceScore)}% match
              </Badge>
            )}
            {result.linkedinUrl && (
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-4">
      {/* Mobile Performance Indicator */}
      {mounted && isMobile && (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            Mobile optimizations active: {optimizationApplied.join(', ')}
            {deviceInfo.connectionType && ` | Connection: ${deviceInfo.connectionType}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Search Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {mounted && isMobile ? 'Mobile Search' : 'Advanced Search'}
          </CardTitle>
          <CardDescription>
            Optimized for {mounted && isMobile ? 'mobile devices' : 'desktop'} with {results.length} results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>

          {/* Mobile Filters Toggle */}
          {mounted && isMobile && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Filters (expandable on mobile) */}
          {(!mounted || !isMobile || showFilters) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input placeholder="City, State, Country" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input placeholder="Job title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <Input placeholder="Company name" />
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-200">
              <SortAsc className="h-4 w-4" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-sm"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="name">Sort by Name</option>
                <option value="company">Sort by Company</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-500">
              Showing {optimizedResults.length} of {results.length} results
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {optimizedResults.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div 
              ref={resultsContainerRef}
              className={`${mounted && isMobile ? 'max-h-96 overflow-y-auto p-4' : 'p-6'}`}
            >
              {mounted && isMobile ? (
                // Mobile card layout
                <div className="space-y-3">
                  {optimizedResults.map(renderMobileResult)}
                </div>
              ) : (
                // Desktop list layout
                <div className="space-y-0">
                  {optimizedResults.map(renderDesktopResult)}
                </div>
              )}
            </div>
            
            {/* Load More Button for Mobile */}
            {mounted && isMobile && hasMore && (
              <div className="p-4 border-t">
                <Button 
                  onClick={handleLoadMore}
                  className="w-full"
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  )}
                  Load More Results
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && query && optimizedResults.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-slate-200">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Performance Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && mounted && isMobile && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Performance Info</h4>
            <div className="text-xs text-gray-600 dark:text-slate-200 space-y-1">
              <div>Device: {deviceInfo.viewport.width}x{deviceInfo.viewport.height}</div>
              <div>Connection: {deviceInfo.connectionType}</div>
              <div>Batch Size: {deviceInfo.recommendedBatchSize}</div>
              <div>Optimizations: {optimizationApplied.join(', ')}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}