'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/navigation/PageHeader';
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, MessageSquare, Calendar } from 'lucide-react';

interface ForumComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isAnonymous: boolean;
  anonymousHandle: string | null;
  author: {
    id: string;
    name: string;
    company?: {
      id: string;
      name: string;
      logoUrl: string;
    };
  };
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    company?: {
      id: string;
      name: string;
      logoUrl: string;
      verified: boolean;
      companyType: string;
      industry: string;
      city: string;
      state: string;
    };
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  _count: {
    comments: number;
  };
  comments?: ForumComment[];
}

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  order: number;
  isActive: boolean;
  _count: {
    posts: number;
  };
  posts?: ForumPost[];
}

export default function ForumCategoriesAdmin() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loadingPosts, setLoadingPosts] = useState<Set<string>>(new Set());
  const [editingInline, setEditingInline] = useState<string | null>(null);
  const [inlineEditData, setInlineEditData] = useState<{ [key: string]: string }>({});
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [postEditData, setPostEditData] = useState<{ title: string; content: string }>({ title: '', content: '' });
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [commentEditData, setCommentEditData] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    icon: '📝',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
    
    // Check URL parameter to auto-open create form
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('create') === 'true') {
      setShowCreateForm(true);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/forum/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.sort((a: ForumCategory, b: ForumCategory) => a.order - b.order));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCategory 
        ? `/api/admin/forum/categories/${editingCategory.id}`
        : '/api/admin/forum/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchCategories();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`/api/admin/forum/categories/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleToggleActive = async (category: ForumCategory) => {
    try {
      const response = await fetch(`/api/admin/forum/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, isActive: !category.isActive })
      });

      if (response.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Failed to toggle category:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
      icon: '📝',
      order: categories.length,
      isActive: true
    });
    setShowCreateForm(false);
    setEditingCategory(null);
  };

  const startEdit = (category: ForumCategory) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      icon: category.icon,
      order: category.order,
      isActive: category.isActive
    });
    setEditingCategory(category);
    setShowCreateForm(true);
  };

  const fetchCategoryPosts = async (categoryId: string) => {
    setLoadingPosts(prev => new Set([...prev, categoryId]));
    
    try {
      const response = await fetch(`/api/forum/posts?categoryId=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(prev => prev.map(cat => 
          cat.id === categoryId ? { ...cat, posts: data.posts } : cat
        ));
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoadingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const isExpanded = expandedCategories.has(categoryId);
    
    if (isExpanded) {
      setExpandedCategories(prev => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
    } else {
      setExpandedCategories(prev => new Set([...prev, categoryId]));
      
      // Fetch posts if not already loaded
      const category = categories.find(cat => cat.id === categoryId);
      if (category && !category.posts) {
        fetchCategoryPosts(categoryId);
      }
    }
  };

  const startInlineEdit = (categoryId: string, field: string, currentValue: string) => {
    setEditingInline(`${categoryId}-${field}`);
    setInlineEditData({ [`${categoryId}-${field}`]: currentValue });
  };

  const cancelInlineEdit = () => {
    setEditingInline(null);
    setInlineEditData({});
  };

  const saveInlineEdit = async (categoryId: string, field: string) => {
    const editKey = `${categoryId}-${field}`;
    const newValue = inlineEditData[editKey];
    
    if (!newValue || newValue.trim() === '') {
      cancelInlineEdit();
      return;
    }

    try {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return;

      const updatedData = { ...category, [field]: newValue.trim() };
      
      const response = await fetch(`/api/admin/forum/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        await fetchCategories();
        cancelInlineEdit();
      } else {
        console.error('Failed to update category');
      }
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleInlineKeyPress = (e: React.KeyboardEvent, categoryId: string, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveInlineEdit(categoryId, field);
    } else if (e.key === 'Escape') {
      cancelInlineEdit();
    }
  };

  const startPostEdit = (post: ForumPost) => {
    setEditingPost(post.id);
    setPostEditData({ title: post.title, content: post.content });
  };

  const cancelPostEdit = () => {
    setEditingPost(null);
    setPostEditData({ title: '', content: '' });
  };

  const savePostEdit = async (postId: string, categoryId: string) => {
    if (!postEditData.title.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postEditData.title,
          content: postEditData.content
        })
      });

      if (response.ok) {
        // Refresh the posts for this category
        fetchCategoryPosts(categoryId);
        cancelPostEdit();
      }
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  const deletePost = async (postId: string, categoryId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Refresh the posts for this category
        fetchCategoryPosts(categoryId);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const togglePostComments = async (postId: string) => {
    const isExpanded = expandedPosts.has(postId);
    
    if (isExpanded) {
      setExpandedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } else {
      setExpandedPosts(prev => new Set([...prev, postId]));
      
      // Fetch comments if not already loaded
      const post = categories.flatMap(cat => cat.posts || []).find(p => p.id === postId);
      if (post && !post.comments) {
        await fetchPostComments(postId);
      }
    }
  };

  const fetchPostComments = async (postId: string) => {
    setLoadingComments(prev => new Set([...prev, postId]));
    
    try {
      const response = await fetch(`/api/forum/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        
        // Update the post with comments
        setCategories(prev => prev.map(cat => ({
          ...cat,
          posts: cat.posts?.map(post => 
            post.id === postId ? { ...post, comments: data.comments } : post
          )
        })));
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoadingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const startCommentEdit = (comment: ForumComment) => {
    setEditingComment(comment.id);
    setCommentEditData(comment.content);
  };

  const cancelCommentEdit = () => {
    setEditingComment(null);
    setCommentEditData('');
  };

  const saveCommentEdit = async (commentId: string, postId: string) => {
    if (!commentEditData.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/forum/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentEditData })
      });

      if (response.ok) {
        // Refresh comments for this post
        await fetchPostComments(postId);
        cancelCommentEdit();
      }
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const deleteComment = async (commentId: string, postId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/forum/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Refresh comments for this post
        await fetchPostComments(postId);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Forum Categories"
        subtitle="Manage forum categories and organization"
        customBackPath="/admin"
        customBackLabel="Back to Admin Dashboard"
        customHomePath="/admin"
        customHomeLabel="Admin Dashboard"
        breadcrumbs={[
          { label: 'Admin Dashboard', href: '/admin' },
          { label: 'Forum Categories' }
        ]}
        quickActions={[]}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="emoji or icon"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 border border-gray-200 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              
              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Categories ({categories.length})</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <ChevronRight className="w-4 h-4" />
                <span>Click arrows to expand posts</span>
              </div>
              <div className="flex items-center space-x-1">
                <Edit2 className="w-4 h-4" />
                <span>Click names/descriptions to edit inline</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>Click post counts to view posts</span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading categories...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <React.Fragment key={category.id}>
                      {/* Category Row */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleCategoryExpansion(category.id)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              {expandedCategories.has(category.id) ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                            <span className="text-lg">{category.icon}</span>
                            <div>
                              {editingInline === `${category.id}-name` ? (
                                <input
                                  type="text"
                                  value={inlineEditData[`${category.id}-name`] || ''}
                                  onChange={(e) => setInlineEditData(prev => ({
                                    ...prev,
                                    [`${category.id}-name`]: e.target.value
                                  }))}
                                  onKeyDown={(e) => handleInlineKeyPress(e, category.id, 'name')}
                                  onBlur={() => saveInlineEdit(category.id, 'name')}
                                  className="text-sm font-medium text-gray-900 bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                              ) : (
                                <div
                                  className="text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                                  onClick={() => startInlineEdit(category.id, 'name', category.name)}
                                  title="Click to edit"
                                >
                                  {category.name}
                                </div>
                              )}
                              <div className="text-sm text-gray-500">/{category.slug}</div>
                            </div>
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingInline === `${category.id}-description` ? (
                            <textarea
                              value={inlineEditData[`${category.id}-description`] || ''}
                              onChange={(e) => setInlineEditData(prev => ({
                                ...prev,
                                [`${category.id}-description`]: e.target.value
                              }))}
                              onKeyDown={(e) => handleInlineKeyPress(e, category.id, 'description')}
                              onBlur={() => saveInlineEdit(category.id, 'description')}
                              className="text-sm text-gray-700 bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs resize-none"
                              rows={2}
                              autoFocus
                            />
                          ) : (
                            <div
                              className="text-sm text-gray-700 max-w-xs cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                              onClick={() => startInlineEdit(category.id, 'description', category.description)}
                              title="Click to edit"
                            >
                              <div className="truncate">{category.description}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleCategoryExpansion(category.id)}
                            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{category._count.posts}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">{category.order}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(category)}
                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                              category.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {category.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{category.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEdit(category)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                              title="Edit category"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                              title="Delete category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Posts Row */}
                      {expandedCategories.has(category.id) && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="ml-8">
                              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                                Posts in {category.name}
                              </h4>
                              
                              {loadingPosts.has(category.id) ? (
                                <div className="flex items-center space-x-2 py-4">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                  <span className="text-sm text-gray-500">Loading posts...</span>
                                </div>
                              ) : category.posts && category.posts.length > 0 ? (
                                <div className="space-y-2">
                                  {category.posts.map((post) => (
                                    <div key={post.id} className="bg-white p-3 rounded border border-gray-200 hover:shadow-sm transition-shadow">
                                      {editingPost === post.id ? (
                                        <div className="space-y-3">
                                          <div>
                                            <input
                                              type="text"
                                              value={postEditData.title}
                                              onChange={(e) => setPostEditData({ ...postEditData, title: e.target.value })}
                                              className="w-full text-sm font-medium px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                              placeholder="Post title"
                                            />
                                          </div>
                                          <div>
                                            <textarea
                                              value={postEditData.content}
                                              onChange={(e) => setPostEditData({ ...postEditData, content: e.target.value })}
                                              className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                              rows={3}
                                              placeholder="Post content"
                                            />
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                              <span>By {post.author.name}</span>
                                              <span className="flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(post.createdAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <button
                                                onClick={() => savePostEdit(post.id, category.id)}
                                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                              >
                                                Save
                                              </button>
                                              <button
                                                onClick={cancelPostEdit}
                                                className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <h5 className="text-sm font-medium text-gray-900">{post.title}</h5>
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                              <span>By {post.author.name}</span>
                                              <span className="flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(post.createdAt).toLocaleDateString()}
                                              </span>
                                              <button 
                                                onClick={() => togglePostComments(post.id)}
                                                className="flex items-center hover:text-blue-600 cursor-pointer"
                                              >
                                                <MessageSquare className="w-3 h-3 mr-1" />
                                                {post._count.comments} replies
                                                {expandedPosts.has(post.id) ? 
                                                  <ChevronDown className="w-3 h-3 ml-1" /> : 
                                                  <ChevronRight className="w-3 h-3 ml-1" />
                                                }
                                              </button>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-1 ml-4">
                                            <button
                                              onClick={() => startPostEdit(post)}
                                              className="text-gray-400 hover:text-blue-600 p-1"
                                              title="Edit post"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => deletePost(post.id, category.id)}
                                              className="text-gray-400 hover:text-red-600 p-1"
                                              title="Delete post"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Comments Section */}
                                      {expandedPosts.has(post.id) && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                          <div className="space-y-2">
                                            <h6 className="text-xs font-medium text-gray-700 flex items-center">
                                              <MessageSquare className="w-3 h-3 mr-1" />
                                              Comments ({post._count.comments})
                                            </h6>
                                            
                                            {loadingComments.has(post.id) ? (
                                              <div className="flex items-center space-x-2 py-2">
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                                <span className="text-xs text-gray-500">Loading comments...</span>
                                              </div>
                                            ) : post.comments && post.comments.length > 0 ? (
                                              <div className="space-y-2">
                                                {post.comments.map((comment) => (
                                                  <div key={comment.id} className="bg-gray-50 p-2 rounded text-xs">
                                                    {editingComment === comment.id ? (
                                                      <div className="space-y-2">
                                                        <textarea
                                                          value={commentEditData}
                                                          onChange={(e) => setCommentEditData(e.target.value)}
                                                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-xs"
                                                          rows={2}
                                                          placeholder="Comment content"
                                                        />
                                                        <div className="flex items-center justify-between">
                                                          <span className="text-gray-500">
                                                            By {comment.isAnonymous ? comment.anonymousHandle : comment.author.name}
                                                          </span>
                                                          <div className="flex items-center space-x-1">
                                                            <button
                                                              onClick={() => saveCommentEdit(comment.id, post.id)}
                                                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                                            >
                                                              Save
                                                            </button>
                                                            <button
                                                              onClick={cancelCommentEdit}
                                                              className="text-xs bg-gray-300 text-gray-700 px-1 py-1 rounded hover:bg-gray-400"
                                                            >
                                                              Cancel
                                                            </button>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                          <p className="text-gray-700 mb-1">{comment.content}</p>
                                                          <div className="flex items-center space-x-2 text-gray-500">
                                                            <span>By {comment.isAnonymous ? comment.anonymousHandle : comment.author.name}</span>
                                                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                            {comment.updatedAt !== comment.createdAt && (
                                                              <span className="text-gray-400">(edited)</span>
                                                            )}
                                                          </div>
                                                        </div>
                                                        <div className="flex items-center space-x-1 ml-2">
                                                          <button
                                                            onClick={() => startCommentEdit(comment)}
                                                            className="text-gray-400 hover:text-blue-600 p-1"
                                                            title="Edit comment"
                                                          >
                                                            <Edit2 className="w-2 h-2" />
                                                          </button>
                                                          <button
                                                            onClick={() => deleteComment(comment.id, post.id)}
                                                            className="text-gray-400 hover:text-red-600 p-1"
                                                            title="Delete comment"
                                                          >
                                                            <Trash2 className="w-2 h-2" />
                                                          </button>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <p className="text-xs text-gray-500 py-2">No comments yet</p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-6">
                                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">No posts in this category yet</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
