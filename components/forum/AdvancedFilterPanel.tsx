'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface AdvancedFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ForumCategory[];
}

export function AdvancedFilterPanel({ isOpen, onClose, categories }: AdvancedFilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    urgency: searchParams.get('urgency') || '',
    dealSize: searchParams.get('dealSize') || '',
    location: searchParams.get('location') || '',
    mediaType: searchParams.get('mediaType') || '',
    dateRange: searchParams.get('dateRange') || '30d',
    sortBy: searchParams.get('sortBy') || 'relevance'
  });

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    // Apply each filter
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    params.delete('page'); // Reset to first page
    
    const queryString = params.toString();
    const url = queryString ? `/forum/search?${queryString}` : '/forum';
    
    router.push(url);
    onClose();
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      urgency: '',
      dealSize: '',
      location: '',
      mediaType: '',
      dateRange: '30d',
      sortBy: 'relevance'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value && value !== '30d' && value !== 'relevance'
  );

  const getFilterCount = () => {
    return Object.values(filters).filter(value => 
      value && value !== '30d' && value !== 'relevance'
    ).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
              {hasActiveFilters && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {getFilterCount()} active
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                value={filters.urgency}
                onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                <option value="URGENT">🚨 Urgent</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            {/* Deal Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deal Size
              </label>
              <select
                value={filters.dealSize}
                onChange={(e) => setFilters(prev => ({ ...prev, dealSize: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sizes</option>
                <option value="SMALL">Under $50K</option>
                <option value="MEDIUM">$50K - $500K</option>
                <option value="LARGE">$500K - $2M</option>
                <option value="ENTERPRISE">$2M+</option>
              </select>
            </div>

            {/* Media Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media Type
              </label>
              <select
                value={filters.mediaType}
                onChange={(e) => setFilters(prev => ({ ...prev, mediaType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="TV">Television</option>
                <option value="RADIO">Radio</option>
                <option value="DIGITAL">Digital</option>
                <option value="PRINT">Print</option>
                <option value="OOH">Out of Home</option>
                <option value="STREAMING">Streaming</option>
                <option value="PODCAST">Podcast</option>
                <option value="SOCIAL">Social Media</option>
                <option value="PROGRAMMATIC">Programmatic</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, state, or region"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="relevance">Most Relevant</option>
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
                <option value="active">Most Active</option>
              </select>
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Filters
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, urgency: 'URGENT' }))}
                  className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  🚨 Urgent Only
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, dateRange: '7d' }))}
                  className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  📅 This Week
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, dealSize: 'ENTERPRISE' }))}
                  className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  💰 Big Deals
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, mediaType: 'TV' }))}
                  className="px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  📺 TV Only
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 space-y-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            )}
            <button
              onClick={applyFilters}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter summary component for showing active filters
export function FilterSummary({ 
  searchParams, 
  categories, 
  onClearFilter 
}: {
  searchParams: URLSearchParams;
  categories: ForumCategory[];
  onClearFilter: (key: string) => void;
}) {
  const activeFilters = [];
  
  if (searchParams.get('category')) {
    const category = categories.find(c => c.slug === searchParams.get('category'));
    activeFilters.push({
      key: 'category',
      label: `Category: ${category?.name || searchParams.get('category')}`,
      value: searchParams.get('category')
    });
  }
  
  if (searchParams.get('urgency')) {
    const urgencyLabels = {
      'URGENT': '🚨 Urgent',
      'HIGH': 'High Priority',
      'MEDIUM': 'Medium Priority',
      'LOW': 'Low Priority'
    };
    activeFilters.push({
      key: 'urgency',
      label: `Priority: ${urgencyLabels[searchParams.get('urgency') as keyof typeof urgencyLabels]}`,
      value: searchParams.get('urgency')
    });
  }
  
  if (searchParams.get('dealSize')) {
    const dealSizeLabels = {
      'SMALL': 'Under $50K',
      'MEDIUM': '$50K - $500K',
      'LARGE': '$500K - $2M',
      'ENTERPRISE': '$2M+'
    };
    activeFilters.push({
      key: 'dealSize',
      label: `Deal Size: ${dealSizeLabels[searchParams.get('dealSize') as keyof typeof dealSizeLabels]}`,
      value: searchParams.get('dealSize')
    });
  }
  
  if (searchParams.get('location')) {
    activeFilters.push({
      key: 'location',
      label: `Location: ${searchParams.get('location')}`,
      value: searchParams.get('location')
    });
  }
  
  if (searchParams.get('mediaType')) {
    activeFilters.push({
      key: 'mediaType',
      label: `Media: ${searchParams.get('mediaType')}`,
      value: searchParams.get('mediaType')
    });
  }
  
  if (searchParams.get('dateRange') && searchParams.get('dateRange') !== '30d') {
    const dateRangeLabels = {
      '7d': 'Last 7 days',
      '90d': 'Last 3 months',
      'all': 'All time'
    };
    activeFilters.push({
      key: 'dateRange',
      label: `Time: ${dateRangeLabels[searchParams.get('dateRange') as keyof typeof dateRangeLabels]}`,
      value: searchParams.get('dateRange')
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map(filter => (
        <span
          key={filter.key}
          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
        >
          {filter.label}
          <button
            onClick={() => onClearFilter(filter.key)}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
} 