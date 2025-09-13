'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MobileSearchInterface from '@/components/mobile/MobileSearchInterface'
import MobileContactModal from '@/components/mobile/MobileContactModal'
import MobileSavedSearches from '@/components/mobile/MobileSavedSearches'
import MobileBottomNav from '@/components/mobile/MobileBottomNav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Filter, Star } from 'lucide-react'

// Sample quick filters for media sellers
const MEDIA_SELLER_QUICK_FILTERS = [
  {
    id: 'agency-ceos',
    label: 'Agency CEOs',
    description: 'C-level executives at agencies',
    icon: '👑',
    filters: {
      seniority: ['C_LEVEL'],
      companyTypes: ['INDEPENDENT_AGENCY', 'HOLDING_COMPANY_AGENCY'],
      isDecisionMaker: true
    }
  },
  {
    id: 'brand-cmOs',
    label: 'Brand CMOs',
    description: 'Chief Marketing Officers at brands',
    icon: '🎯',
    filters: {
      seniority: ['C_LEVEL'],
      departments: ['MARKETING'],
      companyTypes: ['NATIONAL_ADVERTISER', 'LOCAL_ADVERTISER']
    }
  },
  {
    id: 'media-directors',
    label: 'Media Directors',
    description: 'Media planning and buying directors',
    icon: '🚀',
    filters: {
      seniority: ['DIRECTOR', 'SENIOR_DIRECTOR'],
      departments: ['MEDIA_PLANNING', 'MEDIA_BUYING']
    }
  },
  {
    id: 'programmatic-specialists',
    label: 'Programmatic Experts',
    description: 'Programmatic advertising specialists',
    icon: '🤖',
    filters: {
      departments: ['PROGRAMMATIC'],
      seniority: ['MANAGER', 'SENIOR_MANAGER', 'DIRECTOR']
    }
  },
  {
    id: 'nyc-contacts',
    label: 'NYC Market',
    description: 'Contacts in New York City',
    icon: '🏙️',
    filters: {
      locations: ['New York, NY']
    }
  },
  {
    id: 'decision-makers',
    label: 'Decision Makers',
    description: 'Confirmed budget decision makers',
    icon: '💼',
    filters: {
      isDecisionMaker: true
    }
  }
]

function MobileSearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentView, setCurrentView] = useState<'search' | 'saved'>('search')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [showContactModal, setShowContactModal] = useState(false)

  // Initialize view from URL params
  useEffect(() => {
    const view = searchParams.get('view')
    if (view === 'saved') {
      setCurrentView('saved')
    }
  }, [searchParams])

  const handleSearch = async (query: string, filters: any) => {
    try {
      setLoading(true)
      
      // Build search parameters
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (filters.searchType) params.set('searchType', filters.searchType)
      
      // Add filter arrays
      if (filters.departments?.length) {
        filters.departments.forEach((dept: string) => params.append('department', dept))
      }
      if (filters.seniorities?.length) {
        filters.seniorities.forEach((sen: string) => params.append('seniority', sen))
      }
      if (filters.companyTypes?.length) {
        filters.companyTypes.forEach((type: string) => params.append('companyType', type))
      }
      if (filters.industries?.length) {
        filters.industries.forEach((ind: string) => params.append('industry', ind))
      }
      if (filters.locations?.length) {
        filters.locations.forEach((loc: string) => params.append('city', loc.split(',')[0]))
      }
      if (filters.isDecisionMaker) {
        params.set('isDecisionMaker', 'true')
      }

      const response = await fetch(`/api/search/enhanced?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        
        // Combine contacts and companies into a unified results array
        const contacts = data.contacts || []
        const companies = data.companies || []
        
        // Transform company results to look like contacts for unified display
        const companyContacts = companies.map((company: any) => ({
          id: `company-${company.id}`,
          firstName: '',
          lastName: '',
          fullName: company.name,
          title: 'Company',
          email: null,
          phone: null,
          linkedinUrl: null,
          isDecisionMaker: false,
          verified: company.verified,
          seniority: null,
          department: null,
          company: {
            id: company.id,
            name: company.name,
            companyType: company.companyType,
            industry: company.industry,
            city: company.city,
            state: company.state,
            verified: company.verified
          }
        }))
        
        setSearchResults([...contacts, ...companyContacts])
      } else {
        console.error('Search failed')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSearch = () => {
    // This would typically open a save dialog
    console.log('Save search clicked')
  }

  const handleApplyQuickFilter = (filter: any) => {
    // Add the filter to applied filters
    const newFilter = {
      label: filter.label,
      value: filter.id,
      ...filter.filters
    }
    
    setAppliedFilters(prev => [...prev, newFilter])
    
    // Execute search with the quick filter
    handleSearch('', filter.filters)
  }

  const handleRemoveFilter = (filterToRemove: any) => {
    setAppliedFilters(prev => prev.filter(f => f.value !== filterToRemove.value))
  }

  const handleContactClick = (contact: any) => {
    setSelectedContact(contact)
    setShowContactModal(true)
  }

  const handleContactInteraction = async (type: string, data: any) => {
    // Record interaction via API
    try {
      await fetch(`/api/contacts/${selectedContact.id}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error('Failed to record interaction:', error)
    }
  }

  const handleAddNote = async (note: string) => {
    // Add note via API
    try {
      await fetch(`/api/contacts/${selectedContact.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note })
      })
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  const handleScheduleFollowUp = async (date: string) => {
    // Schedule follow-up via API
    try {
      await fetch(`/api/contacts/${selectedContact.id}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MEETING',
          notes: 'Scheduled follow-up',
          followUpAt: date
        })
      })
    } catch (error) {
      console.error('Failed to schedule follow-up:', error)
    }
  }

  const handleExecuteSavedSearch = (searchData: any) => {
    // Switch to search view and display results
    setCurrentView('search')
    setSearchResults(searchData.results.contacts || [])
    router.push('/search/mobile?view=search')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="min-h-[44px] min-w-[44px] rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="text-lg font-semibold text-gray-900">
            {currentView === 'search' ? 'Smart Search' : 'Saved Searches'}
          </h1>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={currentView === 'search' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setCurrentView('search')
                router.push('/search/mobile?view=search')
              }}
              className="min-h-[44px] rounded-full"
            >
              <Filter className="w-4 h-4 mr-1" />
              Search
            </Button>
            <Button
              variant={currentView === 'saved' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setCurrentView('saved')
                router.push('/search/mobile?view=saved')
              }}
              className="min-h-[44px] rounded-full"
            >
              <Star className="w-4 h-4 mr-1" />
              Saved
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {currentView === 'search' ? (
        <MobileSearchInterface
          onSearch={handleSearch}
          onSaveSearch={handleSaveSearch}
          results={searchResults.map(contact => ({
            ...contact,
            onClick: () => handleContactClick(contact)
          }))}
          loading={loading}
          quickFilters={MEDIA_SELLER_QUICK_FILTERS}
          appliedFilters={appliedFilters}
          onRemoveFilter={handleRemoveFilter}
          onApplyQuickFilter={handleApplyQuickFilter}
        />
      ) : (
        <MobileSavedSearches
          onExecuteSearch={handleExecuteSavedSearch}
          onSaveCurrentSearch={handleSaveSearch}
        />
      )}

      {/* Contact Modal */}
      {selectedContact && (
        <MobileContactModal
          contact={selectedContact}
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          onInteraction={handleContactInteraction}
          onAddNote={handleAddNote}
          onScheduleFollowUp={handleScheduleFollowUp}
        />
      )}

      {/* Bottom Navigation */}
      <MobileBottomNav
        onNewSearch={() => setCurrentView('search')}
        notifications={0}
      />
    </div>
  )
}

export default function MobileSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading mobile search...</p>
        </div>
      </div>
    }>
      <MobileSearchContent />
    </Suspense>
  )
}
