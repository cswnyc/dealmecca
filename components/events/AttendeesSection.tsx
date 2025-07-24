'use client'

import React, { useState } from 'react'
import { User, MessageCircle, Calendar, Building, MapPin, Filter, Search, UserPlus, Mail, Phone, Badge as BadgeIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AttendeeData {
  id: string
  name: string
  title: string
  company: string
  industry: string
  location: string
  attendanceStatus: string
  profilePicture?: string
  connectionStatus?: 'none' | 'pending' | 'connected'
  mutualConnections?: number
  interests?: string[]
  experience?: string
}

interface AttendeesSectionProps {
  eventId: string
  attendees: AttendeeData[]
  currentUserId?: string
  onConnect?: (attendeeId: string) => void
  onMessage?: (attendeeId: string) => void
}

const mockAttendees: AttendeeData[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Senior Account Executive',
    company: 'MediaForte Inc.',
    industry: 'Television',
    location: 'New York, NY',
    attendanceStatus: 'attending',
    connectionStatus: 'none',
    mutualConnections: 5,
    interests: ['Digital Advertising', 'Programmatic', 'OTT'],
    experience: '8+ years'
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'VP of Sales',
    company: 'Digital Dynamics',
    industry: 'Digital Media',
    location: 'Los Angeles, CA',
    attendanceStatus: 'registered',
    connectionStatus: 'connected',
    mutualConnections: 12,
    interests: ['Connected TV', 'Data Strategy', 'Attribution'],
    experience: '10+ years'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    title: 'Media Buyer',
    company: 'AdVantage Media',
    industry: 'Agency',
    location: 'Chicago, IL',
    attendanceStatus: 'planning',
    connectionStatus: 'pending',
    mutualConnections: 3,
    interests: ['Social Media', 'Influencer Marketing', 'Brand Safety'],
    experience: '5+ years'
  },
  {
    id: '4',
    name: 'David Thompson',
    title: 'Director of Partnerships',
    company: 'StreamCorp',
    industry: 'Streaming',
    location: 'Atlanta, GA',
    attendanceStatus: 'attending',
    connectionStatus: 'none',
    mutualConnections: 8,
    interests: ['Streaming', 'Content Partnerships', 'Monetization'],
    experience: '12+ years'
  },
  {
    id: '5',
    name: 'Lisa Wang',
    title: 'Sales Manager',
    company: 'Radio Networks Plus',
    industry: 'Radio',
    location: 'Denver, CO',
    attendanceStatus: 'interested',
    connectionStatus: 'none',
    mutualConnections: 2,
    interests: ['Audio Advertising', 'Podcast Advertising', 'Local Marketing'],
    experience: '6+ years'
  }
]

export default function AttendeesSection({ eventId, attendees = mockAttendees, currentUserId, onConnect, onMessage }: AttendeesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const filters = [
    { value: 'all', label: 'All Attendees' },
    { value: 'attending', label: 'Attending' },
    { value: 'registered', label: 'Registered' },
    { value: 'planning', label: 'Planning' },
    { value: 'connected', label: 'Connected' },
    { value: 'not_connected', label: 'Not Connected' }
  ]

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'company', label: 'Company' },
    { value: 'mutual_connections', label: 'Mutual Connections' },
    { value: 'industry', label: 'Industry' }
  ]

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || 
                         selectedFilter === attendee.attendanceStatus ||
                         (selectedFilter === 'connected' && attendee.connectionStatus === 'connected') ||
                         (selectedFilter === 'not_connected' && attendee.connectionStatus !== 'connected')
    
    return matchesSearch && matchesFilter
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'company':
        return a.company.localeCompare(b.company)
      case 'mutual_connections':
        return (b.mutualConnections || 0) - (a.mutualConnections || 0)
      case 'industry':
        return a.industry.localeCompare(b.industry)
      default:
        return 0
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attending': return 'bg-green-100 text-green-800'
      case 'registered': return 'bg-blue-100 text-blue-800'
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'interested': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'none': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleConnect = async (attendeeId: string) => {
    try {
      // TODO: Implement API call to send connection request
      // const response = await fetch(`/api/events/${eventId}/attendees/${attendeeId}/connect`, {
      //   method: 'POST'
      // })
      
      console.log('Connecting to attendee:', attendeeId)
      onConnect?.(attendeeId)
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  const handleMessage = async (attendeeId: string) => {
    try {
      // TODO: Implement messaging functionality
      console.log('Messaging attendee:', attendeeId)
      onMessage?.(attendeeId)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            DealMecca Users Attending
          </h2>
          <p className="text-gray-600">
            Connect with {filteredAttendees.length} other professionals attending this event
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <User className="w-4 h-4 mr-1" />
            {attendees.length} Total
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <BadgeIcon className="w-4 h-4 mr-1" />
            {attendees.filter(a => a.connectionStatus === 'connected').length} Connected
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search attendees by name, company, or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {filters.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAttendees.map(attendee => (
          <div key={attendee.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Profile Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {attendee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{attendee.name}</h3>
                  <p className="text-sm text-gray-600">{attendee.title}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Badge className={`text-xs ${getStatusColor(attendee.attendanceStatus)}`}>
                  {attendee.attendanceStatus}
                </Badge>
                {attendee.connectionStatus && attendee.connectionStatus !== 'none' && (
                  <Badge className={`text-xs ${getConnectionStatusColor(attendee.connectionStatus)}`}>
                    {attendee.connectionStatus}
                  </Badge>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <Building className="w-4 h-4 mr-2" />
                <span>{attendee.company}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{attendee.location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>{attendee.industry} • {attendee.experience}</span>
              </div>
            </div>

            {/* Mutual Connections */}
            {attendee.mutualConnections && attendee.mutualConnections > 0 && (
              <div className="flex items-center text-sm text-blue-600 mb-3">
                <UserPlus className="w-4 h-4 mr-2" />
                <span>{attendee.mutualConnections} mutual connections</span>
              </div>
            )}

            {/* Interests */}
            {attendee.interests && attendee.interests.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {attendee.interests.slice(0, 3).map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {attendee.interests.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{attendee.interests.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t">
              {attendee.connectionStatus === 'connected' ? (
                <Button
                  onClick={() => handleMessage(attendee.id)}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              ) : attendee.connectionStatus === 'pending' ? (
                <Button size="sm" variant="outline" disabled className="flex-1">
                  <Clock className="w-4 h-4 mr-2" />
                  Pending
                </Button>
              ) : (
                <Button
                  onClick={() => handleConnect(attendee.id)}
                  size="sm"
                  className="flex-1"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              )}
              <Button size="sm" variant="outline">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAttendees.length === 0 && (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No attendees found matching your criteria</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Networking Tips */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          🤝 Networking Tips for This Event
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Connect with attendees before the event to plan meetups</li>
          <li>• Look for professionals with mutual connections for warm introductions</li>
          <li>• Join industry-specific discussions and share insights</li>
          <li>• Follow up within 48 hours after the event</li>
        </ul>
      </div>
    </div>
  )
} 