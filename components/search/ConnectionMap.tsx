'use client'

import React, { useState } from 'react'
import { 
  Users, 
  UserCheck, 
  MessageCircle, 
  Calendar, 
  Building2, 
  Star,
  ArrowRight,
  Network,
  Phone,
  Mail,
  Linkedin,
  Coffee,
  Handshake,
  TrendingUp,
  Clock,
  MapPin,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Contact {
  id: string
  name: string
  title: string
  email?: string
  phone?: string
  isDecisionMaker: boolean
  department: string
  company: {
    id: string
    name: string
    type: string
    industry: string
  }
  linkedinUrl?: string
  profileImageUrl?: string
}

interface MutualConnection {
  contact: Contact
  relationship: 'colleague' | 'former_colleague' | 'event_connection' | 'referral' | 'social_media'
  strength: 'strong' | 'medium' | 'weak'
  lastInteraction: string
  mutualEvents?: string[]
  sharedCompanies?: string[]
  notes?: string
  canIntroduce: boolean
}

interface Event {
  id: string
  name: string
  date: string
  type: string
  location: string
  attendeeCount?: number
}

interface ConnectionMapProps {
  targetCompany: {
    id: string
    name: string
    type: string
    industry: string
    headquarters: string
    logoUrl?: string
  }
  targetContacts: Contact[]
  mutualConnections: MutualConnection[]
  sharedEvents: Event[]
  forumMentions: number
  onContactIntroduction: (contact: Contact, introduction: MutualConnection) => void
  onScheduleMeeting: (contact: Contact) => void
  onSaveConnection: (connectionId: string) => void
}

export default function ConnectionMap({
  targetCompany,
  targetContacts,
  mutualConnections,
  sharedEvents,
  forumMentions,
  onContactIntroduction,
  onScheduleMeeting,
  onSaveConnection
}: ConnectionMapProps) {
  const [activeTab, setActiveTab] = useState<'connections' | 'events' | 'forum'>('connections')
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set())

  const toggleExpanded = (connectionId: string) => {
    setExpandedConnections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(connectionId)) {
        newSet.delete(connectionId)
      } else {
        newSet.add(connectionId)
      }
      return newSet
    })
  }

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'colleague': return <Users className="w-4 h-4" />
      case 'former_colleague': return <Building2 className="w-4 h-4" />
      case 'event_connection': return <Coffee className="w-4 h-4" />
      case 'referral': return <Handshake className="w-4 h-4" />
      case 'social_media': return <Network className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'colleague': return 'bg-blue-100 text-blue-800'
      case 'former_colleague': return 'bg-purple-100 text-purple-800'
      case 'event_connection': return 'bg-green-100 text-green-800'
      case 'referral': return 'bg-orange-100 text-orange-800'
      case 'social_media': return 'bg-pink-600 text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'weak': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'strong': return '●●●'
      case 'medium': return '●●○'
      case 'weak': return '●○○'
      default: return '○○○'
    }
  }

  const getConnectionScore = (connection: MutualConnection) => {
    const strengthScore = connection.strength === 'strong' ? 3 : connection.strength === 'medium' ? 2 : 1
    const recentnessScore = new Date(connection.lastInteraction) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 2 : 1
    const decisionMakerBonus = connection.contact.isDecisionMaker ? 2 : 0
    return strengthScore + recentnessScore + decisionMakerBonus
  }

  const sortedConnections = [...mutualConnections].sort((a, b) => getConnectionScore(b) - getConnectionScore(a))

  const strongConnections = mutualConnections.filter(c => c.strength === 'strong')
  const eventConnections = mutualConnections.filter(c => c.relationship === 'event_connection')
  const decisionMakerConnections = mutualConnections.filter(c => c.contact.isDecisionMaker)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-600" />
          Connection Intelligence
        </CardTitle>
        <CardDescription>
          Leverage your network for warm introductions to {targetCompany.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Mutual Connections</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{mutualConnections.length}</div>
            <div className="text-xs text-blue-600">{strongConnections.length} strong connections</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Coffee className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Event Connections</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{eventConnections.length}</div>
            <div className="text-xs text-green-600">{sharedEvents.length} shared events</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Decision Makers</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{decisionMakerConnections.length}</div>
            <div className="text-xs text-purple-600">Key influencers</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Forum Mentions</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{forumMentions}</div>
            <div className="text-xs text-orange-600">Recent discussions</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'connections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Mutual Connections
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'events'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Shared Events
          </button>
          <button
            onClick={() => setActiveTab('forum')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'forum'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Forum Activity
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'connections' && (
          <div className="space-y-4">
            {sortedConnections.length === 0 ? (
              <div className="text-center py-8">
                <Network className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No mutual connections found</h3>
                <p className="text-muted-foreground">Try attending industry events or connecting on LinkedIn to build your network.</p>
              </div>
            ) : (
              sortedConnections.map((connection) => {
                const isExpanded = expandedConnections.has(connection.contact.id)
                const connectionScore = getConnectionScore(connection)
                
                return (
                  <Card key={connection.contact.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Profile Image */}
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                            {connection.contact.profileImageUrl ? (
                              <img
                                src={connection.contact.profileImageUrl}
                                alt={connection.contact.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          
                          {/* Connection Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground">{connection.contact.name}</h4>
                              {connection.contact.isDecisionMaker && (
                                <Badge variant="destructive" className="text-xs">
                                  Decision Maker
                                </Badge>
                              )}
                              <Badge className={`text-xs ${getStrengthColor(connection.strength)}`}>
                                {getStrengthIcon(connection.strength)} {connection.strength}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-2">
                              {connection.contact.title} at {connection.contact.company.name}
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${getRelationshipColor(connection.relationship)}`}>
                                {getRelationshipIcon(connection.relationship)}
                                <span>{connection.relationship.replace('_', ' ')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Last contact: {connection.lastInteraction}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>Score: {connectionScore}/7</span>
                              </div>
                            </div>
                            
                            {connection.mutualEvents && connection.mutualEvents.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                                <Coffee className="w-3 h-3" />
                                <span>Met at: {connection.mutualEvents.slice(0, 2).join(', ')}</span>
                                {connection.mutualEvents.length > 2 && (
                                  <span>+{connection.mutualEvents.length - 2} more</span>
                                )}
                              </div>
                            )}
                            
                            {isExpanded && (
                              <div className="border-t pt-3 mt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Contact Methods */}
                                  <div>
                                    <h5 className="font-medium text-foreground mb-2">Contact Methods</h5>
                                    <div className="space-y-1">
                                      {connection.contact.email && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Mail className="w-3 h-3" />
                                          <span>{connection.contact.email}</span>
                                        </div>
                                      )}
                                      {connection.contact.phone && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Phone className="w-3 h-3" />
                                          <span>{connection.contact.phone}</span>
                                        </div>
                                      )}
                                      {connection.contact.linkedinUrl && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Linkedin className="w-3 h-3" />
                                          <span>LinkedIn Profile</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Introduction Notes */}
                                  <div>
                                    <h5 className="font-medium text-foreground mb-2">Introduction Notes</h5>
                                    <p className="text-sm text-muted-foreground">
                                      {connection.notes || 'Consider mentioning your shared interest in media innovation and recent industry trends.'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-start gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleExpanded(connection.contact.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                          
                          {connection.canIntroduce && (
                            <Button
                              size="sm"
                              onClick={() => onContactIntroduction(connection.contact, connection)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <ArrowRight className="w-4 h-4 mr-1" />
                              Request Intro
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            {sharedEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No shared events found</h3>
                <p className="text-muted-foreground">Attend industry conferences and networking events to build connections.</p>
              </div>
            ) : (
              sharedEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{event.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                            {event.attendeeCount && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{event.attendeeCount} attendees</span>
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Connections
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'forum' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="w-8 h-8 text-orange-600" />
                  <div>
                    <h4 className="font-medium text-foreground">Forum Activity</h4>
                    <p className="text-sm text-muted-foreground">
                      {targetCompany.name} has been mentioned in {forumMentions} recent forum discussions
                    </p>
                  </div>
                </div>
                
                {forumMentions > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-foreground">Media Strategy Discussion</h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            Community members discussing {targetCompany.name}'s recent campaign performance and media mix optimization.
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          2 days ago
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-foreground">Budget Allocation Trends</h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            Industry analysis including {targetCompany.name}'s shift towards programmatic advertising.
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          5 days ago
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent forum mentions found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Section */}
        <div className="border-t pt-6 mt-6">
          <h3 className="font-medium text-foreground mb-3">Recommended Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule networking coffee
            </Button>
            <Button variant="outline" className="justify-start">
              <MessageCircle className="w-4 h-4 mr-2" />
              Send LinkedIn message
            </Button>
            <Button variant="outline" className="justify-start">
              <Coffee className="w-4 h-4 mr-2" />
              Attend shared events
            </Button>
            <Button variant="outline" className="justify-start">
              <Award className="w-4 h-4 mr-2" />
              Join industry forums
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 