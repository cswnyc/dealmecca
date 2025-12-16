'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, X, Mic, Camera, MapPin, Clock, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MobileSearchInterfaceProps {
  onSearch: (query: string, filters: any) => void
  recentSearches: string[]
  savedSearches: any[]
  quickFilters: any[]
  isLoading?: boolean
}

export default function MobileSearchInterface({
  onSearch,
  recentSearches,
  savedSearches,
  quickFilters,
  isLoading = false
}: MobileSearchInterfaceProps) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<any>({})
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [voiceSearch, setVoiceSearch] = useState(false)
  
  // Mobile-optimized search suggestions
  const [suggestions, setSuggestions] = useState<any[]>([])

  useEffect(() => {
    if (query.length > 2) {
      // Simulate API call for suggestions
      const mockSuggestions = [
        { id: 1, text: `${query} companies`, type: 'company', count: 45 },
        { id: 2, text: `${query} contacts`, type: 'contact', count: 23 },
        { id: 3, text: `${query} in NYC`, type: 'location', count: 12 }
      ]
      setSuggestions(mockSuggestions)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [query])

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, activeFilters)
      setShowSuggestions(false)
    }
  }

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      setVoiceSearch(true)
      recognition.start()

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setVoiceSearch(false)
        onSearch(transcript, activeFilters)
      }

      recognition.onerror = () => {
        setVoiceSearch(false)
      }

      recognition.onend = () => {
        setVoiceSearch(false)
      }
    }
  }

  const applyQuickFilter = (filter: any) => {
    setActiveFilters({ ...activeFilters, ...filter.filters })
    onSearch(query || '', { ...activeFilters, ...filter.filters })
  }

  const removeFilter = (key: string) => {
    const newFilters = { ...activeFilters }
    delete newFilters[key]
    setActiveFilters(newFilters)
  }

  const activeFilterCount = Object.keys(activeFilters).length

  return (
    <div className="bg-card rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies, contacts..."
              className="w-full pl-12 pr-20 py-3 text-lg border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceSearch}
                className={`p-2 rounded-xl ${voiceSearch ? 'bg-red-100 text-red-600' : ''}`}
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-xl relative"
              >
                <Filter className="w-4 h-4" />
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(activeFilters).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {Array.isArray(value) ? `${key}: ${value.length}` : `${key}: ${value}`}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeFilter(key)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showSuggestions && suggestions.length > 0 ? (
          /* Search Suggestions */
          <div className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-3">Suggestions</div>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => {
                  setQuery(suggestion.text)
                  onSearch(suggestion.text, activeFilters)
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-xl mb-2"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="text-left">{suggestion.text}</span>
                </div>
                <Badge variant="outline">{suggestion.count}</Badge>
              </button>
            ))}
          </div>
        ) : (
          /* Default View */
          <div className="p-4 space-y-6">
            {/* Quick Filters */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-sm font-medium text-muted-foreground">Quick Filters</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickFilters.slice(0, 6).map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => applyQuickFilter(filter)}
                    className="p-3 text-left bg-muted rounded-xl hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{filter.icon}</span>
                      <span className="font-medium text-sm">{filter.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{filter.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm font-medium text-muted-foreground">Recent</div>
                </div>
                {recentSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search)
                      onSearch(search, activeFilters)
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-xl mb-2"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-left flex-1">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm font-medium text-muted-foreground">Saved</div>
                </div>
                {savedSearches.slice(0, 3).map((search) => (
                  <button
                    key={search.id}
                    onClick={() => {
                      setQuery(search.query)
                      setActiveFilters(search.filters)
                      onSearch(search.query, search.filters)
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-xl mb-2"
                  >
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <div className="text-left flex-1">
                      <div className="font-medium">{search.name}</div>
                      <div className="text-sm text-muted-foreground">{search.query}</div>
                    </div>
                    <Badge variant="outline">{search.lastResultCount}</Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="border-t border-border p-4 bg-muted">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Location Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['New York', 'Los Angeles', 'Chicago', 'San Francisco'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    const locations = activeFilters.city || []
                    const newLocations = locations.includes(city) 
                      ? locations.filter((l: string) => l !== city)
                      : [...locations, city]
                    setActiveFilters({ ...activeFilters, city: newLocations })
                  }}
                  className={`p-2 text-sm rounded-lg border ${
                    activeFilters.city?.includes(city) 
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-card border-border'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Industry Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Industry
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Technology', 'Healthcare', 'Finance', 'Media'].map((industry) => (
                <button
                  key={industry}
                  onClick={() => {
                    const industries = activeFilters.industry || []
                    const newIndustries = industries.includes(industry) 
                      ? industries.filter((i: string) => i !== industry)
                      : [...industries, industry]
                    setActiveFilters({ ...activeFilters, industry: newIndustries })
                  }}
                  className={`p-2 text-sm rounded-lg border ${
                    activeFilters.industry?.includes(industry) 
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-card border-border'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSearch}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Apply Filters'}
          </Button>
        </div>
      )}

      {/* Voice Search Indicator */}
      {voiceSearch && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-card rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Mic className="w-8 h-8 text-red-600" />
            </div>
            <div className="font-medium mb-2">Listening...</div>
            <div className="text-sm text-muted-foreground">Speak your search query</div>
          </div>
        </div>
      )}
    </div>
  )
}