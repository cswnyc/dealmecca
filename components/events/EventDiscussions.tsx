'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare,
  Plus,
  Eye,
  ThumbsUp,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MentionDisplayReact } from '@/components/forum/MentionDisplay';

interface EventForumPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  views: number;
  upvotes: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    company?: {
      name: string;
      logoUrl?: string;
    };
  };
  category: {
    name: string;
    color: string;
  };
  _count: {
    comments: number;
  };
}

interface EventDiscussionsProps {
  eventId: string;
  eventName: string;
  className?: string;
  showHeader?: boolean;
  limit?: number;
}

export function EventDiscussions({ 
  eventId, 
  eventName, 
  className = "",
  showHeader = true,
  limit = 10
}: EventDiscussionsProps) {
  const [discussions, setDiscussions] = useState<EventForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEventDiscussions();
  }, [eventId, limit]);

  const fetchEventDiscussions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/discussions?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch event discussions');
      }
      
      const data = await response.json();
      setDiscussions(data.discussions || []);
    } catch (error) {
      console.error('Error fetching event discussions:', error);
      setError('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'LOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUrgency = (urgency: string) => {
    return urgency.charAt(0) + urgency.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Event Discussions</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Event Discussions</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEventDiscussions}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Event Discussions</span>
              {discussions.length > 0 && (
                <Badge variant="secondary">{discussions.length}</Badge>
              )}
            </CardTitle>
            <Link href={`/forum/create?eventId=${eventId}`}>
              <Button size="sm" className="flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Start Discussion</span>
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-600">
            Community discussions about {eventName}
          </p>
        </CardHeader>
      )}
      
      <CardContent>
        {discussions.length > 0 ? (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div 
                key={discussion.id}
                className="p-4 border rounded-lg hover:border-gray-300 transition-colors bg-white"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={`text-xs ${getUrgencyColor(discussion.urgency)}`}
                    >
                      {formatUrgency(discussion.urgency)}
                    </Badge>
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: `${discussion.category.color}20`, 
                        color: discussion.category.color 
                      }}
                    >
                      {discussion.category.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(discussion.createdAt))} ago</span>
                  </span>
                </div>

                {/* Title & Content */}
                <Link 
                  href={`/forum/posts/${discussion.slug}`}
                  className="block hover:text-blue-600 transition-colors"
                >
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {discussion.title}
                  </h4>
                </Link>
                
                <div className="text-gray-600 text-sm line-clamp-2 mb-3">
                  <MentionDisplayReact content={discussion.content} showIcons={false} />
                </div>

                {/* Author & Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">by</span>
                    <div className="flex items-center space-x-1">
                      {discussion.author.company?.logoUrl ? (
                        <img 
                          src={discussion.author.company.logoUrl}
                          alt={discussion.author.company.name}
                          className="w-4 h-4 rounded-sm object-cover"
                        />
                      ) : (
                        <Users className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-xs font-medium text-gray-700">
                        {discussion.author.name}
                      </span>
                      {discussion.author.company && (
                        <span className="text-xs text-gray-500">
                          at {discussion.author.company.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{discussion.views}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{discussion.upvotes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{discussion._count.comments}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {discussions.length >= limit && (
              <div className="text-center pt-4">
                <Link href={`/forum?event=${eventId}`}>
                  <Button variant="outline" className="flex items-center space-x-1">
                    <span>View All Event Discussions</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No discussions yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Be the first to start a discussion about {eventName}
            </p>
            <Link href={`/forum/create?eventId=${eventId}`}>
              <Button className="flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Start Discussion</span>
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 