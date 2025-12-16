'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  ChatBubbleLeftIcon,
  EyeIcon,
  HandThumbUpIcon,
  ClockIcon,
  UserGroupIcon,
  TagIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { MentionDisplayReact } from './MentionDisplay';

interface CompanyForumActivity {
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
      id: string;
      name: string;
      logoUrl?: string;
    };
  };
  category: {
    id: string;
    name: string;
    color: string;
  };
  _count: {
    comments: number;
  };
  // Indicates why this post is related to the company
  relationshipType: 'MENTIONED' | 'EMPLOYEE_POST' | 'BOTH';
}

interface CompanyActivityFeedProps {
  companyId: string;
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export function CompanyActivityFeed({ 
  companyId, 
  limit = 10, 
  showHeader = true,
  className = ""
}: CompanyActivityFeedProps) {
  const [activities, setActivities] = useState<CompanyForumActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanyActivity();
  }, [companyId, limit]);

  const fetchCompanyActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${companyId}/forum-activity?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch company forum activity');
      }
      
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching company activity:', error);
      setError('Failed to load forum discussions');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'text-destructive bg-destructive/10';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-primary bg-primary/10';
      case 'LOW': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getRelationshipBadge = (type: string) => {
    switch (type) {
      case 'MENTIONED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
            <TagIcon className="w-3 h-3 mr-1" />
            Mentioned
          </span>
        );
      case 'EMPLOYEE_POST':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <UserGroupIcon className="w-3 h-3 mr-1" />
            Employee Post
          </span>
        );
      case 'BOTH':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent-foreground">
            <TagIcon className="w-3 h-3 mr-1" />
            Mentioned + Employee
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <h3 className="text-lg font-semibold text-foreground mb-4">Forum Discussions</h3>
        )}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
              <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-full mb-1"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <h3 className="text-lg font-semibold text-foreground mb-4">Forum Discussions</h3>
        )}
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
          <button
            onClick={fetchCompanyActivity}
            className="mt-2 text-sm text-destructive hover:text-destructive/80 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <h3 className="text-lg font-semibold text-foreground mb-4">Forum Discussions</h3>
        )}
        <div className="bg-muted border border-border rounded-lg p-6 text-center">
          <ChatBubbleLeftIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No forum discussions found for this company yet.</p>
          <Link
            href="/forum/create"
            className="mt-2 text-sm text-primary hover:text-primary/80 underline"
          >
            Start a discussion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Forum Discussions</h3>
          <Link
            href={`/forum?company=${companyId}`}
            className="text-sm text-primary hover:text-primary/80"
          >
            View all →
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-card rounded-lg border border-border p-4 hover:border-border/80 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getRelationshipBadge(activity.relationshipType)}
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: `${activity.category.color}20`, color: activity.category.color }}
                >
                  {activity.category.name}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(activity.urgency)}`}>
                  {activity.urgency}
                </span>
              </div>
              <span className="text-xs text-muted-foreground flex items-center space-x-1">
                <ClockIcon className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(activity.createdAt))} ago</span>
              </span>
            </div>

            {/* Title */}
            <Link
              href={`/forum/posts/${activity.slug}`}
              className="block hover:text-primary transition-colors"
            >
              <h4 className="font-semibold text-foreground mb-2">{activity.title}</h4>
            </Link>

            {/* Content Preview */}
            <div className="text-muted-foreground text-sm line-clamp-2 mb-3">
              <MentionDisplayReact content={activity.content} showIcons={false} />
            </div>

            {/* Author & Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">by</span>
                <span className="text-xs font-medium text-foreground">{activity.author.name}</span>
                {activity.author.company && (
                  <span className="text-xs text-muted-foreground">
                    at {activity.author.company.name}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <EyeIcon className="w-3 h-3" />
                  <span>{activity.views}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <HandThumbUpIcon className="w-3 h-3" />
                  <span>{activity.upvotes}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <ChatBubbleLeftIcon className="w-3 h-3" />
                  <span>{activity._count.comments}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length >= limit && (
        <div className="mt-4 text-center">
          <Link
            href={`/forum?company=${companyId}`}
            className="inline-flex items-center text-sm text-primary hover:text-primary/80"
          >
            <span>View all discussions</span>
            <ArrowUpIcon className="w-4 h-4 ml-1 rotate-45" />
          </Link>
        </div>
      )}
    </div>
  );
} 