'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import EventCard from '@/components/events/EventCard'
import { Search, Filter, Calendar, Grid, List, Plus, MapPin, DollarSign, Clock, Users } from 'lucide-react'
import { ForumLayout } from '@/components/layout/ForumLayout'

interface Event {
  id: string
  name: string
  description: string
  website: string
  startDate: string
  endDate: string
  location: string
  venue: string
  category: string
  industry: string[]
  estimatedCost: number
  attendeeCount: number
  isVirtual: boolean
  isHybrid: boolean
  imageUrl?: string
  logoUrl?: string
  organizerName: string
  organizerUrl?: string
  registrationUrl?: string
  // New schema fields
  status: string
  capacity?: number
  registrationDeadline?: string
  eventType?: string
  creator?: {
    id: string
    name: string
  }
  capacityStatus: {
    isAtCapacity: boolean
    isNearCapacity: boolean
    isRegistrationClosed: boolean
    availableSpots: number | null
    fillPercentage: number
  }
  avgOverallRating?: number
  avgNetworkingRating?: number
  avgContentRating?: number
  avgROIRating?: number
  totalRatings: number
  attendeesCount: number
  ratingsCount: number
  userAttendance?: {
    status: string
    isGoing: boolean
    hasAttended: boolean
    registeredAt?: string
    companyId?: string
    contactId?: string
  }
}

interface EventFilters {
  search: string
  category: string
  industry: string[]
  location: string
  status: string
  eventType: string
  dateRange: {
    start: string
    end: string
  }
  costRange: {
    min: number
    max: number
  }
  virtualOnly: boolean
  userAttending: boolean
  hasCapacity: boolean
}

