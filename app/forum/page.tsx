'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ForumLayout } from '@/components/forum/ForumLayout';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import PageLayout from '@/components/navigation/PageLayout';
import { Plus, MessageSquare, Search } from 'lucide-react';

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

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [companyId, eventId]);

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
      
      const response = await fetch(`/api/forum/posts?${params.toString()}`);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PageLayout
      title={companyId ? 'Company Forum Posts' : eventId ? 'Event Discussions' : 'Community Forum'}
      description={companyId || eventId ? 'Filtered content' : 'Intelligence that closes - connect with media sales professionals'}
    >
      <div className="space-y-6">

        {/* Filter info */}
        {(companyId || eventId) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              {companyId && 'Showing posts from company employees and mentions'}
              {eventId && 'Showing discussions for this specific event'}
            </p>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            posts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                onVote={handleVote}
                onBookmark={handleBookmark}
              />
            ))
          )}
        </div>

        {/* Load More */}
        {pagination && pagination.pages > 1 && page < pagination.pages && (
          <div className="flex justify-center">
            <button 
              onClick={handleLoadMore}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Load More Posts
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {pagination && pagination.total > 0 && (
          <div className="text-center text-sm text-gray-500">
            Showing {posts.length} of {pagination.total} posts
          </div>
        )}
      </div>
    </PageLayout>
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