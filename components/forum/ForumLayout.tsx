'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FireIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import { LiveActivityFeed } from './LiveActivityFeed';
import { NotificationSettings } from './NotificationSettings';
import { SmartSearch } from './SmartSearch';
import { TrendingSidebar } from './TrendingSidebar';

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  _count: {
    posts: number;
  };
}

interface ForumLayoutProps {
  categories: ForumCategory[];
  children: React.ReactNode;
  currentCategory?: string;
  showSearch?: boolean;
  showTrending?: boolean;
}

export function ForumLayout({ 
  categories, 
  children, 
  currentCategory, 
  showSearch = true, 
  showTrending = true 
}: ForumLayoutProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('recent');

  const sortOptions = [
    { value: 'recent', label: 'Recent', icon: ClockIcon },
    { value: 'popular', label: 'Popular', icon: FireIcon },
    { value: 'trending', label: 'Trending', icon: ArrowTrendingUpIcon }
  ];

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    // Update URL with sort parameter
    const url = new URL(window.location.href);
    url.searchParams.set('sort', newSort);
    router.push(url.pathname + url.search);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Create Post Button */}
            <Link href="/forum/create">
              <button className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                <PlusIcon className="w-5 h-5" />
                <span>New Post</span>
              </button>
            </Link>

            {/* Notification Settings */}
            <NotificationSettings />

            {/* Live Activity Feed */}
            <LiveActivityFeed />

            {/* Categories */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3">Categories</h3>
              <nav className="space-y-1">
                <Link
                  href="/forum"
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    !currentCategory
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  All Posts
                </Link>
                {(categories || []).map((category) => (
                  <Link
                    key={category.id}
                    href={`/forum/category/${category.slug}`}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentCategory === category.slug
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {category.icon && <span className="text-base">{category.icon}</span>}
                        <span>{category.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {category._count.posts}
                      </span>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Sort Options */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3">Sort By</h3>
              <div className="space-y-1">
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        sortBy === option.value
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trending Content */}
            {showTrending && (
              <div className="lg:hidden">
                <TrendingSidebar />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* Smart Search */}
            {showSearch && (
              <div className="bg-card rounded-lg border border-border p-6">
                <SmartSearch
                  placeholder="Search discussions, opportunities, and insights..."
                  showFilters={true}
                />
              </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Posts Content */}
              <div className="lg:col-span-2">
                {children}
              </div>

              {/* Trending Sidebar - Desktop */}
              {showTrending && (
                <div className="hidden lg:block lg:col-span-1">
                  <TrendingSidebar />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 