export default function EventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    category: '',
    industry: [],
    location: '',
    status: '',
    eventType: '',
    dateRange: {
      start: '',
      end: ''
    },
    costRange: {
      min: 0,
      max: 10000
    },
    virtualOnly: false,
    userAttending: false,
    hasCapacity: false
  })

  // Category and industry options
  const categories = [
    'CONFERENCE', 'TRADE_SHOW', 'SUMMIT', 'WORKSHOP', 
    'WEBINAR', 'SEMINAR', 'PANEL', 'LAUNCH', 'AWARDS', 'NETWORKING'
  ]

  const eventTypes = [
    'INDUSTRY_EVENT', 'COMPANY_EVENT', 'PARTNER_EVENT', 
    'TRAINING', 'SOCIAL', 'CORPORATE'
  ]

  const statuses = [
    'PUBLISHED', 'DRAFT', 'CANCELLED', 'COMPLETED', 'SUSPENDED'
  ]
  
  const industries = [
    'DIGITAL_ADVERTISING', 'ADTECH', 'MARTECH', 'PROGRAMMATIC',
    'CONNECTED_TV', 'MOBILE_ADVERTISING', 'SOCIAL_MEDIA', 'SEARCH_MARKETING',
    'CONTENT_MARKETING', 'INFLUENCER_MARKETING', 'AFFILIATE_MARKETING', 'EMAIL_MARKETING',
    'ANALYTICS', 'DATA_SCIENCE', 'PRIVACY', 'MEDIA_BUYING'
  ]

  const locations = [
    'Las Vegas, NV', 'New York, NY', 'San Francisco, CA', 'Austin, TX',
    'Chicago, IL', 'Miami, FL', 'Los Angeles, CA', 'Boston, MA',
    'London, UK', 'Paris, France', 'Berlin, Germany', 'Toronto, Canada'
  ]

  const loadEvents = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.category) params.append('category', filters.category)
      if (filters.location) params.append('location', filters.location)
      if (filters.status) params.append('status', filters.status)
      if (filters.eventType) params.append('eventType', filters.eventType)
      if (filters.virtualOnly) params.append('virtualOnly', 'true')
      if (filters.userAttending) params.append('userAttending', 'true')
      if (filters.hasCapacity) params.append('hasCapacity', 'true')
      
      if (filters.industry.length > 0) {
        filters.industry.forEach(ind => params.append('industry[]', ind))
      }
      
      if (filters.dateRange.start) params.append('startDate', filters.dateRange.start)
      if (filters.dateRange.end) params.append('endDate', filters.dateRange.end)
      
      if (filters.costRange.min > 0) params.append('minCost', filters.costRange.min.toString())
      if (filters.costRange.max < 10000) params.append('maxCost', filters.costRange.max.toString())

      const response = await fetch(`/api/events?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      setEvents(data.events || [])
      setError(null)
    } catch (error) {
      console.error('Error loading events:', error)
      setError('Failed to load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load events immediately like the working orgs page
  useEffect(() => {
    loadEvents()
  }, []) // Run once on mount, just like the working orgs page

  const handleAttendanceUpdate = async (eventId: string, status: string, isGoing: boolean) => {
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          isGoing,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update attendance')
      }

      // Refresh events to get updated counts
      loadEvents()
    } catch (error) {
      console.error('Error updating attendance:', error)
      throw error
    }
  }

  const handleViewDetails = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      industry: [],
      location: '',
      status: '',
      eventType: '',
      dateRange: {
        start: '',
        end: ''
      },
      costRange: {
        min: 0,
        max: 10000
      },
      virtualOnly: false,
      userAttending: false,
      hasCapacity: false
    })
  }

  const formatCategoryName = (category: string) => {
    return category.replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatIndustryName = (industry: string) => {
    return industry.replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatEventTypeName = (eventType: string) => {
    return eventType.replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatStatusName = (status: string) => {
    return status.replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  if (status === 'loading') {
    return (
      <ForumLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </ForumLayout>
    )
  }

  const headerActions = (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
      >
        {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
        {viewMode === 'grid' ? 'List' : 'Grid'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
      </Button>
      <Button>
        <Plus className="w-4 h-4 mr-2" />
        Create Event
      </Button>
    </div>
  );

  return (
    <ForumLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Events & Conferences</h1>
            <p className="text-lg text-gray-600">Discover industry events, track ROI, and connect with your network</p>
          </div>
          <div className="flex items-center space-x-2">
            {headerActions}
          </div>
        </div>
        {/* Search & Quick Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {formatCategoryName(category)}
                  </option>
                ))}
              </select>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.virtualOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, virtualOnly: !filters.virtualOnly })}
            >
              Virtual Only
            </Button>
            <Button
              variant={filters.userAttending ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, userAttending: !filters.userAttending })}
            >
              My Events
            </Button>
            <Button
              variant={filters.hasCapacity ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, hasCapacity: !filters.hasCapacity })}
            >
              Available Spots
            </Button>
            {(filters.search || filters.category || filters.location || filters.virtualOnly || filters.userAttending || filters.hasCapacity) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Events Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading events</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={loadEvents}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-4">
                  {filters.search || filters.category || filters.location 
                    ? "Try adjusting your search criteria." 
                    : "Be the first to add an event!"
                  }
                </p>
                <div className="flex justify-center space-x-4">
                  {(filters.search || filters.category || filters.location) && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  <Button onClick={() => router.push('/events/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onAttendanceUpdate={handleAttendanceUpdate}
                onViewDetails={handleViewDetails}
                compact={viewMode === 'list'}
              />
            ))}
          </div>
        )}

        {/* Event Stats Summary */}
        {events.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Event Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{events.length}</div>
                  <div className="text-sm text-gray-600">Total Events</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {events.filter(e => e.userAttendance?.isGoing).length}
                  </div>
                  <div className="text-sm text-gray-600">Attending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {events.filter(e => e.isVirtual).length}
                  </div>
                  <div className="text-sm text-gray-600">Virtual</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {events.filter(e => e.capacityStatus.isNearCapacity || e.capacityStatus.isAtCapacity).length}
                  </div>
                  <div className="text-sm text-gray-600">Nearly Full</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ForumLayout>
  )
} 