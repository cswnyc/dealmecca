'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Eye,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ActivityItem {
  id: string;
  type: 'POST' | 'COMMENT' | 'UPVOTE' | 'POLL';
  user: {
    id: string;
    name: string;
    avatarSeed: string;
    isVIP: boolean;
  };
  post: {
    id: string;
    title: string;
    category: string;
  };
  timestamp: string;
  metadata?: {
    voteCount?: number;
    commentCount?: number;
  };
}

interface CommunityActivityProps {
  limit?: number;
  compact?: boolean;
}

export function CommunityActivity({ limit = 10, compact = false }: CommunityActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchActivities();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchActivities();
    }, 30000);

    return () => clearInterval(interval);
  }, [limit]);

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/forum/activity?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Error fetching community activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'POST':
        return <MessageSquare className="h-4 w-4" />;
      case 'COMMENT':
        return <MessageSquare className="h-4 w-4" />;
      case 'UPVOTE':
        return <ThumbsUp className="h-4 w-4" />;
      case 'POLL':
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'POST':
        return 'text-primary bg-primary/10';
      case 'COMMENT':
        return 'text-purple-600 bg-purple-50';
      case 'UPVOTE':
        return 'text-green-600 bg-green-50';
      case 'POLL':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'POST':
        return 'posted';
      case 'COMMENT':
        return 'commented on';
      case 'UPVOTE':
        return 'upvoted';
      case 'POLL':
        return 'voted on poll';
      default:
        return 'interacted with';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading && activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Community Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-2 bg-muted rounded w-1/2"></div>
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-base">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Community Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchActivities}
            disabled={loading}
            className="h-7 w-7 p-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Last updated {formatTimeAgo(lastRefresh.toISOString())}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm font-medium">No recent activity</p>
            <p className="text-xs mt-1">Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={`/forum/post/${activity.post.id}`}
                className="block group"
              >
                <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  {/* Activity Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {activity.user.name}
                        </span>
                        {activity.user.isVIP && (
                          <Sparkles className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-1">
                      {getActivityText(activity)}{' '}
                      <span className="font-medium text-foreground group-hover:text-primary">
                        {activity.post.title}
                      </span>
                    </p>

                    {/* Metadata */}
                    {activity.metadata && (
                      <div className="flex items-center space-x-3 mt-1.5">
                        {activity.metadata.commentCount !== undefined && (
                          <span className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            <span>{activity.metadata.commentCount}</span>
                          </span>
                        )}
                        {activity.metadata.voteCount !== undefined && (
                          <span className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{activity.metadata.voteCount}</span>
                          </span>
                        )}
                        <Badge variant="secondary" className="text-xs h-5 px-1.5">
                          {activity.post.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activities.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <Link
              href="/forum"
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center justify-center group"
            >
              View All Activity
              <TrendingUp className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
