'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { PageHeader } from '@/components/navigation/PageHeader';
import { SmartPostForm } from '@/components/forum/SmartPostForm';
import { 
  Search, 
  ChevronDown, 
  MessageSquare, 
  List, 
  BarChart3,
  Globe,
  User
} from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  isAnonymous: boolean;
  anonymousHandle?: string;
  tags: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dealSize?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
  location?: string;
  mediaType: string;
  views: number;
  upvotes: number;
  downvotes: number;
  bookmarks: number;
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    company?: {
      id: string;
      name: string;
      logoUrl?: string;
      verified: boolean;
      companyType?: string;
      industry?: string;
      city?: string;
      state?: string;
    };
  };
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string;
    icon: string;
    isActive: boolean;
    postCount: number;
  };
  companyMentions?: Array<{
    company: {
      id: string;
      name: string;
      logoUrl?: string;
      verified: boolean;
      companyType?: string;
    };
  }>;
  contactMentions?: Array<{
    contact: {
      id: string;
      fullName: string;
      title?: string;
      company?: {
        id: string;
        name: string;
        logoUrl?: string;
      };
    };
  }>;
  _count: {
    comments: number;
  };
  userVote?: {
    voteType: 'UPVOTE' | 'DOWNVOTE';
  };
  userBookmark?: {
    id: string;
  };
}

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  _count: {
    posts: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

function ForumContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('company');
  const eventId = searchParams.get('event');
  
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // New unified interface state
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createType, setCreateType] = useState<'post' | 'list' | 'poll'>('post');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { data: session } = useSession();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [companyId, eventId, activeTab, selectedCategory, sortBy]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories');
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchPosts = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20'
      });
      
      if (companyId) {
        params.append('company', companyId);
      }
      
      if (eventId) {
        params.append('event', eventId);
      }
      
      // Add filtering parameters
      if (activeTab === 'my' && session?.user?.id) {
        params.append('authorId', session.user.id);
      }
      
      if (selectedCategory && selectedCategory !== '') {
        params.append('categoryId', selectedCategory);
      }
      
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }
      
      if (sortBy && sortBy !== 'latest') {
        params.append('sort', sortBy);
      }
      
      // Use search API if there's a search query, otherwise use posts API
      const apiEndpoint = searchQuery.trim() ? '/api/forum/search' : '/api/forum/posts';
      const response = await fetch(`${apiEndpoint}?${params.toString()}`);
      const data = await response.json();
      setPosts(data.posts || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      });
      
      // Handle search suggestions if using search API
      if (searchQuery.trim() && data.suggestions) {
        setSearchSuggestions(data.suggestions);
      } else {
        setSearchSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, type: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`/api/forum/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: type.toUpperCase() })
      });

      if (response.ok) {
        // Refresh posts to update vote counts
        fetchPosts(page);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      const response = await fetch(`/api/forum/posts/${postId}/bookmark`, {
        method: 'POST'
      });

      if (response.ok) {
        // Refresh posts to update bookmark counts
        fetchPosts(page);
      }
    } catch (error) {
      console.error('Failed to bookmark:', error);
    }
  };

  const handleLoadMore = () => {
    if (pagination && page < pagination.pages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  const handleTabChange = (tab: 'all' | 'my') => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPosts(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Skeleton for header */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          
          {/* Skeleton for tabs */}
          <div className="flex space-x-4 mb-6">
            <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
          </div>
          
          {/* Skeleton for category pills */}
          <div className="flex space-x-2 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-full w-20 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
            ))}
          </div>
          
          {/* Skeleton for search bar */}
          <div className="h-12 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>
          
          {/* Skeleton for posts */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Community Forum"
        subtitle="Connect and share insights with media sales professionals"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Forum', href: '/forum', current: true }
        ]}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex items-center space-x-8 border-b border-gray-200 mb-6">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex items-center space-x-2 pb-4 border-b-2 font-medium transition-colors ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Globe className="w-5 h-5" />
            <span>All Posts</span>
          </button>
          <button
            onClick={() => handleTabChange('my')}
            className={`flex items-center space-x-2 pb-4 border-b-2 font-medium transition-colors ${
              activeTab === 'my'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-5 h-5" />
            <span>My Posts</span>
          </button>
        </div>

        {/* Category Filters - Compact pills */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {pagination?.total || 0}
            </span>
          </button>
          
          {/* Show categories based on state */}
          {(showAllCategories ? categories : categories.slice(0, 6)).map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name} <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {category._count.posts}
              </span>
            </button>
          ))}
          
          {categories.length > 6 && (
            <button 
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="px-3 py-1 bg-gray-100 text-blue-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              {showAllCategories ? 'Show less' : `+${categories.length - 6} more`}
            </button>
          )}
        </div>

        {/* Enhanced Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search discussions, opportunities, and insights..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2">Suggestions</div>
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Search className="w-3 h-3 inline mr-2 text-gray-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Search Results Count */}
            {searchQuery.trim() && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-gray-500">
                  {pagination?.total || 0} results
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Create Post Section */}
        <div className="mb-6">
          {!showCreateForm ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-gray-600 font-medium">What are you creating?</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCreateType('post')}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm transition-colors ${
                      createType === 'post'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Post</span>
                  </button>
                  <button
                    onClick={() => setCreateType('list')}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm transition-colors ${
                      createType === 'list'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span>List</span>
                  </button>
                  <button
                    onClick={() => setCreateType('poll')}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm transition-colors ${
                      createType === 'poll'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Poll</span>
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full text-left p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Ask a question...
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Create New {createType.charAt(0).toUpperCase() + createType.slice(1)}</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <SmartPostForm 
                categories={categories as any} 
                postType={createType}
                onSuccess={() => {
                  setShowCreateForm(false);
                  fetchPosts(); // Refresh posts after creation
                }}
              />
            </div>
          )}
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-sm border border-gray-200 rounded px-3 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="latest">Latest Posts</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
              <option value="comments">Most Comments</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Show:</span>
            <select className="text-sm border border-gray-200 rounded px-3 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>5 Categories</option>
              <option>10 Categories</option>
              <option>All Categories</option>
            </select>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500 text-lg">No posts yet. Be the first to start a discussion!</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Post
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                onVote={handleVote}
                onBookmark={handleBookmark}
                expandable={true}
              />
            ))
          )}
        </div>

        {/* Load More */}
        {pagination && pagination.pages > 1 && page < pagination.pages && (
          <div className="flex justify-center mt-8">
            <button 
              onClick={handleLoadMore}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load More Posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ForumPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <ForumContent />
    </Suspense>
  );
} 