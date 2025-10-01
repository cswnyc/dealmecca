'use client';

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/lib/auth/firebase-auth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ForumLayout } from '@/components/layout/ForumLayout';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import {
  BookmarkIcon,
  EmptyBookmarkIcon
} from '@heroicons/react/24/outline';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  isAnonymous: boolean;
  anonymousHandle?: string;
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
    color: string;
  };
}

export default function SavedPostsPage() {
  const { user: firebaseUser, loading: authLoading } = useFirebaseAuth();
  const [savedPosts, setSavedPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (firebaseUser && !authLoading) {
      fetchSavedPosts();
    }
  }, [firebaseUser, authLoading]);

  const fetchSavedPosts = async () => {
    if (!firebaseUser) return;

    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch('/api/users/bookmarks', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedPosts(data.bookmarks || []);
      } else {
        setError('Failed to load saved posts');
      }
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      setError('Failed to load saved posts');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (postId: string) => {
    setSavedPosts(prev => prev.filter(post => post.id !== postId));
  };

  if (authLoading || loading) {
    return (
      <ForumLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ForumLayout>
    );
  }

  return (
    <AuthGuard>
      <ForumLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center space-x-3 mb-6">
            <BookmarkIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Saved Posts</h1>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {savedPosts.length}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {savedPosts.length === 0 ? (
            <div className="text-center py-12">
              <EmptyBookmarkIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved posts yet</h3>
              <p className="text-gray-600 mb-6">
                Save interesting posts to easily find them later.
              </p>
              <button
                onClick={() => window.location.href = '/forum'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Forum
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {savedPosts.map(post => (
                <ForumPostCard
                  key={post.id}
                  post={post}
                  onBookmark={handleRemoveBookmark}
                />
              ))}
            </div>
          )}
        </div>
      </ForumLayout>
    </AuthGuard>
  );
}