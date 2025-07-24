'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SmartPostForm } from '@/components/forum/SmartPostForm';

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export default function CreatePostPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated') {
      fetchCategories();
    }
  }, [session, status, router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-32 bg-gray-200 rounded w-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 mb-4">{error}</p>
            <button
              onClick={() => {
                setError('');
                setLoading(true);
                fetchCategories();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="mt-2 text-gray-600">
            Share an opportunity, ask a question, or start a discussion with the community
          </p>
        </div>

        {/* Smart Post Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <SmartPostForm categories={categories as any} />
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Tips for Great Posts</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use clear, descriptive titles that explain what you're looking for</li>
            <li>• Include relevant details about budget, location, and timeline</li>
            <li>• Tag your post with relevant keywords to help others find it</li>
            <li>• Be specific about the type of media or services you need</li>
            <li>• Set the appropriate urgency level to help prioritize responses</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 