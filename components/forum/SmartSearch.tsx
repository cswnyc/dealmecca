'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

interface SearchSuggestion {
  type: 'company' | 'location' | 'tag' | 'recent';
  value: string;
  label: string;
  count?: number;
}

interface SmartSearchProps {
  placeholder?: string;
  showFilters?: boolean;
  onFiltersClick?: () => void;
}

export function SmartSearch({ 
  placeholder = "Search discussions...", 
  showFilters = true,
  onFiltersClick 
}: SmartSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);

  // Debounced search suggestions
  const debouncedGetSuggestions = debounce(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/forum/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      const formattedSuggestions: SearchSuggestion[] = [
        ...data.companies.map((company: string) => ({
          type: 'company' as const,
          value: company,
          label: `${company} (Company)`
        })),
        ...data.locations.map((location: string) => ({
          type: 'location' as const,
          value: location,
          label: `${location} (Location)`
        })),
        ...data.tags.map((tag: string) => ({
          type: 'tag' as const,
          value: tag,
          label: `#${tag}`
        }))
      ];

      setSuggestions(formattedSuggestions.slice(0, 8));
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (query) {
      debouncedGetSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams(searchParams);
    params.set('q', searchQuery.trim());
    params.delete('page'); // Reset to first page
    
    router.push(`/forum/search?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    let searchQuery = suggestion.value;
    
    // Add prefixes for different types
    if (suggestion.type === 'location') {
      searchQuery = `location:${suggestion.value}`;
    } else if (suggestion.type === 'tag') {
      searchQuery = `#${suggestion.value}`;
    }
    
    setQuery(searchQuery);
    handleSearch(searchQuery);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (searchParams.get('q')) {
      router.push('/forum');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setShowSuggestions(suggestions.length > 0);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
          {query && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          
          {showFilters && (
            <button
              onClick={onFiltersClick}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Advanced filters"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Loading suggestions...
            </div>
          ) : (
            <div className="py-2">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.value}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors ${
                      index === selectedIndex ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="text-sm text-gray-900">{suggestion.label}</span>
                    <span className={`text-xs capitalize px-2 py-1 rounded-full ${
                      suggestion.type === 'company' ? 'bg-green-100 text-green-600' :
                      suggestion.type === 'location' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {suggestion.type}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No suggestions found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}

// Search tips component
export function SearchTips() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
      <h4 className="font-medium text-blue-900 mb-2">Search Tips:</h4>
      <ul className="space-y-1 text-blue-700">
        <li>• Use quotes for exact phrases: "media buy"</li>
        <li>• Search by company: Nike, Amazon, Google</li>
        <li>• Filter by location: location:NYC or location:California</li>
        <li>• Find tags: #urgent, #tv, #digital</li>
        <li>• Combine terms: TV advertising NYC</li>
      </ul>
    </div>
  );
} 