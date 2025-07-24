'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  DollarSign,
  TrendingUp,
  Share2,
  Heart,
  Globe,
  Clock,
  Building
} from 'lucide-react';
import { format } from 'date-fns';

interface EventHeaderProps {
  event: {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    venue: string;
    category: string;
    industry: string;
    isVirtual: boolean;
    isHybrid: boolean;
    websiteUrl: string;
    registrationUrl: string;
    logoUrl?: string;
    bannerUrl?: string;
    estimatedCost: number;
    _count: {
      attendees: number;
      ratings: number;
    };
  };
  currentUserAttendance?: {
    id: string;
    status: string;
    createdAt: string;
  };
  avgRatings: {
    overall: number;
    networking: number;
    content: number;
    roi: number;
  };
  avgCosts: {
    registration: number;
    travel: number;
    accommodation: number;
    total: number;
  };
  roiStats: {
    avgConnections: number;
    avgDeals: number;
    avgRevenue: number;
  };
  onAttendanceChange: (status: string) => void;
}

export default function EventHeader({ 
  event, 
  currentUserAttendance, 
  avgRatings, 
  avgCosts, 
  roiStats,
  onAttendanceChange 
}: EventHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getAttendanceStatus = () => {
    if (!currentUserAttendance) return 'none';
    return currentUserAttendance.status;
  };

  const getAttendanceButtonText = () => {
    const status = getAttendanceStatus();
    switch (status) {
      case 'none': return 'Mark as Interested';
      case 'INTERESTED': return 'Planning to Attend';
      case 'PLANNING': return 'I\'m Registered';
      case 'REGISTERED': return 'I\'m Attending';
      case 'ATTENDING': return 'Update Status';
      default: return 'Mark as Interested';
    }
  };

  const getNextAttendanceStatus = () => {
    const status = getAttendanceStatus();
    switch (status) {
      case 'none': return 'INTERESTED';
      case 'INTERESTED': return 'PLANNING';
      case 'PLANNING': return 'REGISTERED';
      case 'REGISTERED': return 'ATTENDING';
      case 'ATTENDING': return 'INTERESTED';
      default: return 'INTERESTED';
    }
  };

  const getAttendanceButtonVariant = (): "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" => {
    const status = getAttendanceStatus();
    return status === 'ATTENDING' ? 'secondary' : 'default';
  };

  const handleAttendanceClick = async () => {
    setIsLoading(true);
    try {
      await onAttendanceChange(getNextAttendanceStatus());
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: `Check out this event: ${event.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Event link copied to clipboard!');
      } catch (err) {
        console.log('Error copying to clipboard:', err);
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Info */}
          <div className="lg:col-span-2">
            {/* Event Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white">
                {event.category}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {event.industry}
              </Badge>
              {event.isVirtual && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Globe className="w-3 h-3 mr-1" />
                  Virtual
                </Badge>
              )}
              {event.isHybrid && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Building className="w-3 h-3 mr-1" />
                  Hybrid
                </Badge>
              )}
            </div>
            
            {/* Event Title */}
            <h1 className="text-4xl font-bold mb-4 leading-tight">{event.name}</h1>
            
            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start text-white/90">
                <Calendar className="w-5 h-5 mr-3 text-blue-100 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{formatDate(event.startDate)}</p>
                  <p className="text-sm text-blue-100">
                    {event.startDate !== event.endDate ? `to ${formatDate(event.endDate)}` : 'Single Day Event'}
                  </p>
                </div>
              </div>
              <div className="flex items-start text-white/90">
                <MapPin className="w-5 h-5 mr-3 text-blue-100 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{event.location}</p>
                  <p className="text-sm text-blue-100">{event.venue}</p>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center text-white">
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-lg font-semibold">{avgRatings.overall.toFixed(1)}</span>
                </div>
                <p className="text-sm text-blue-100">Overall Rating</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-blue-100 mr-1" />
                  <span className="text-lg font-semibold">{event._count.attendees}</span>
                </div>
                <p className="text-sm text-blue-100">Attendees</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-lg font-semibold">{formatCurrency(avgCosts.total)}</span>
                </div>
                <p className="text-sm text-blue-100">Avg Total Cost</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-lg font-semibold">{roiStats.avgConnections}</span>
                </div>
                <p className="text-sm text-blue-100">Avg Connections</p>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Event
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save for Later
              </Button>
              <Button
                onClick={() => window.open(event.websiteUrl, '_blank')}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Globe className="w-4 h-4 mr-2" />
                Event Website
              </Button>
            </div>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Primary Action Button */}
                  <Button
                    onClick={handleAttendanceClick}
                    disabled={isLoading}
                    variant={getAttendanceButtonVariant()}
                    className="w-full bg-white text-blue-600 hover:bg-gray-100 disabled:opacity-50"
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      getAttendanceButtonText()
                    )}
                  </Button>
                  
                  {/* Registration Button */}
                  <Button
                    onClick={() => window.open(event.registrationUrl, '_blank')}
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                  >
                    Official Registration
                  </Button>
                  
                  {/* Status Indicator */}
                  {currentUserAttendance && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        {currentUserAttendance.status.charAt(0).toUpperCase() + 
                         currentUserAttendance.status.slice(1).toLowerCase()}
                      </div>
                    </div>
                  )}
                  
                  {/* Attendee Avatars */}
                  <div className="text-center pt-4 border-t border-white/20">
                    <p className="text-sm text-blue-100 mb-3">
                      {event._count.attendees} DealMecca users interested
                    </p>
                    <div className="flex items-center justify-center space-x-1">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(5, event._count.attendees))].map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      {event._count.attendees > 5 && (
                        <span className="text-sm text-blue-100 ml-2">+{event._count.attendees - 5} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-4">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-blue-100" />
                    <span>
                      {new Date(event.startDate) > new Date() ? 'Upcoming Event' : 'Past Event'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-blue-100" />
                    <span>{event._count.attendees} people interested</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 mr-2 text-blue-100" />
                    <span>{event._count.ratings} reviews</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-blue-100" />
                    <span>Est. {formatCurrency(avgCosts.total)} total cost</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 