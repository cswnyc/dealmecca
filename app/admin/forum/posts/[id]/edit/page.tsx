'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import MentionEditor from '@/components/ui/MentionEditor';
import MentionText from '@/components/ui/MentionText';
import CommentEditor from '@/components/admin/CommentEditor';

interface Author {
  id: string;
  name: string;
  email: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: string;
  authorId: string;
  categoryId: string;
  upvotes: number;
  downvotes: number;
  views: number;
  isFeatured: boolean;
  isLocked: boolean;
  isPinned: boolean;
  isAnonymous: boolean;
  anonymousHandle?: string;
  tags: string[];
  urgency?: string;
  dealSize?: string;
  location?: string;
  mediaType?: string;
  bookmarks: number;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  author: Author;
  category: Category;
  _count: {
    comments: number;
  };
}

export default function EditForumPost() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<ForumPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    content: '',
    categoryId: '',
    tags: [] as string[],
    isFeatured: false,
    isPinned: false,
    isLocked: false,
    isAnonymous: false,
    anonymousHandle: '',
    location: '',
    status: 'PENDING'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch post, categories, and comments in parallel
        const [postResponse, categoriesResponse, commentsResponse] = await Promise.all([
          fetch(`/api/admin/forum/posts/${postId}`),
          fetch('/api/forum/categories'),
          fetch(`/api/admin/forum/posts/${postId}/comments`)
        ]);

        if (!postResponse.ok) {
          throw new Error('Failed to fetch post');
        }

        const postData = await postResponse.json();
        const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : [];
        const commentsData = commentsResponse.ok ? await commentsResponse.json() : { comments: [] };

        setPost(postData);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setComments(commentsData.comments || []);

        // Populate form with existing data
        setFormData({
          content: postData.content || '',
          categoryId: postData.categoryId || '',
          tags: postData.tags || [],
          isFeatured: postData.isFeatured || false,
          isPinned: postData.isPinned || false,
          isLocked: postData.isLocked || false,
          isAnonymous: postData.isAnonymous || false,
          anonymousHandle: postData.anonymousHandle || '',
          location: postData.location || '',
          status: postData.status || 'PENDING'
        });

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load post data');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchData();
    }
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await fetch(`/api/admin/forum/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      router.push('/admin/forum/posts');

    } catch (err) {
      console.error('Error updating post:', err);
      setError(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/admin/forum/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }

      router.push('/admin/forum/posts');

    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-4">The forum post you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/forum/posts')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Edit Forum Post</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/admin/forum/posts')}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Delete Post
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <MentionEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                placeholder="Enter post content... (use @ to mention companies, contacts, categories, and users)"
                multiline={true}
                className="min-h-[200px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            {formData.isAnonymous && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anonymous Handle
                </label>
                <input
                  type="text"
                  value={formData.anonymousHandle}
                  onChange={(e) => setFormData({ ...formData, anonymousHandle: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Anonymous user handle"
                />
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="DRAFT">Draft</option>
              </select>
              {formData.status === 'APPROVED' && (
                <p className="mt-2 text-sm text-green-600">
                  ✅ This post will be visible in the public forum
                </p>
              )}
              {formData.status === 'PENDING' && (
                <p className="mt-2 text-sm text-yellow-600">
                  ⏳ This post is waiting for admin approval
                </p>
              )}
              {formData.status === 'REJECTED' && (
                <p className="mt-2 text-sm text-red-600">
                  ❌ This post will not be visible in the public forum
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Featured</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Pinned</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isLocked}
                  onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Locked</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Anonymous</span>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/admin/forum/posts')}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {post && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Post Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Author:</span>
              <p className="text-gray-600">{post.author?.name || 'Unknown'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Views:</span>
              <p className="text-gray-600">{post.views}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Comments:</span>
              <p className="text-gray-600">{post._count.comments}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Votes:</span>
              <p className="text-gray-600">{post.upvotes - post.downvotes}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <p className="text-gray-600">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Updated:</span>
              <p className="text-gray-600">{new Date(post.updatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Slug:</span>
              <p className="text-gray-600 font-mono">{post.slug}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Comments ({comments.length})
            </h3>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showComments ? 'Hide Comments' : 'Show Comments'}
            </button>
          </div>
        </div>

        {showComments && (
          <div className="p-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No comments yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentEditor
                    key={comment.id}
                    comment={comment}
                    onUpdate={(updatedComment) => {
                      setComments(comments.map(c =>
                        c.id === updatedComment.id ? updatedComment : c
                      ));
                    }}
                    onDelete={(commentId) => {
                      setComments(comments.filter(c => c.id !== commentId));
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}