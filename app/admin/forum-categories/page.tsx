'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { authedFetch } from '@/lib/authedFetch';

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  icon: string;
  order: number;
  isActive: boolean;
  _count: {
    ForumPost: number;
  };
}

export default function ForumCategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    color: '#3b82f6',
    icon: '📁',
    order: 0,
    isActive: true
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    description: '',
    slug: '',
    color: '#3b82f6',
    icon: '📁',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await authedFetch('/api/admin/forum/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authedFetch('/api/admin/forum/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          slug: '',
          color: '#3b82f6',
          icon: '📁',
          order: 0,
          isActive: true
        });
        fetchCategories();
      } else {
        alert('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category');
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditFormData({
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      color: category.color,
      icon: category.icon,
      order: category.order,
      isActive: category.isActive
    });
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { id, ...updates } = editFormData;
      const response = await authedFetch(`/api/admin/forum/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setShowEditForm(false);
        setEditFormData({
          id: '',
          name: '',
          description: '',
          slug: '',
          color: '#3b82f6',
          icon: '📁',
          order: 0,
          isActive: true
        });
        fetchCategories();
      } else {
        alert('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Category>) => {
    try {
      const response = await authedFetch(`/api/admin/forum/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchCategories();
        setEditingId(null);
      } else {
        alert('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await authedFetch(`/api/admin/forum/categories/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCategories();
      } else {
        alert('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Forum Categories</h1>
            <p className="text-muted-foreground mt-1">Manage discussion categories and topics</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && !showEditForm && (
          <div className="bg-white rounded-lg border border-border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New Category</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-muted-foreground hover:text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: generateSlug(e.target.value)
                      });
                    }}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    autoComplete="off"
                    data-form-type="other"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    autoComplete="off"
                    data-form-type="other"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    autoComplete="off"
                    data-form-type="other"
                    placeholder="📁"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 px-3 py-2 border border-input rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                  autoComplete="off"
                  data-form-type="other"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-input text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-input rounded-lg text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Form */}
        {showEditForm && (
          <div className="bg-white rounded-lg border border-border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Category</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditFormData({
                    id: '',
                    name: '',
                    description: '',
                    slug: '',
                    color: '#3b82f6',
                    icon: '📁',
                    order: 0,
                    isActive: true
                  });
                }}
                className="text-muted-foreground hover:text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        name: e.target.value,
                        slug: generateSlug(e.target.value)
                      });
                    }}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    autoComplete="off"
                    data-form-type="other"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={editFormData.slug}
                    onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    autoComplete="off"
                    data-form-type="other"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={editFormData.icon}
                    onChange={(e) => setEditFormData({ ...editFormData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                    autoComplete="off"
                    data-form-type="other"
                    placeholder="📁"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={editFormData.color}
                    onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                    className="w-full h-10 px-3 py-2 border border-input rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-foreground"
                  autoComplete="off"
                  data-form-type="other"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="rounded border-input text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditFormData({
                      id: '',
                      name: '',
                      description: '',
                      slug: '',
                      color: '#3b82f6',
                      icon: '📁',
                      order: 0,
                      isActive: true
                    });
                  }}
                  className="px-4 py-2 border border-input rounded-lg text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Posts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-muted">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <div className="font-medium text-foreground">{category.name}</div>
                          <div className="text-sm text-muted-foreground">{category.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">{category._count.ForumPost}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleUpdate(category.id, { isActive: !category.isActive })}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleStartEdit(category)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories yet. Create your first category to get started.</p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <a
            href="/admin"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
