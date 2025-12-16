'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  Handshake,
  Lightbulb,
  Building,
  TrendingUp,
  RefreshCw,
  Filter,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

interface Activity {
  id: string;
  type: 'NEW_CONTACT' | 'NEW_PARTNERSHIP' | 'NEW_INSIGHT' | 'COMPANY_UPDATE' | 'COMPANY_FOLLOWED';
  title: string;
  description: string;
  metadata: any;
  actionUrl: string;
  createdAt: string;
  icon: string;
}

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export function ActivityFeed({ limit = 20, showHeader = true, compact = false }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [filter, limit]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(filter && { type: filter })
      });

      const response = await fetch(`/api/activity-feed?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
        setHasMore(data.hasMore || false);
      }
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'user-plus':
        return <UserPlus className="h-5 w-5" />;
      case 'handshake':
        return <Handshake className="h-5 w-5" />;
      case 'lightbulb':
        return <Lightbulb className="h-5 w-5" />;
      case 'building':
        return <Building className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'NEW_CONTACT':
        return 'bg-blue-50 text-blue-600';
      case 'NEW_PARTNERSHIP':
        return 'bg-purple-50 text-purple-600';
      case 'NEW_INSIGHT':
        return 'bg-yellow-50 text-yellow-600';
      case 'COMPANY_UPDATE':
        return 'bg-green-50 text-green-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && activities.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Activity Feed
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Activity Feed
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchActivities}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <select
                value={filter || ''}
                onChange={(e) => setFilter(e.target.value || null)}
                className="text-sm border border-border rounded-md px-2 py-1"
              >
                <option value="">All Activities</option>
                <option value="NEW_CONTACT">New Contacts</option>
                <option value="NEW_PARTNERSHIP">Partnerships</option>
                <option value="NEW_INSIGHT">Insights</option>
                <option value="COMPANY_UPDATE">Updates</option>
              </select>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={compact ? 'p-3' : ''}>
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-foreground font-medium">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-1">
              Follow companies to see their latest updates here
            </p>
            <Link href="/organizations">
              <Button className="mt-4">
                Explore Companies
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={activity.actionUrl}
                className="block group"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(activity.type)}`}>
                    {getIcon(activity.icon)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                        {activity.title}
                      </p>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {formatTimeAgo(activity.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {activity.description}
                    </p>

                    {/* Metadata badges */}
                    {activity.metadata && (
                      <div className="flex items-center space-x-2">
                        {activity.metadata.companyName && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.metadata.companyName}
                          </Badge>
                        )}
                        {activity.metadata.contactTitle && (
                          <Badge variant="outline" className="text-xs">
                            {activity.metadata.contactTitle}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Implement load more functionality
                  }}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
