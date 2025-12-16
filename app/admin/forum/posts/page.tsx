'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Building2,
  User,
  MessageCircle,
  Flag,
  CheckSquare,
  XSquare,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import MentionText from '@/components/ui/MentionText';

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
  isFeatured: boolean;
  isLocked: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    anonymousUsername?: string;
    anonymousHandle?: string;
    publicHandle?: string;
  };
  isAnonymous: boolean;
  anonymousHandle?: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  _count: {
    comments: number;
    votes: number;
    views: number;
  };
}

export default function ForumPostsAdmin() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
    flagged: 0
  });

  const router = useRouter();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter })
      });

      const response = await fetch(`/api/admin/forum/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');

      const data = await response.json();
      setPosts(data.posts || []);
      setTotalPages(data.pagination?.pages || 1);
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // For now, show some mock data to demonstrate the interface
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      // API returns array directly, not wrapped in object
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, sortBy, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPosts.length === 0) return;

    try {
      const response = await fetch('/api/admin/forum/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          postIds: selectedPosts
        })
      });

      if (response.ok) {
        alert(`${action} applied to ${selectedPosts.length} posts`);
        setSelectedPosts([]);
        fetchPosts();
      }
    } catch (error) {
      alert('Bulk action failed');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'PUBLISHED': 'bg-green-100 text-green-800',
      'DRAFT': 'bg-gray-100 text-gray-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'FLAGGED': 'bg-red-100 text-red-800'
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center">
                <MessageSquare className="w-6 h-6 mr-2" />
                Forum Posts
              </h1>
              <p className="text-muted-foreground mt-1">Manage forum posts, moderation, and community content</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/admin/forum/categories"
                className="px-4 py-2 text-foreground bg-card border border-border rounded-md hover:bg-muted"
              >
                Categories
              </Link>
              <Link
                href="/forum"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View Forum
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-primary" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center">
              <CheckSquare className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-semibold text-foreground">{stats.published}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center">
              <Edit className="w-8 h-8 text-muted-foreground" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-2xl font-semibold text-foreground">{stats.draft}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold text-foreground">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center">
              <Flag className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Flagged</p>
                <p className="text-2xl font-semibold text-foreground">{stats.flagged}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-0">
              <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">
                Search Posts
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, content, or author..."
                  className="pl-9 w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground"
              >
                <option value="">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="FLAGGED">Flagged</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
                Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-foreground mb-1">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground"
              >
                <option value="latest">Latest</option>
                <option value="popular">Popular</option>
                <option value="oldest">Oldest</option>
                <option value="most-comments">Most Comments</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Search
            </button>
          </form>
        </div>

        {/* Bulk Actions */}
        {selectedPosts.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('unpublish')}
                  className="text-xs px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Unpublish
                </button>
                <button
                  onClick={() => handleBulkAction('flag')}
                  className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Flag
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectedPosts.length === posts.length && posts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts(posts.map(p => p.id));
                        } else {
                          setSelectedPosts([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-lg font-medium">No forum posts found</p>
                      <p className="mt-1">Forum post management is being restored.</p>
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-muted">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPosts([...selectedPosts, post.id]);
                            } else {
                              setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="flex items-start space-x-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                <MentionText>{post.title}</MentionText>
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                <MentionText>{post.content?.substring(0, 100)}...</MentionText>
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            {post.author?.profileImage ? (
                              <img className="h-8 w-8 rounded-full" src={post.author.profileImage} alt="" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <User className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-foreground">
                              {post.isAnonymous
                                ? (post.anonymousHandle || 'Anonymous')
                                : (post.author?.anonymousUsername || post.author?.publicHandle || post.author?.name)}
                            </p>
                            <p className="text-sm text-muted-foreground">{post.author?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: post.category?.color + '20', color: post.category?.color }}
                        >
                          {post.category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(post.status)}`}>
                          {post.status}
                        </span>
                        {post.isFeatured && (
                          <span className="ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                        {post.isPinned && (
                          <span className="ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Pinned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {post._count?.comments || 0}
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {post._count?.views || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div>
                          <p>{new Date(post.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs">{new Date(post.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/forum?post=${post.id}`}
                            className="text-primary hover:text-primary/80"
                            target="_blank"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/forum/posts/${post.id}/edit`}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this post?')) {
                                try {
                                  const response = await fetch(`/api/admin/forum/posts/${post.id}`, {
                                    method: 'DELETE',
                                  });
                                  if (response.ok) {
                                    alert('Post deleted successfully');
                                    fetchPosts();
                                  } else {
                                    alert('Failed to delete post');
                                  }
                                } catch (error) {
                                  alert('Error deleting post');
                                }
                              }
                            }}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}