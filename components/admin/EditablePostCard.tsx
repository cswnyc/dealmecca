'use client';

import { useState, useEffect } from 'react';
import { AdminMentionPicker } from './AdminMentionPicker';
import { 
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  BuildingOfficeIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface EditablePostCardProps {
  post: any;
  onUpdate: (postId: string, updates: any) => Promise<void>;
  onCancel: () => void;
}

export function EditablePostCard({ post, onUpdate, onCancel }: EditablePostCardProps) {
  // Helper function to safely parse tags
  const parseTags = (tagsString: string | null): string[] => {
    if (!tagsString) return [];
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(tagsString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // If JSON parsing fails, treat as comma-separated string
      return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
  };

  const [editData, setEditData] = useState({
    content: post.content,
    categoryId: post.category.id,
    tags: parseTags(post.tags),
    companyMentions: post.companyMentions?.map((m: any) => m.company) || [],
    contactMentions: post.contactMentions?.map((m: any) => m.contact) || [],
    isPinned: post.isPinned,
    isFeatured: post.isFeatured,
    isLocked: post.isLocked,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(post.id, {
        content: editData.content,
        categoryId: editData.categoryId,
        tags: editData.tags,
        companyMentions: editData.companyMentions,
        contactMentions: editData.contactMentions,
        isPinned: editData.isPinned,
        isFeatured: editData.isFeatured,
        isLocked: editData.isLocked,
      });
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTagChange = (tagsString: string) => {
    const tagsArray = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setEditData(prev => ({ ...prev, tags: tagsArray }));
  };

  return (
    <div className="p-6 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Editing post by</span>
          {!post.isAnonymous && post.author.company ? (
            <Link 
              href={`/orgs/companies/${post.author.company.id}`}
              className="font-medium hover:text-blue-600 flex items-center space-x-1"
            >
              <span>{post.author.company.name}</span>
            </Link>
          ) : (
            <span className="font-medium">
              {post.isAnonymous ? post.anonymousHandle : post.author.name}
            </span>
          )}
          <span>•</span>
          <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
          >
            <CheckIcon className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            onClick={onCancel}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Content Editor */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            value={editData.content}
            onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter post content..."
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={editData.categoryId}
            onChange={(e) => setEditData(prev => ({ ...prev, categoryId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <input
            type="text"
            value={editData.tags.join(', ')}
            onChange={(e) => handleTagChange(e.target.value)}
            placeholder="Enter tags separated by commas"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="mt-1 flex flex-wrap gap-1">
            {editData.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Company Mentions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Mentions</label>
          <AdminMentionPicker
            type="companies"
            selected={editData.companyMentions}
            onSelectionChange={(items) => setEditData(prev => ({ ...prev, companyMentions: items }))}
            placeholder="Search companies to mention..."
          />
        </div>

        {/* Contact Mentions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Mentions</label>
          <AdminMentionPicker
            type="contacts"
            selected={editData.contactMentions}
            onSelectionChange={(items) => setEditData(prev => ({ ...prev, contactMentions: items }))}
            placeholder="Search contacts to mention..."
          />
        </div>

        {/* Post Status Toggles */}
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={editData.isPinned}
              onChange={(e) => setEditData(prev => ({ ...prev, isPinned: e.target.checked }))}
              className="rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Pinned</span>
          </label>
          
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={editData.isFeatured}
              onChange={(e) => setEditData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              className="rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Featured</span>
          </label>
          
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={editData.isLocked}
              onChange={(e) => setEditData(prev => ({ ...prev, isLocked: e.target.checked }))}
              className="rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Locked</span>
          </label>
        </div>

        {/* Current Mentions Preview */}
        {(editData.companyMentions.length > 0 || editData.contactMentions.length > 0) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Mentions</label>
            <div className="flex flex-wrap gap-2">
              {editData.companyMentions.map((company: any) => (
                <div key={company.id} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  <BuildingOfficeIcon className="w-3 h-3" />
                  <span>{company.name}</span>
                </div>
              ))}
              
              {editData.contactMentions.map((contact: any) => (
                <div key={contact.id} className="inline-flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                  <UserIcon className="w-3 h-3" />
                  <span>{contact.fullName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}