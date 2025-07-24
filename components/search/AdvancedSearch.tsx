'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, X, Star, Clock, TrendingUp, Building2, Users, MapPin, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SearchFilters {
  companyType: string[]
  industry: string[]
  employeeCount: {
    min: number
    max: number
  }
  headquarters: string[]
  revenueRange: {
    min: number
    max: number
  }
  recentChanges: boolean
  hasOpenings: boolean
  mediaSpend: 'high' | 'medium' | 'low' | 'any'
}

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: SearchFilters
  resultCount?: number
  lastRun: string
}

interface SearchSuggestion {
  id: string
  query: string
  type: 'company' | 'industry' | 'person' | 'trend'
  description: string
  popularity: number
  category?: string
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void
  recentSearches: string[]
  savedSearches: SavedSearch[]
  onSaveSearch: (name: string, query: string, filters: SearchFilters) => void
  onLoadSavedSearch: (search: SavedSearch) => void
  loading?: boolean
}

const defaultFilters: SearchFilters = {
  companyType: [],
  industry: [],
  employeeCount: { min: 0, max: 100000 },
  headquarters: [],
  revenueRange: { min: 0, max: 10000000000 },
  recentChanges: false,
  hasOpenings: false,
  mediaSpend: 'any'
}

const companyTypes = [
  'ADVERTISER',
  'AGENCY', 
  'MEDIA_COMPANY',
  'TECH_VENDOR',
  'PUBLISHER',
  'PRODUCTION_COMPANY'
]

const industries = [
  'Digital Advertising',
  'TV Broadcasting',
  'Radio',
  'Print Media',
  'Out of Home',
  'Streaming',
  'Podcasting',
  'AdTech',
  'MarTech',
  'Social Media',
  'Mobile Advertising',
  'Video Advertising'
]

const employeeRanges = [
  { label: '1-10', min: 1, max: 10 },
  { label: '11-50', min: 11, max: 50 },
  { label: '51-200', min: 51, max: 200 },
  { label: '201-500', min: 201, max: 500 },
  { label: '501-1000', min: 501, max: 1000 },
  { label: '1000+', min: 1000, max: 100000 }
]

const revenueRanges = [
  { label: 'Under $1M', min: 0, max: 1000000 },
  { label: '$1M-$10M', min: 1000000, max: 10000000 },
  { label: '$10M-$50M', min: 10000000, max: 50000000 },
  { label: '$50M-$100M', min: 50000000, max: 100000000 },
  { label: '$100M-$500M', min: 100000000, max: 500000000 },
  { label: '$500M+', min: 500000000, max: 10000000000 }
]

const quickFilters = [
  { name: 'Fortune 500', filters: { revenueRange: { min: 500000000, max: 10000000000 } } },
  { name: 'Recent IPOs', filters: { recentChanges: true } },
  { name: 'Hiring Now', filters: { hasOpenings: true } },
  { name: 'High Media Spend', filters: { mediaSpend: 'high' } },
  { name: 'Tech Companies', filters: { companyType: ['TECH_VENDOR'] } },
  { name: 'Agencies', filters: { companyType: ['AGENCY'] } }
]

