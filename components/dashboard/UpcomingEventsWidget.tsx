'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  TrendingUp,
  Plane,
  DollarSign,
  Star,
  Target,
  ArrowRight,
  AlertCircle,
  AlertTriangle
} from 'lucide-react'

interface UpcomingEvent {
  id: string
  name: string
  location: string
  venue: string
  startDate: string
  endDate: string
  category: string
  industry: string
  isVirtual: boolean
  isHybrid: boolean
  estimatedCost: number
  attendanceStatus: 'INTERESTED' | 'PLANNING_TO_ATTEND' | 'REGISTERED' | 'ATTENDING'
  expectedAttendees: number
  avgRating: number
  userExpectedConnections?: number
  userNetworkingGoals?: string[]
  preparationTasks?: Array<{
    id: string
    task: string
    completed: boolean
    dueDate: string
  }>
}

interface UpcomingEventsWidgetProps {
  userId: string
  maxEvents?: number
  onEventClick?: (eventId: string) => void
}

export default function UpcomingEventsWidget({ 
  userId, 
  maxEvents = 3, 
  onEventClick 
}: UpcomingEventsWidgetProps) {
  const [events, setEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUpcomingEvents()
    
    // Set up interval to update countdown timers
    const interval = setInterval(() => {
      // Trigger re-render to update countdown timers
      setEvents(prevEvents => [...prevEvents])
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [userId])

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/upcoming-events?limit=${maxEvents}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming events')
      }
      
      const data = await response.json()
      // Extract events array from API response
      setEvents(Array.isArray(data.events) ? data.events : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load upcoming events')
    } finally {
      setLoading(false)
    }
  }

  const formatCountdown = (eventDate: string) => {
    const now = new Date()
    const event = new Date(eventDate)
    const diffMs = event.getTime() - now.getTime()
    
    if (diffMs <= 0) {
      return { text: 'Event started', color: 'text-green-600', urgent: false }
    }
    
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 1) {
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
      return { 
        text: `${diffHours}h remaining`, 
        color: 'text-red-700 font-semibold',
        urgent: true
      }
    } else if (diffDays <= 7) {
      return { 
        text: `${diffDays} days`, 
        color: 'text-orange-600',
        urgent: diffDays <= 3
      }
    } else if (diffDays <= 30) {
      return {
        text: `${diffDays} days`,
        color: 'text-primary',
        urgent: false
      }
    } else {
      const diffWeeks = Math.ceil(diffDays / 7)
      return {
        text: `${diffWeeks} weeks`,
        color: 'text-muted-foreground',
        urgent: false
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INTERESTED':
        return <Badge variant="outline" className="bg-primary/10 text-primary">Interested</Badge>
      case 'PLANNING_TO_ATTEND':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Planning</Badge>
      case 'REGISTERED':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Registered</Badge>
      case 'ATTENDING':
        return <Badge className="bg-green-600 text-white">Attending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getUrgentTasks = (event: UpcomingEvent) => {
    if (!event.preparationTasks) return []
    
    const now = new Date()
    const eventDate = new Date(event.startDate)
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return event.preparationTasks.filter(task => {
      if (task.completed) return false
      const taskDue = new Date(task.dueDate)
      const daysUntilDue = Math.ceil((taskDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDue <= 3 // Tasks due within 3 days
    })
  }

  const handleEventClick = (eventId: string) => {
    if (onEventClick) {
      onEventClick(eventId)
    } else {
      router.push(`/events/${eventId}`)
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(maxEvents)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">Error loading upcoming events: {error}</p>
          <Button onClick={fetchUpcomingEvents} className="mt-2" variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>Your next industry events and conferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground mb-2">No upcoming events</p>
            <p className="text-sm text-muted-foreground mb-4">
              Explore industry events to expand your network and grow your business
            </p>
            <Button onClick={() => router.push('/events')} variant="outline">
              Browse Events
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Events
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/events')}
            className="text-primary hover:text-primary/80"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardTitle>
        <CardDescription>Your next {events.length} events with countdown timers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => {
          const countdown = formatCountdown(event.startDate)
          const urgentTasks = getUrgentTasks(event)
          
          return (
            <div
              key={event.id}
              className="border rounded-lg p-4 hover:bg-muted transition-colors cursor-pointer"
              onClick={() => handleEventClick(event.id)}
            >
              {/* Event Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                    {event.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{event.isVirtual ? 'Virtual' : event.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{event.expectedAttendees.toLocaleString()} attendees</span>
                    </div>
                    {event.avgRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{event.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`font-semibold ${countdown.color}`}>
                    <Clock className="w-4 h-4 inline mr-1" />
                    {countdown.text}
                  </div>
                  {getStatusBadge(event.attendanceStatus)}
                </div>
              </div>

              {/* Event Details */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="outline" className="bg-accent/10 text-accent-foreground">
                    {event.category.replace('_', ' ')}
                  </Badge>
                  {event.isHybrid && (
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Hybrid
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="w-3 h-3" />
                    <span>${event.estimatedCost.toLocaleString()}</span>
                  </div>
                </div>

                {event.userExpectedConnections && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Target className="w-3 h-3" />
                    <span>Goal: {event.userExpectedConnections} connections</span>
                  </div>
                )}
              </div>

              {/* Urgent Tasks Alert */}
              {urgentTasks.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-orange-700 text-sm font-medium mb-2">
                    <AlertCircle className="w-4 h-4" />
                    {urgentTasks.length} urgent preparation task{urgentTasks.length > 1 ? 's' : ''}
                  </div>
                  <ul className="text-sm text-orange-600 space-y-1">
                    {urgentTasks.slice(0, 2).map((task) => (
                      <li key={task.id} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-orange-500 rounded-full" />
                        {task.task}
                      </li>
                    ))}
                    {urgentTasks.length > 2 && (
                      <li className="text-xs">+{urgentTasks.length - 2} more tasks</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Networking Goals */}
              {event.userNetworkingGoals && event.userNetworkingGoals.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Networking goals: </span>
                  <span className="text-foreground">
                    {event.userNetworkingGoals.slice(0, 2).join(', ')}
                    {event.userNetworkingGoals.length > 2 && '...'}
                  </span>
                </div>
              )}
            </div>
          )
        })}

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/events')}
              className="flex-1"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Browse More Events
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/goals')}
              className="flex-1"
            >
              <Target className="w-4 h-4 mr-2" />
              Set Goals
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 