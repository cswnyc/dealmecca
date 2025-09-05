'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  TagIcon,
  BuildingOfficeIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  BookmarkIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  authorId: string;
  isAnonymous: boolean;
  anonymousHandle?: string;
  categoryId: string;
  tags: string;
  urgency: string;
  dealSize?: string;
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
    };
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
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
}

export default function AdminForumPostsPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showTagEditor, setShowTagEditor] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/forum/posts?limit=50');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseTags = (tagsString: string): string[] => {
    if (!tagsString) return [];
    try {
      return JSON.parse(tagsString);
    } catch {
      return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
  };

  const handleSelectPost = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPosts(
      selectedPosts.length === posts.length ? [] : posts.map(post => post.id)
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPosts.length === 0) return;
    
    try {
      const response = await fetch('/api/admin/forum/posts/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          postIds: selectedPosts,
        }),
      });

      if (response.ok) {
        await fetchPosts();
        setSelectedPosts([]);
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleUpdateTags = async (postId: string, newTags: string) => {
    try {
      const response = await fetch(`/api/admin/forum/posts/${postId}/tags`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: newTags,
        }),
      });

      if (response.ok) {
        await fetchPosts();
        setShowTagEditor(null);
        setEditingTags('');
      }
    } catch (error) {
      console.error('Failed to update tags:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.name.toLowerCase().includes(query) ||
        post.author.company?.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader title="Forum Posts" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Forum Posts Management" subtitle="Manage forum posts, tags, and mentions" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search posts, authors, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="comments">Most Comments</option>
              </select>
              
              {selectedPosts.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedPosts.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkAction('pin')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Pin
                  </button>
                  <button
                    onClick={() => handleBulkAction('unpin')}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Unpin
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Forum Posts ({filteredPosts.length})
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPosts.length === posts.length && posts.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-600">Select All</label>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredPosts.map((post) => {
              const tags = parseTags(post.tags);
              
              return (
                <div key={post.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleSelectPost(post.id)}
                      className="mt-1 rounded border-gray-300 focus:ring-blue-500"
                    />
                    
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                            <Link href={`/forum/post/${post.slug}`}>
                              {post.title}
                            </Link>
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <span>by</span>
                            {!post.isAnonymous && post.author.company ? (
                              <Link 
                                href={`/orgs/companies/${post.author.company.id}`}
                                className="font-medium hover:text-blue-600 flex items-center space-x-1"
                              >
                                <span>{post.author.company.name}</span>
                                {post.author.company.verified && (
                                  <CheckBadgeIcon className="w-3 h-3 text-blue-500" />
                                )}
                              </Link>
                            ) : (
                              <span className="font-medium">
                                {post.isAnonymous ? post.anonymousHandle : post.author.name}
                              </span>
                            )}
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                            <span>•</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {post.category.name}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {post.isPinned && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Pinned
                            </span>
                          )}
                          {post.isFeatured && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Content Preview */}
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                        {post.content.substring(0, 200)}...
                      </p>
                      
                      {/* Tags and Mentions */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {/* Company Mentions */}
                          {post.companyMentions && post.companyMentions.slice(0, 3).map((mention) => (
                            <Link
                              key={mention.company.id}
                              href={`/orgs/companies/${mention.company.id}`}
                              className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100"
                            >
                              <BuildingOfficeIcon className="w-3 h-3" />
                              <span>{mention.company.name}</span>
                            </Link>
                          ))}
                          
                          {/* Contact Mentions */}
                          {post.contactMentions && post.contactMentions.slice(0, 2).map((mention) => (
                            <Link
                              key={mention.contact.id}
                              href={`/orgs/contacts/${mention.contact.id}`}
                              className="inline-flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full hover:bg-green-100"
                            >
                              <UserIcon className="w-3 h-3" />
                              <span>{mention.contact.fullName}</span>
                            </Link>
                          ))}
                          
                          {/* Tags */}
                          {tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              <TagIcon className="w-3 h-3" />
                              <span>{tag}</span>
                            </span>
                          ))}
                          
                          {/* Edit Tags Button */}
                          <button
                            onClick={() => {
                              setShowTagEditor(post.id);
                              setEditingTags(post.tags);
                            }}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200"
                          >
                            <PencilIcon className="w-3 h-3" />
                            <span>Edit Tags</span>
                          </button>
                        </div>
                        
                        {/* Tag Editor */}
                        {showTagEditor === post.id && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editingTags}
                                onChange={(e) => setEditingTags(e.target.value)}
                                placeholder="Enter tags as JSON array or comma-separated"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => handleUpdateTags(post.id, editingTags)}
                                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setShowTagEditor(null);
                                  setEditingTags('');
                                }}
                                className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <HeartIcon className="w-4 h-4" />
                          <span>{post.upvotes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          <span>{post._count.comments}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookmarkIcon className="w-4 h-4" />
                          <span>{post.bookmarks}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}