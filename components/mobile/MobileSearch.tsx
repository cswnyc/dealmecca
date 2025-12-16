'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, 
  Mic, 
  MicOff, 
  X, 
  Filter, 
  MapPin, 
  Building, 
  Users, 
  Zap,
  Star,
  Clock,
  ArrowDown,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { usePWA } from '@/components/providers/pwa-provider'

interface SearchFilters {
  type: string
  industry: string
  size: string
  location: string
  recentActivity: boolean
}

interface QuickFilter {
  id: string
  label: string
  query: string
  icon: React.ReactNode
  color: string
}

interface MobileSearchProps {
  onSearch?: (query: string, filters: SearchFilters) => void
  placeholder?: string
  showVoiceSearch?: boolean
  showFilters?: boolean
  className?: string
}

export default function MobileSearch({
  onSearch,
  placeholder = "Search companies, contacts...",
  showVoiceSearch = true,
  showFilters = true,
  className = ''
}: MobileSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isOnline, addOfflineAction } = usePWA()
  
  const [query, setQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const pullStartY = useRef<number>(0)
  const pullCurrentY = useRef<number>(0)
  const isPulling = useRef<boolean>(false)

  const [filters, setFilters] = useState<SearchFilters>({
    type: '',
    industry: '',
    size: '',
    location: '',
    recentActivity: false
  })

  // Quick filter shortcuts
  const quickFilters: QuickFilter[] = [
    {
      id: 'fortune500',
      label: 'Fortune 500',
      query: 'Fortune 500 companies',
      icon: <Star className="w-4 h-4" />,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'recent-ipo',
      label: 'Recent IPOs',
      query: 'companies went public 2024',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'new-cmos',
      label: 'New CMOs',
      query: 'companies with new CMOs',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'nearby',
      label: 'Nearby',
      query: 'companies near me',
      icon: <MapPin className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-800'
    }
  ]

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }

    // Check if voice search should start automatically
    const voiceParam = searchParams.get('voice')
    if (voiceParam === 'true' && showVoiceSearch) {
      startVoiceSearch()
    }

    // Setup pull-to-refresh
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        pullStartY.current = e.touches[0].clientY
        isPulling.current = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current) return
      
      pullCurrentY.current = e.touches[0].clientY
      const pullDistance = pullCurrentY.current - pullStartY.current
      
      if (pullDistance > 100 && !isRefreshing) {
        setIsRefreshing(true)
        handleRefresh()
      }
    }

    const handleTouchEnd = () => {
      isPulling.current = false
      pullStartY.current = 0
      pullCurrentY.current = 0
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  const handleRefresh = async () => {
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Refresh suggestions or recent searches
    await fetchSuggestions('')
    setIsRefreshing(false)
  }

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(100)
      }
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      setIsListening(false)
      
      // Auto-search after voice input
      setTimeout(() => {
        handleSearch(transcript)
      }, 500)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleSearch = async (searchQuery?: string) => {
    const searchTerm = searchQuery || query
    if (!searchTerm.trim()) return

    // Save to recent searches
    const updatedRecent = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 10)
    setRecentSearches(updatedRecent)
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent))

    // If offline, queue the search
    if (!isOnline) {
      addOfflineAction({
        id: Date.now().toString(),
        type: 'search',
        data: { query: searchTerm, filters },
        timestamp: new Date()
      })
      
      // Show cached results if available
      const cachedResults = localStorage.getItem(`search_${searchTerm}`)
      if (cachedResults) {
        console.log('Showing cached results for:', searchTerm)
      }
      return
    }

    // Perform search
    if (onSearch) {
      onSearch(searchTerm, filters)
    } else {
      // Navigate to search results
      const searchParams = new URLSearchParams({
        q: searchTerm,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      })
      router.push(`/search/results?${searchParams}`)
    }
  }

  const handleQuickFilter = (filter: QuickFilter) => {
    setQuery(filter.query)
    handleSearch(filter.query)
  }

  const fetchSuggestions = async (searchTerm: string) => {
    if (!searchTerm || !isOnline) return

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchTerm)}&limit=5`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions?.map((s: any) => s.query) || [])
      } else if (response.status === 401) {
        // Authentication required - clear suggestions
        setSuggestions([])
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
    }
  }

  const clearQuery = () => {
    setQuery('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    
    // Fetch suggestions with debounce
    if (value.length > 2) {
      const timeoutId = setTimeout(() => {
        fetchSuggestions(value)
      }, 300)
      
      return () => clearTimeout(timeoutId)
    } else {
      setSuggestions([])
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Search Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        {/* Refresh Indicator */}
        {isRefreshing && (
          <div className="flex items-center justify-center py-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary mr-2" />
            <span className="text-sm text-primary">Refreshing...</span>
          </div>
        )}

        {/* Search Input Container */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={placeholder}
              className="w-full pl-10 pr-20 py-3 text-16 text-foreground bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              style={{ fontSize: '16px' }} // Prevent zoom on iOS
            />

            {/* Clear button */}
            {query && (
              <button
                onClick={clearQuery}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Voice Search button */}
            {showVoiceSearch && (
              <button
                onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                  isListening
                    ? 'text-destructive-foreground bg-destructive hover:bg-destructive/90'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
          </div>

          {/* Online/Offline Indicator */}
          <div className="absolute -top-2 right-0">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-orange-500" />
            )}
          </div>
        </div>

        {/* Voice Search Feedback */}
        {isListening && (
          <div className="mt-3 p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-4 bg-primary rounded animate-pulse"></div>
                <div className="w-2 h-3 bg-primary/80 rounded animate-pulse delay-75"></div>
                <div className="w-2 h-5 bg-primary rounded animate-pulse delay-150"></div>
              </div>
              <span className="text-sm text-primary">Listening... Speak now</span>
            </div>
          </div>
        )}

        {/* Filter and Search buttons */}
        <div className="flex items-center gap-2 mt-3">
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex-1"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
          <Button
            onClick={() => handleSearch()}
            disabled={!query.trim()}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-card px-4 py-3 border-b border-border">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleQuickFilter(filter)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-transform active:scale-95 ${filter.color}`}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions or Recent Searches */}
      {(suggestions.length > 0 || (!query && recentSearches.length > 0)) && (
        <div className="bg-card border-b border-border">
          <div className="px-4 py-3">
            <h3 className="text-sm font-medium text-foreground mb-2">
              {suggestions.length > 0 ? 'Suggestions' : 'Recent Searches'}
            </h3>
            <div className="space-y-1">
              {(suggestions.length > 0 ? suggestions : recentSearches).slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(item)
                    handleSearch(item)
                  }}
                  className="flex items-center gap-3 w-full p-2 text-left hover:bg-muted rounded-lg transition-colors"
                >
                  {suggestions.length > 0 ? (
                    <Search className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-foreground">{item}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-card border-b border-border px-4 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              >
                <option value="">All Types</option>
                <option value="Agency">Agency</option>
                <option value="Brand">Brand</option>
                <option value="Publisher">Publisher</option>
                <option value="Technology">Technology</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Industry</label>
              <select
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              >
                <option value="">All Industries</option>
                <option value="Advertising">Advertising</option>
                <option value="Technology">Technology</option>
                <option value="Media">Media</option>
                <option value="Retail">Retail</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Company Size</label>
              <select
                value={filters.size}
                onChange={(e) => setFilters({ ...filters, size: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              >
                <option value="">All Sizes</option>
                <option value="startup">Startup (1-50)</option>
                <option value="small">Small (51-200)</option>
                <option value="medium">Medium (201-1000)</option>
                <option value="large">Large (1000+)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recentActivity"
                checked={filters.recentActivity}
                onChange={(e) => setFilters({ ...filters, recentActivity: e.target.checked })}
                className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
              />
              <label htmlFor="recentActivity" className="text-sm text-muted-foreground">
                Recent activity only
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    type: '',
                    industry: '',
                    size: '',
                    location: '',
                    recentActivity: false
                  })
                }}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                onClick={() => setShowFilterPanel(false)}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Notice */}
      {!isOnline && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              You're offline. Searches will sync when reconnected.
            </span>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
} 