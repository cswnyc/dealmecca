'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FireIcon, ArrowTrendingUpIcon, HashtagIcon, ChartBarIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface TrendingTag {
  tag: string;
  count: number;
  engagement: number;
  score: number;
  posts: number;
}

interface TrendingPost {
  id: string;
  title: string;
  slug: string;
  upvotes: number;
  downvotes: number;
  views: number;
  createdAt: string;
  category: {
    name: string;
    color: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    comments: number;
  };
}

interface HotCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  _count: {
    posts: number;
  };
}

interface TrendingData {
  trendingTags: TrendingTag[];
  trendingPosts: TrendingPost[];
  hotCategories: HotCategory[];
  risingPosts: TrendingPost[];
  stats: {
    totalRecentPosts: number;
    totalTags: number;
    averageEngagement: number;
  };
}

export function TrendingSidebar() {
  const [trendingData, setTrendingData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingData();
  }, []);

  const fetchTrendingData = async () => {
    try {
      const response = await fetch('/api/forum/trending');
      if (!response.ok) {
        throw new Error('Failed to fetch trending data');
      }
      const data = await response.json();
      setTrendingData(data);
    } catch (error) {
      console.error('Failed to fetch trending data:', error);
      setError('Failed to load trending content');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'bg-destructive';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-3 bg-muted/50 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
        <p className="text-destructive p-2 rounded border border-destructive/30 text-sm">{error}</p>
        <button
          onClick={fetchTrendingData}
          className="mt-2 text-destructive hover:text-destructive/80 text-sm font-medium bg-destructive/10 hover:bg-destructive/20 px-2 py-1 rounded"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!trendingData) return null;

  return (
    <div className="space-y-6">
      {/* Trending Tags */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center space-x-2 mb-4">
          <HashtagIcon className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Trending Tags</h3>
        </div>
        <div className="space-y-2">
          {trendingData.trendingTags.length > 0 ? (
            trendingData.trendingTags.map((item, index) => (
              <Link
                key={item.tag}
                href={`/forum/search?q=%23${item.tag}`}
                className="block group"
              >
                <div className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="text-sm text-primary group-hover:text-primary/80">
                      #{item.tag}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                    <span>{item.count}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No trending tags yet</p>
          )}
        </div>
      </div>

      {/* Hot Right Now */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center space-x-2 mb-4">
          <FireIcon className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-foreground">Hot Right Now</h3>
        </div>
        <div className="space-y-3">
          {trendingData.trendingPosts.length > 0 ? (
            trendingData.trendingPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/forum/posts/${post.slug}`}
                className="block group"
              >
                <div className="p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground group-hover:text-primary line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span
                          className="px-2 py-1 rounded text-white text-xs"
                          style={{ backgroundColor: post.category.color }}
                        >
                          {post.category.name}
                        </span>
                        <span>
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          👍 {post.upvotes}
                        </span>
                        <span className="flex items-center">
                          💬 {post._count.comments}
                        </span>
                        <span className="flex items-center">
                          👀 {post.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No hot posts yet</p>
          )}
        </div>
      </div>

      {/* Active Categories */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center space-x-2 mb-4">
          <ChartBarIcon className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-foreground">Active Categories</h3>
        </div>
        <div className="space-y-2">
          {trendingData.hotCategories.length > 0 ? (
            trendingData.hotCategories.map((category) => (
              <Link
                key={category.id}
                href={`/forum?category=${category.slug}`}
                className="block group"
              >
                <div className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-foreground group-hover:text-primary">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {category._count.posts} posts
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No active categories</p>
          )}
        </div>
      </div>

      {/* Rising Posts */}
      {trendingData.risingPosts.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-2 mb-4">
            <RocketLaunchIcon className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-foreground">Rising</h3>
          </div>
          <div className="space-y-3">
            {trendingData.risingPosts.map((post) => (
              <Link
                key={post.id}
                href={`/forum/posts/${post.slug}`}
                className="block group"
              >
                <div className="p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-start space-x-2">
                    <RocketLaunchIcon className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground group-hover:text-primary line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span
                          className="px-2 py-1 rounded text-white text-xs"
                          style={{ backgroundColor: post.category.color }}
                        >
                          {post.category.name}
                        </span>
                        <span>
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <span>👍 {post.upvotes}</span>
                        <span>💬 {post._count.comments}</span>
                        <span>👀 {post.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Forum Stats */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20 p-4">
        <h3 className="font-semibold text-foreground mb-3">Forum Activity</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">
              {trendingData.stats.totalRecentPosts}
            </div>
            <div className="text-xs text-muted-foreground">Posts This Week</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent-foreground">
              {trendingData.stats.totalTags}
            </div>
            <div className="text-xs text-muted-foreground">Active Tags</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-primary/20">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {Math.round(trendingData.stats.averageEngagement * 10) / 10}
            </div>
            <div className="text-xs text-muted-foreground">Avg Engagement Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for mobile
export function TrendingSidebarCompact() {
  const [trendingData, setTrendingData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingData();
  }, []);

  const fetchTrendingData = async () => {
    try {
      const response = await fetch('/api/forum/trending');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setTrendingData(data);
    } catch (error) {
      console.error('Failed to fetch trending data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !trendingData) return null;

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center space-x-4 overflow-x-auto">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <FireIcon className="w-4 h-4 text-destructive" />
          <span>Trending:</span>
        </div>
        {trendingData.trendingTags.slice(0, 3).map((tag) => (
          <Link
            key={tag.tag}
            href={`/forum/search?q=%23${tag.tag}`}
            className="flex-shrink-0 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full hover:bg-primary/30 transition-colors"
          >
            #{tag.tag}
          </Link>
        ))}
      </div>
    </div>
  );
} 