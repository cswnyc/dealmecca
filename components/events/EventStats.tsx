'use client'

import React from 'react'
import { Star, Users, DollarSign, TrendingUp, Network, MessageSquare, Target, Calendar, MapPin, Building } from 'lucide-react'

interface EventStatsProps {
  event: {
    id: string
    name: string
    location: string
    venue: string
    category: string
    industry: string
    isVirtual: boolean
    isHybrid: boolean
    startDate: string
    endDate: string
    _count: {
      attendees: number
      ratings: number
    }
  }
  avgRatings: {
    overall: number
    networking: number
    content: number
    roi: number
  }
  avgCosts: {
    registration: number
    travel: number
    accommodation: number
    total: number
  }
  roiStats: {
    avgConnections: number
    avgDeals: number
    avgRevenue: number
  }
}

export default function EventStats({ event, avgRatings, avgCosts, roiStats }: EventStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-600'
    if (rating >= 4.0) return 'text-green-600'
    if (rating >= 3.5) return 'text-yellow-600'
    if (rating >= 3.0) return 'text-orange-600'
    return 'text-red-700'
  }

  const getRatingBg = (rating: number) => {
    if (rating >= 4.5) return 'bg-emerald-50'
    if (rating >= 4.0) return 'bg-green-50'
    if (rating >= 3.5) return 'bg-yellow-50'
    if (rating >= 3.0) return 'bg-orange-50'
    return 'bg-red-50'
  }

  const getEventFormat = () => {
    if (event.isVirtual) return { label: 'Virtual', color: 'bg-accent/20 text-accent-foreground' }
    if (event.isHybrid) return { label: 'Hybrid', color: 'bg-primary/20 text-primary' }
    return { label: 'In-Person', color: 'bg-green-100 text-green-700' }
  }

  const eventFormat = getEventFormat()

  return (
    <div className="space-y-6">
      {/* Event Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#64748B] dark:text-[#9AA7C2]">Event Format</span>
            <span className={`text-xs px-2 py-1 rounded-full ${eventFormat.color}`}>
              {eventFormat.label}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-sm text-[#64748B] dark:text-[#9AA7C2]">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
            </div>
            <div className="flex items-center text-sm text-[#64748B] dark:text-[#9AA7C2]">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-sm text-[#64748B] dark:text-[#9AA7C2]">
              <Building className="w-4 h-4 mr-2" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>

        <div className="stat-card rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#2575FC]/10 dark:bg-[#5B8DFF]/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-[#2575FC] dark:text-[#5B8DFF]" />
          </div>
          <div>
            <p className="text-sm text-[#64748B] dark:text-[#9AA7C2]">Attendees</p>
            <p className="text-2xl font-bold text-[#162B54] dark:text-[#EAF0FF]">{event._count.attendees}</p>
          </div>
        </div>

        <div className="stat-card rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-[#64748B] dark:text-[#9AA7C2]">Reviews</p>
            <p className="text-2xl font-bold text-[#162B54] dark:text-[#EAF0FF]">{event._count.ratings}</p>
          </div>
        </div>
      </div>

      {/* Ratings Breakdown */}
      <div className="bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-[#162B54] dark:text-[#EAF0FF] mb-4">Ratings Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg text-center ${getRatingBg(avgRatings.overall)}`}>
            <div className="flex items-center justify-center mb-2">
              <Star className={`w-5 h-5 mr-1 ${getRatingColor(avgRatings.overall)}`} />
              <span className={`text-xl font-bold ${getRatingColor(avgRatings.overall)}`}>
                {avgRatings.overall.toFixed(1)}
              </span>
            </div>
            <div className="text-sm font-medium text-foreground">Overall</div>
            <div className="text-xs text-muted-foreground mt-1">
              {avgRatings.overall >= 4.5 ? 'Excellent' : 
               avgRatings.overall >= 4.0 ? 'Very Good' : 
               avgRatings.overall >= 3.5 ? 'Good' : 
               avgRatings.overall >= 3.0 ? 'Fair' : 'Poor'}
            </div>
          </div>

          <div className={`p-4 rounded-lg text-center ${getRatingBg(avgRatings.networking)}`}>
            <div className="flex items-center justify-center mb-2">
              <Network className={`w-5 h-5 mr-1 ${getRatingColor(avgRatings.networking)}`} />
              <span className={`text-xl font-bold ${getRatingColor(avgRatings.networking)}`}>
                {avgRatings.networking.toFixed(1)}
              </span>
            </div>
            <div className="text-sm font-medium text-foreground">Networking</div>
            <div className="text-xs text-muted-foreground mt-1">Opportunities</div>
          </div>

          <div className={`p-4 rounded-lg text-center ${getRatingBg(avgRatings.content)}`}>
            <div className="flex items-center justify-center mb-2">
              <MessageSquare className={`w-5 h-5 mr-1 ${getRatingColor(avgRatings.content)}`} />
              <span className={`text-xl font-bold ${getRatingColor(avgRatings.content)}`}>
                {avgRatings.content.toFixed(1)}
              </span>
            </div>
            <div className="text-sm font-medium text-foreground">Content</div>
            <div className="text-xs text-muted-foreground mt-1">Quality</div>
          </div>

          <div className={`p-4 rounded-lg text-center ${getRatingBg(avgRatings.roi)}`}>
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className={`w-5 h-5 mr-1 ${getRatingColor(avgRatings.roi)}`} />
              <span className={`text-xl font-bold ${getRatingColor(avgRatings.roi)}`}>
                {avgRatings.roi.toFixed(1)}
              </span>
            </div>
            <div className="text-sm font-medium text-foreground">ROI</div>
            <div className="text-xs text-muted-foreground mt-1">Value</div>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">Cost Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-3">Average Costs</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Registration</span>
                <span className="font-medium">{formatCurrency(avgCosts.registration)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Travel</span>
                <span className="font-medium">{formatCurrency(avgCosts.travel)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Accommodation</span>
                <span className="font-medium">{formatCurrency(avgCosts.accommodation)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Average</span>
                  <span className="text-lg text-primary">{formatCurrency(avgCosts.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">Cost Breakdown</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-full bg-muted rounded-full h-2 mr-3">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(avgCosts.registration / avgCosts.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground min-w-0">
                  {((avgCosts.registration / avgCosts.total) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-full bg-muted rounded-full h-2 mr-3">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(avgCosts.travel / avgCosts.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground min-w-0">
                  {((avgCosts.travel / avgCosts.total) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-full bg-muted rounded-full h-2 mr-3">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(avgCosts.accommodation / avgCosts.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground min-w-0">
                  {((avgCosts.accommodation / avgCosts.total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Statistics */}
      <div className="bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">ROI Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{formatCurrency(roiStats.avgRevenue)}</div>
            <div className="text-sm text-muted-foreground">Avg Revenue Generated</div>
            <div className="text-xs text-muted-foreground/70 mt-1">Per attendee</div>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">{roiStats.avgConnections}</div>
            <div className="text-sm text-muted-foreground">Avg New Connections</div>
            <div className="text-xs text-muted-foreground/70 mt-1">Quality contacts</div>
          </div>
          <div className="text-center p-4 bg-accent/10 rounded-lg">
            <Target className="w-8 h-8 text-accent-foreground mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent-foreground">{roiStats.avgDeals}</div>
            <div className="text-sm text-muted-foreground">Avg Deals Closed</div>
            <div className="text-xs text-muted-foreground/70 mt-1">Within 6 months</div>
          </div>
        </div>
        
        {/* ROI Calculation */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-foreground mb-2">ROI Calculation</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Investment:</span>
              <span className="font-medium ml-2">{formatCurrency(avgCosts.total)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Return:</span>
              <span className="font-medium ml-2">{formatCurrency(roiStats.avgRevenue)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ROI:</span>
              <span className={`font-bold ml-2 ${roiStats.avgRevenue > avgCosts.total ? 'text-green-600' : 'text-destructive'}`}>
                {(((roiStats.avgRevenue - avgCosts.total) / avgCosts.total) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendee Demographics */}
      <div className="bg-white dark:bg-dark-surface border border-[#E6EAF2] dark:border-dark-border p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">Attendee Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-3">Industry Focus</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{event.industry}</span>
                <span className="text-sm font-medium">Primary</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{event.category}</span>
                <span className="text-sm font-medium">Event Type</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-3">Networking Potential</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Users</span>
                <span className="text-sm font-medium">{event._count.attendees}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Connections</span>
                <span className="text-sm font-medium">{roiStats.avgConnections}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 