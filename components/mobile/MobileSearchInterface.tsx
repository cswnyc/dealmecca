'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, Filter, X, ChevronUp, ChevronDown, Star, 
  Users, Building2, MapPin, Award, Mail, Phone, 
  ExternalLink, Plus, Settings, Zap
} from 'lucide-react'

interface MobileSearchInterfaceProps {
  onSearch: (query: string, filters: any) => void
  onSaveSearch: () => void
  results: any[]
  loading: boolean
  quickFilters: any[]
  appliedFilters: any[]
  onRemoveFilter: (filter: any) => void
  onApplyQuickFilter: (filter: any) => void
}

export default function MobileSearchInterface({
  onSearch,
  onSaveSearch,
  results,
  loading,
  quickFilters,
  appliedFilters,
  onRemoveFilter,
  onApplyQuickFilter
}: MobileSearchInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterSheet, setFilterSheet] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    departments: [],
    seniorities: [],
    companyTypes: [],
    industries: [],
    locations: [],
    isDecisionMaker: false
  })
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const filterSheetRef = useRef<HTMLDivElement>(null)

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        onSearch(searchQuery, selectedFilters)
      }
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedFilters, onSearch])

  // Handle filter sheet backdrop click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterSheetRef.current && !filterSheetRef.current.contains(event.target as Node)) {
        setFilterSheet(false)
      }
    }

    if (filterSheet) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [filterSheet])

  const handleFilterToggle = () => {
    setFilterSheet(!filterSheet)
  }

  const handleQuickFilterApply = (filter: any) => {
    onApplyQuickFilter(filter)
    setFilterSheet(false)
  }

  const clearAllFilters = () => {
    setSelectedFilters({
      departments: [],
      seniorities: [],
      companyTypes: [],
      industries: [],
      locations: [],
      isDecisionMaker: false
    })
    appliedFilters.forEach(filter => onRemoveFilter(filter))
  }

  const getIconComponent = (iconStr: string) => {
    switch (iconStr) {
      case '👑': return Star
      case '🎯': return MapPin
      case '🚀': return Users
      case '🤖': return Settings
      case '🏙️': return Building2
      case '💼': return Award
      default: return Star
    }
  }

  return (
    <div className="bg-card min-h-screen">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 safe-area-top">
        {/* Search Bar */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search contacts, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-base border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent"
              style={{ fontSize: '16px' }} // Prevent zoom on iOS
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={handleFilterToggle}
            className="min-h-[48px] min-w-[48px] rounded-xl border-border"
          >
            <Filter className="w-5 h-5" />
            {appliedFilters.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center rounded-full"
              >
                {appliedFilters.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Applied Filters */}
        {appliedFilters.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
              {appliedFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 py-1 px-3 text-sm"
                >
                  {filter.label}
                  <button
                    onClick={() => onRemoveFilter(filter)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground text-sm"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Filters Row */}
      <div className="px-4 py-3 border-b border-border/50">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {quickFilters.slice(0, 6).map((filter) => {
              const IconComponent = getIconComponent(filter.icon)
              return (
                <Button
                  key={filter.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilterApply(filter)}
                  className="flex items-center gap-2 whitespace-nowrap py-2 px-3 rounded-full border-border hover:bg-primary/10 hover:border-primary/30"
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{filter.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 px-4 py-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
            {appliedFilters.length > 0 && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="rounded-xl"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <MobileContactCard key={result.id || index} contact={result} />
            ))}
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      {filterSheet && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setFilterSheet(false)}
          />
          
          {/* Sheet */}
          <div
            ref={filterSheetRef}
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[85vh] overflow-hidden"
            style={{
              transform: filterSheet ? 'translateY(0)' : 'translateY(100%)'
            }}
          >
            {/* Sheet Header */}
            <div className="sticky top-0 bg-card px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterSheet(false)}
                  className="min-h-[44px] min-w-[44px] rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Handle indicator */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-border rounded-full" />
            </div>

            {/* Sheet Content */}
            <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 80px)' }}>
              {/* Quick Filters */}
              <div className="mb-6">
                <h4 className="text-base font-medium text-foreground mb-3">Quick Filters</h4>
                <div className="grid grid-cols-2 gap-3">
                  {quickFilters.map((filter) => {
                    const IconComponent = getIconComponent(filter.icon)
                    return (
                      <Button
                        key={filter.id}
                        variant="outline"
                        onClick={() => handleQuickFilterApply(filter)}
                        className="h-auto p-4 flex flex-col items-center space-y-2 rounded-xl border-border hover:bg-primary/10 hover:border-primary/30"
                      >
                        <IconComponent className="w-6 h-6 text-primary" />
                        <div className="text-center">
                          <div className="font-medium text-sm">{filter.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">{filter.description}</div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Decision Makers Toggle */}
              <div className="mb-6">
                <label className="flex items-center justify-between py-3">
                  <span className="text-base font-medium text-foreground">Decision Makers Only</span>
                  <input
                    type="checkbox"
                    checked={selectedFilters.isDecisionMaker}
                    onChange={(e) => setSelectedFilters({
                      ...selectedFilters,
                      isDecisionMaker: e.target.checked
                    })}
                    className="w-6 h-6 text-primary border-border rounded focus:ring-ring"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="h-12 rounded-xl"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => setFilterSheet(false)}
                  className="h-12 rounded-xl bg-primary hover:bg-primary/90"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={onSaveSearch}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}

// Mobile Contact Card Component
function MobileContactCard({ contact }: { contact: any }) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const displayName = contact.fullName || `${contact.firstName} ${contact.lastName}`

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    const touch = e.touches[0]
    cardRef.current?.setAttribute('data-start-x', touch.clientX.toString())
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const touch = e.touches[0]
    const startX = parseFloat(cardRef.current?.getAttribute('data-start-x') || '0')
    const currentX = touch.clientX
    const diff = currentX - startX
    
    // Limit swipe distance
    const maxSwipe = 80
    const limitedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff))
    setSwipeOffset(limitedDiff)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    
    if (Math.abs(swipeOffset) > 40) {
      // Trigger action based on swipe direction
      if (swipeOffset > 0) {
        // Swipe right - email action
        handleEmailAction()
      } else {
        // Swipe left - call action
        handlePhoneAction()
      }
    }
    
    // Reset position
    setSwipeOffset(0)
  }

  const handleEmailAction = () => {
    if (contact.email) {
      window.open(`mailto:${contact.email}`)
    }
  }

  const handlePhoneAction = () => {
    if (contact.phone) {
      window.open(`tel:${contact.phone}`)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Action Backgrounds */}
      <div className="absolute inset-0 flex">
        {/* Email background (right swipe) */}
        <div
          className="flex-1 bg-green-600 flex items-center justify-start pl-6"
          style={{
            transform: `translateX(${Math.min(0, swipeOffset - 80)}px)`,
            opacity: swipeOffset > 0 ? Math.min(1, swipeOffset / 40) : 0
          }}
        >
          <Mail className="w-6 h-6 text-white" />
        </div>

        {/* Call background (left swipe) */}
        <div
          className="flex-1 bg-primary flex items-center justify-end pr-6"
          style={{
            transform: `translateX(${Math.max(0, swipeOffset + 80)}px)`,
            opacity: swipeOffset < 0 ? Math.min(1, Math.abs(swipeOffset) / 40) : 0
          }}
        >
          <Phone className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Contact Card */}
      <div
        ref={cardRef}
        className="bg-card border border-border rounded-xl p-4 relative z-10 transition-transform duration-150 active:scale-[0.98]"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate text-base">
              {displayName}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {contact.title} • {contact.company?.name}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              {contact.seniority && (
                <Badge variant="outline" className="text-xs">
                  {contact.seniority.replace(/_/g, ' ')}
                </Badge>
              )}
              {contact.isDecisionMaker && (
                <Badge variant="default" className="text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  Decision Maker
                </Badge>
              )}
              {contact.company?.city && contact.company?.state && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {contact.company.city}, {contact.company.state}
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 ml-4">
            {contact.email && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEmailAction}
                className="min-h-[44px] min-w-[44px] rounded-full"
              >
                <Mail className="w-4 h-4" />
              </Button>
            )}
            
            {contact.phone && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePhoneAction}
                className="min-h-[44px] min-w-[44px] rounded-full"
              >
                <Phone className="w-4 h-4" />
              </Button>
            )}
            
            {contact.linkedinUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(contact.linkedinUrl, '_blank')}
                className="min-h-[44px] min-w-[44px] rounded-full"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
