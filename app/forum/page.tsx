'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirebaseAuth } from '@/lib/auth/firebase-auth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { SmartPostForm } from '@/components/forum/SmartPostForm';
import { IntelligenceSharing } from '@/components/forum/IntelligenceSharing';
import { ForumSidebar } from '@/components/forum/ForumSidebar';
import { GlobalSearchInput } from '@/components/navigation/GlobalSearchInput';
import { PageFrame, PageHeader, PageContent, PageCard } from '@/components/layout/PageFrame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import {
  Search,
  ChevronDown,
  MessageSquare,
  BarChart3,
  Globe,
  User,
  Users,
  Target,
  Gift,
  Crown,
  X
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
  primaryTopicType?: string;
  primaryTopicId?: string;
  primaryTopic?: {
    id: string;
    name: string;
    type: string;
    logoUrl?: string;
    verified?: boolean;
    description?: string;
  };
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

// Force dynamic rendering for user-specific content
export const dynamic = 'force-dynamic';

export default function ForumPage() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('company');
  const eventId = searchParams.get('event');
  const topicFilter = searchParams.get('topic');
  const categoryFilter = searchParams.get('category');
  const highlightPostId = searchParams.get('post'); // Post to highlight from notification

  const { user: firebaseUser, loading: authLoading } = useFirebaseAuth();

  // Check Firebase session
  const hasFirebaseSession = Boolean(firebaseUser);

  // Check LinkedIn session as fallback
  const hasLinkedInSession = typeof window !== 'undefined' && localStorage.getItem('linkedin-session');
  
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
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [postType, setPostType] = useState<'post' | 'poll'>('post');

  useEffect(() => {
    fetchCategories();
  }, []);

  // Initialize state from URL parameters
  useEffect(() => {
    if (categoryFilter && categories.length > 0) {
      // Find category by slug and set its ID
      const category = categories.find(cat => cat.slug === categoryFilter);
      if (category) {
        setSelectedCategory(category.id);
      }
    }
  }, [categoryFilter, categories]);

  // Track highlighted post for notification
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);

  // Scroll to and highlight post from notification
  useEffect(() => {
    if (highlightPostId && posts.length > 0 && !loading) {
      // Wait for DOM to be fully rendered
      setTimeout(() => {
        const postElement = document.getElementById(`post-${highlightPostId}`);
        if (postElement) {
          // Scroll to the post with smooth behavior
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Add highlight via state
          setHighlightedPostId(highlightPostId);

          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedPostId(null);
          }, 3000);
        }
      }, 100);
    }
  }, [highlightPostId, posts, loading]);

  useEffect(() => {
    fetchPosts();
  }, [companyId, eventId, topicFilter, categoryFilter, activeTab, selectedCategory, sortBy, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories');
      const data = await response.json();
      // Ensure we always set an array, even if API fails
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.warn('Categories API returned non-array data:', data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Set empty array on error
      setCategories([]);
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

      if (topicFilter) {
        params.append('topic', topicFilter);
      }

      if (categoryFilter) {
        params.append('category', categoryFilter);
      }

      // Add filtering parameters
      if (activeTab === 'my' && firebaseUser?.uid) {
        params.append('authorId', firebaseUser.uid);
      }
      
      if (selectedCategory && selectedCategory !== '') {
        // Find the category slug from the ID
        const category = categories.find(cat => cat.id === selectedCategory);
        if (category) {
          params.append('category', category.slug);
        }
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
      <AuthGuard>
        <PageFrame maxWidth="6xl">
          <div className="space-y-6">
            {/* Skeleton for header */}
            <div className="space-y-2">
              <div className="h-8 bg-muted-foreground/20 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-muted-foreground/20 rounded w-96 animate-pulse"></div>
            </div>

            {/* Skeleton for tabs */}
            <div className="flex space-x-4">
              <div className="h-10 bg-muted-foreground/20 rounded-lg w-24 animate-pulse"></div>
              <div className="h-10 bg-muted-foreground/20 rounded-lg w-24 animate-pulse"></div>
            </div>

            {/* Skeleton for category pills */}
            <div className="flex space-x-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-muted-foreground/20 rounded-full w-20 animate-pulse"></div>
              ))}
            </div>

            {/* Skeleton for posts */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <PageCard key={i}>
                  <div className="p-6 animate-pulse">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-muted-foreground/20 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted-foreground/20 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-muted-foreground/20 rounded w-48"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-muted-foreground/20 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-2/3"></div>
                  </div>
                </PageCard>
              ))}
            </div>
          </div>
        </PageFrame>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageFrame maxWidth="6xl">
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <Logo size="xl" iconOnly={true} animated={true} />
              </div>
              <span>Community Forum</span>
            </div>
          }
          description="Connect and share insights with media sellers. Ask questions, share intel, and build relationships."
          actions={
            <GlobalSearchInput
              className="w-full lg:w-96"
              placeholder="Search companies, teams, contacts..."
              size="md"
            />
          }
        />

        <PageContent>
          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as 'all' | 'my')}>
            <TabsList className="mb-8 bg-muted/60">
              <TabsTrigger value="all" className="flex items-center space-x-2 rounded-md">
                <Globe className="w-4 h-4" />
                <span>All Posts</span>
              </TabsTrigger>
              <TabsTrigger value="my" className="flex items-center space-x-2 rounded-md">
                <User className="w-4 h-4" />
                <span>My Posts</span>
              </TabsTrigger>
            </TabsList>

            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-2.5 mb-8">
              <button
                onClick={() => handleCategoryChange('')}
                className={`h-9 px-4 text-sm font-medium rounded-full transition-all flex items-center ${
                  selectedCategory === ''
                    ? 'bg-gradient-brand text-white'
                    : 'bg-white dark:bg-[#0F1A2E] border border-[#E6EAF2] dark:border-[#22304A] text-[#64748B] dark:text-[#9AA7C2] hover:border-brand-primary dark:hover:border-[#5B8DFF] hover:text-brand-primary dark:hover:text-[#5B8DFF]'
                }`}
              >
                All
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  selectedCategory === ''
                    ? 'bg-white/20'
                    : 'text-[#9AA7C2]'
                }`}>
                  {pagination?.total || 0}
                </span>
              </button>

              {/* Show categories based on state */}
              {(showAllCategories ? categories : (categories || []).slice(0, 6)).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`h-9 px-4 text-sm font-medium rounded-full transition-all flex items-center ${
                    selectedCategory === category.id
                      ? 'bg-gradient-brand text-white'
                      : 'bg-white dark:bg-[#0F1A2E] border border-[#E6EAF2] dark:border-[#22304A] text-[#64748B] dark:text-[#9AA7C2] hover:border-brand-primary dark:hover:border-[#5B8DFF] hover:text-brand-primary dark:hover:text-[#5B8DFF]'
                  }`}
                >
                  {category.name}
                  <span className={`ml-2 text-xs ${
                    selectedCategory === category.id
                      ? 'bg-white/20 px-1.5 py-0.5 rounded-full'
                      : 'text-[#9AA7C2]'
                  }`}>
                    {category._count.posts}
                  </span>
                </button>
              ))}

              {(categories || []).length > 6 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="h-9 px-4 text-sm font-medium rounded-full text-[#64748B] dark:text-[#9AA7C2] hover:text-brand-primary dark:hover:text-[#5B8DFF] transition-colors"
                >
                  {showAllCategories ? 'Show less' : `+${(categories || []).length - 6} more`}
                </button>
              )}
            </div>


            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Posts Feed */}
              <div className="lg:col-span-2 space-y-4">
                {/* Create Post Section */}
                <div className="mb-4">
                  {!showCreateForm ? (
                    <div
                      onClick={() => setShowCreateForm(true)}
                      className="relative w-full text-left p-5 bg-gradient-brand-subtle border border-[#D7DEEA] dark:border-[#22304A] rounded-xl cursor-pointer hover:border-brand-primary/50 dark:hover:border-[#5B8DFF]/50 transition-all duration-200 overflow-hidden group"
                    >
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"></div>
                      <p className="relative text-[#64748B] dark:text-[#9AA7C2] font-medium">
                        Share intel, ask a question, or start a discussion...
                      </p>
                    </div>
                  ) : (
                    <PageCard>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-semibold text-foreground">What are you creating?</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowCreateForm(false)}
                            className="rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Post Type Selector */}
                        <div className="flex space-x-2 mb-6">
                          <button
                            onClick={() => setPostType('post')}
                            className={`h-9 px-4 text-sm font-medium rounded-full transition-all flex items-center ${
                              postType === 'post'
                                ? 'bg-gradient-brand text-white'
                                : 'bg-white dark:bg-[#0F1A2E] border border-[#E6EAF2] dark:border-[#22304A] text-[#64748B] dark:text-[#9AA7C2] hover:border-brand-primary dark:hover:border-[#5B8DFF] hover:text-brand-primary dark:hover:text-[#5B8DFF]'
                            }`}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Post
                          </button>
                          <button
                            onClick={() => setPostType('poll')}
                            className={`h-9 px-4 text-sm font-medium rounded-full transition-all flex items-center ${
                              postType === 'poll'
                                ? 'bg-gradient-brand text-white'
                                : 'bg-white dark:bg-[#0F1A2E] border border-[#E6EAF2] dark:border-[#22304A] text-[#64748B] dark:text-[#9AA7C2] hover:border-brand-primary dark:hover:border-[#5B8DFF] hover:text-brand-primary dark:hover:text-[#5B8DFF]'
                            }`}
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Poll
                          </button>
                        </div>

                        <SmartPostForm
                          categories={categories as any}
                          postType={postType}
                          onSuccess={() => {
                            setShowCreateForm(false);
                            fetchPosts();
                          }}
                        />
                      </div>
                    </PageCard>
                  )}
                </div>
                {posts.length === 0 ? (
                  <PageCard>
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-lg">No posts yet. Be the first to start a discussion!</p>
                      <Button
                        onClick={() => setShowCreateForm(true)}
                        className="mt-4"
                      >
                        Create First Post
                      </Button>
                    </div>
                  </PageCard>
                ) : (
                  posts.map((post) => (
                    <div 
                      key={post.id} 
                      id={`post-${post.id}`}
                      className={cn(
                        'transition-colors duration-500',
                        highlightedPostId === post.id && 'bg-primary/10 rounded-lg'
                      )}
                    >
                      <ForumPostCard
                        post={post}
                        onVote={handleVote}
                        onBookmark={handleBookmark}
                        expandable={true}
                      />
                    </div>
                  ))
                )}

                {/* Load More */}
                {pagination && pagination.pages > 1 && page < pagination.pages && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={handleLoadMore}
                      size="lg"
                    >
                      Load More Posts
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <ForumSidebar />
              </div>
            </div>
          </Tabs>
        </PageContent>
      </PageFrame>
    </AuthGuard>
  );
}

