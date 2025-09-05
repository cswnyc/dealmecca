'use client';

import { useState, useRef } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface ForumSearchProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  className?: string;
}

interface SearchFilters {
  category?: string;
  author?: string;
  tags?: string[];
  dateRange?: string;
  sortBy?: string;
}

export function ForumSearch({ onSearch, className }: ForumSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value, activeFilters);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveFilters({});
    onSearch('', {});
    inputRef.current?.focus();
  };

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search posts, topics, or people..."
            value={searchQuery}
            onChange={handleInputChange}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className="w-full h-10 pl-10 pr-10 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
            style={{
              fontSize: '16px', // Prevents zoom on mobile
              touchAction: 'manipulation'
            }}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Active Filters */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-sm text-gray-500">Filters:</span>
          {activeFilters.category && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
              Category: {activeFilters.category}
              <button
                onClick={() => setActiveFilters(prev => ({ ...prev, category: undefined }))}
                className="ml-1 text-gray-500 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeFilters.author && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
              Author: {activeFilters.author}
              <button
                onClick={() => setActiveFilters(prev => ({ ...prev, author: undefined }))}
                className="ml-1 text-gray-500 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => setActiveFilters({})}
            className="text-xs text-gray-500 hover:text-red-500 px-2 py-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mt-1 z-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={activeFilters.category || ''}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
              >
                <option value="">All Categories</option>
                <option value="hot-opportunities">🔥 Hot Opportunities</option>
                <option value="account-intelligence">💼 Account Intelligence</option>
                <option value="industry-insights">📈 Industry Insights</option>
                <option value="success-stories">🎯 Success Stories</option>
                <option value="networking">🤝 Networking</option>
                <option value="quick-questions">⚡ Quick Questions</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select 
                className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={activeFilters.sortBy || 'newest'}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
                <option value="most-replies">Most Replies</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select 
                className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={activeFilters.dateRange || ''}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, dateRange: e.target.value || undefined }))}
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}