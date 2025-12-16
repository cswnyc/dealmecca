'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, Users, Star, DollarSign, Globe, Building, Clock } from 'lucide-react'

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
  }
}

interface EventCardProps {
  event: Event
  onAttendanceUpdate?: (eventId: string, status: string, isGoing: boolean) => void
  onViewDetails?: (eventId: string) => void
  compact?: boolean
}

export default function EventCard({ 
  event, 
  onAttendanceUpdate, 
  onViewDetails, 
  compact = false 
}: EventCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [userStatus, setUserStatus] = useState(event.userAttendance?.status || 'INTERESTED')
  const [isGoing, setIsGoing] = useState(event.userAttendance?.isGoing || false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start.toDateString() === end.toDateString()) {
      return formatDate(startDate)
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'CONFERENCE': 'bg-primary/20 text-primary',
      'TRADE_SHOW': 'bg-green-100 text-green-800',
      'SUMMIT': 'bg-accent/20 text-accent-foreground',
      'WORKSHOP': 'bg-orange-100 text-orange-800',
      'WEBINAR': 'bg-yellow-100 text-yellow-800',
      'MEETUP': 'bg-pink-600 text-white',
      'NETWORKING': 'bg-primary/20 text-primary',
      'AWARDS': 'bg-red-600 text-white',
    }
    return colors[category as keyof typeof colors] || 'bg-muted text-foreground'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'INTERESTED': 'bg-yellow-100 text-yellow-800',
      'PLANNING_TO_ATTEND': 'bg-primary/20 text-primary',
      'REGISTERED': 'bg-green-100 text-green-800',
      'ATTENDING': 'bg-green-100 text-green-800',
      'ATTENDED': 'bg-muted text-foreground',
      'CANCELLED': 'bg-destructive text-destructive-foreground'
    }
    return colors[status as keyof typeof colors] || 'bg-muted text-foreground'
  }

  const formatCost = (cost: number) => {
    if (cost === 0) return 'Free'
    if (cost < 1000) return `$${cost}`
    return `$${(cost / 1000).toFixed(1)}k`
  }

  const handleAttendanceClick = async (newStatus: string, newIsGoing: boolean) => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      if (onAttendanceUpdate) {
        await onAttendanceUpdate(event.id, newStatus, newIsGoing)
        setUserStatus(newStatus)
        setIsGoing(newIsGoing)
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const StarRating = ({ rating, size = 'sm' }: { rating: number, size?: 'sm' | 'md' }) => {
    const stars = Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-muted-foreground/40'
        }`}
      />
    ))
    return <div className="flex items-center gap-1">{stars}</div>
  }

  const eventPassed = new Date() > new Date(event.endDate)
  const eventStarted = new Date() > new Date(event.startDate)
  const eventUpcoming = new Date() < new Date(event.startDate)

  return (
    <Card className={`group hover:shadow-lg transition-shadow duration-200 ${compact ? 'h-auto' : 'h-full'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(event.category)}>
                {event.category.replace('_', ' ')}
              </Badge>
              {event.isVirtual && (
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  <Globe className="w-3 h-3 mr-1" />
                  Virtual
                </Badge>
              )}
              {event.isHybrid && (
                <Badge variant="outline" className="bg-accent/10 text-accent-foreground">
                  Hybrid
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight">
              {event.name}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              by {event.organizerName}
            </div>
          </div>
          {event.logoUrl && (
            <img 
              src={event.logoUrl} 
              alt={`${event.name} logo`}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Event Details */}
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDateRange(event.startDate, event.endDate)}</span>
            {eventPassed && (
              <Badge variant="secondary" className="text-xs">Past</Badge>
            )}
            {eventStarted && !eventPassed && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Live</Badge>
            )}
            {eventUpcoming && (
              <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">Upcoming</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
            {event.venue && (
              <span className="text-muted-foreground/60">• {event.venue}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{event.attendeeCount?.toLocaleString() || 'TBD'} attendees</span>
            {event.attendeesCount > 0 && (
              <span className="text-primary">• {event.attendeesCount} DealMecca users</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span>Est. {formatCost(event.estimatedCost)}</span>
          </div>
        </div>

        {/* Description */}
        {!compact && event.description && (
          <p className="text-sm text-foreground/80 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Industry Tags */}
        {event.industry && event.industry.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.industry.slice(0, 3).map((industry) => (
              <Badge key={industry} variant="outline" className="text-xs">
                {industry.replace('_', ' ')}
              </Badge>
            ))}
            {event.industry.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.industry.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Ratings */}
        {event.avgOverallRating && event.totalRatings > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <StarRating rating={event.avgOverallRating} />
              <span className="text-muted-foreground">
                {event.avgOverallRating.toFixed(1)} ({event.totalRatings} reviews)
              </span>
            </div>
            {!compact && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Net: {event.avgNetworkingRating?.toFixed(1) || 'N/A'}</span>
                <span>Content: {event.avgContentRating?.toFixed(1) || 'N/A'}</span>
                <span>ROI: {event.avgROIRating?.toFixed(1) || 'N/A'}</span>
              </div>
            )}
          </div>
        )}

        {/* User Status */}
        {event.userAttendance && (
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(userStatus)}>
              {userStatus.replace('_', ' ')}
            </Badge>
            {isGoing && (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Going
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 flex-col gap-2">
        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          {!eventPassed && (
            <>
              <Button
                variant={isGoing ? "default" : "outline"}
                size="sm"
                onClick={() => handleAttendanceClick('ATTENDING', !isGoing)}
                disabled={isLoading}
                className="flex-1"
              >
                {isGoing ? 'Going' : "I'm Going"}
              </Button>
              <Button
                variant={userStatus === 'INTERESTED' ? "default" : "outline"}
                size="sm"
                onClick={() => handleAttendanceClick('INTERESTED', false)}
                disabled={isLoading}
                className="flex-1"
              >
                Interested
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(event.id)}
            className={eventPassed ? 'flex-1' : ''}
          >
            View Details
          </Button>
        </div>

        {/* Registration Link */}
        {event.registrationUrl && !eventPassed && (
          <Button
            variant="link"
            size="sm"
            onClick={() => window.open(event.registrationUrl, '_blank')}
            className="text-primary hover:text-primary/80 p-0 h-auto"
          >
            Register Now →
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 