export default function AdvancedSearch({ 
  onSearch, 
  recentSearches, 
  savedSearches, 
  onSaveSearch, 
  onLoadSavedSearch,
  loading = false
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [saveSearchName, setSaveSearchName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Mock suggestions - in real app, fetch from API
  const mockSuggestions: SearchSuggestion[] = [
    {
      id: '1',
      query: 'Companies with new CMOs',
      type: 'trend',
      description: 'Companies that hired new CMOs in the last 90 days',
      popularity: 85,
      category: 'Leadership Changes'
    },
    {
      id: '2',
      query: 'Nike competitors',
      type: 'company',
      description: 'Companies similar to Nike in apparel and sportswear',
      popularity: 92,
      category: 'Similar Companies'
    },
    {
      id: '3',
      query: 'Streaming services',
      type: 'industry',
      description: 'Companies in streaming and OTT video space',
      popularity: 78,
      category: 'Industry Focus'
    },
    {
      id: '4',
      query: 'Recent funding rounds',
      type: 'trend',
      description: 'Companies that received funding in the last 30 days',
      popularity: 88,
      category: 'Funding Activity'
    }
  ]

  useEffect(() => {
    if (query.length > 2) {
      // Simulate API call to get suggestions
      const filtered = mockSuggestions.filter(s => 
        s.query.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions(mockSuggestions.slice(0, 4))
      setShowSuggestions(false)
    }
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query, filters)
      setShowSuggestions(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleArrayFilterToggle = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter(v => v !== value)
        : [...(prev[key] as string[]), value]
    }))
  }

  const handleQuickFilter = (quickFilter: any) => {
    setFilters(prev => ({
      ...prev,
      ...quickFilter.filters
    }))
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  const handleSaveSearch = () => {
    if (saveSearchName.trim() && query.trim()) {
      onSaveSearch(saveSearchName.trim(), query, filters)
      setSaveSearchName('')
      setShowSaveDialog(false)
    }
  }

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object') return value.min > 0 || value.max < 100000
    if (typeof value === 'boolean') return value
    return value !== 'any'
  }).length

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Smart Company Search
        </CardTitle>
        <CardDescription>
          Find companies and contacts with AI-powered insights and advanced filtering
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search companies, contacts, or try 'companies with new CMOs'..."
                className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onFocus={() => setShowSuggestions(true)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!query.trim() || loading}
              className="px-6"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </form>

          {/* Search Suggestions */}
          {showSuggestions && (query.length > 2 || suggestions.length > 0) && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-2 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-600">Suggestions</div>
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => {
                    setQuery(suggestion.query)
                    setShowSuggestions(false)
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <div className="flex-shrink-0">
                    {suggestion.type === 'company' && <Building2 className="w-4 h-4 text-blue-500" />}
                    {suggestion.type === 'industry' && <Users className="w-4 h-4 text-green-500" />}
                    {suggestion.type === 'trend' && <TrendingUp className="w-4 h-4 text-purple-500" />}
                    {suggestion.type === 'person' && <Users className="w-4 h-4 text-orange-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{suggestion.query}</div>
                    <div className="text-sm text-gray-500">{suggestion.description}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {suggestion.popularity}% match
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-600">Quick filters:</span>
          {quickFilters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => handleQuickFilter(filter)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {filter.name}
            </button>
          ))}
        </div>

        {/* Recent & Saved Searches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Recent searches</span>
              </div>
              <div className="space-y-1">
                {recentSearches.slice(0, 3).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(search)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Saved searches</span>
              </div>
              <div className="space-y-1">
                {savedSearches.slice(0, 3).map((search) => (
                  <button
                    key={search.id}
                    onClick={() => onLoadSavedSearch(search)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium">{search.name}</div>
                    <div className="text-gray-500 text-xs">
                      {search.resultCount} results • {search.lastRun}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save Search Button */}
        {query.trim() && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Save Search
            </Button>
          </div>
        )}

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Advanced Filters</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Company Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Type
                </label>
                <div className="space-y-2">
                  {companyTypes.map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.companyType.includes(type)}
                        onChange={() => handleArrayFilterToggle('companyType', type)}
                        className="mr-2"
                      />
                      <span className="text-sm">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {industries.map((industry) => (
                    <label key={industry} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.industry.includes(industry)}
                        onChange={() => handleArrayFilterToggle('industry', industry)}
                        className="mr-2"
                      />
                      <span className="text-sm">{industry}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Employee Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Count
                </label>
                <div className="space-y-2">
                  {employeeRanges.map((range) => (
                    <label key={range.label} className="flex items-center">
                      <input
                        type="radio"
                        name="employeeCount"
                        checked={filters.employeeCount.min === range.min && filters.employeeCount.max === range.max}
                        onChange={() => handleFilterChange('employeeCount', { min: range.min, max: range.max })}
                        className="mr-2"
                      />
                      <span className="text-sm">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Revenue Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revenue Range
                </label>
                <div className="space-y-2">
                  {revenueRanges.map((range) => (
                    <label key={range.label} className="flex items-center">
                      <input
                        type="radio"
                        name="revenueRange"
                        checked={filters.revenueRange.min === range.min && filters.revenueRange.max === range.max}
                        onChange={() => handleFilterChange('revenueRange', { min: range.min, max: range.max })}
                        className="mr-2"
                      />
                      <span className="text-sm">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Media Spend */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media Spend Level
                </label>
                <div className="space-y-2">
                  {['any', 'high', 'medium', 'low'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        name="mediaSpend"
                        checked={filters.mediaSpend === level}
                        onChange={() => handleFilterChange('mediaSpend', level)}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Filters
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.recentChanges}
                      onChange={() => handleFilterChange('recentChanges', !filters.recentChanges)}
                      className="mr-2"
                    />
                    <span className="text-sm">Recent org changes (30 days)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasOpenings}
                      onChange={() => handleFilterChange('hasOpenings', !filters.hasOpenings)}
                      className="mr-2"
                    />
                    <span className="text-sm">Has job openings</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Search Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Save Search</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Name
                  </label>
                  <input
                    type="text"
                    value={saveSearchName}
                    onChange={(e) => setSaveSearchName(e.target.value)}
                    placeholder="Enter a name for this search..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Query
                  </label>
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {query}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveSearch}
                    disabled={!saveSearchName.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 