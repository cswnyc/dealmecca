'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateMetadata } from '@/lib/ai-tagging';
import { parseMentions } from '@/lib/mention-utils';
import { MentionTextarea } from './MentionTextarea';
import { TagIcon, MapPinIcon, ExclamationTriangleIcon, BuildingOfficeIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

interface SmartPostFormProps {
  categories: ForumCategory[];
}

export function SmartPostForm({ categories }: SmartPostFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: [] as string[],
    isAnonymous: false,
    urgency: 'MEDIUM',
    dealSize: '',
    location: '',
    mediaType: [] as string[],
    eventId: eventId || ''
  });

  const [eventInfo, setEventInfo] = useState<{
    id: string;
    name: string;
    startDate: string;
    location: string;
  } | null>(null);

  const [aiSuggestions, setAiSuggestions] = useState({
    tags: [] as string[],
    companies: [] as string[],
    location: '',
    mediaTypes: [] as string[],
    urgency: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    dealSize: null as string | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  // Fetch event information if eventId is present
  useEffect(() => {
    if (eventId) {
      fetch(`/api/events/${eventId}`)
        .then(res => res.json())
        .then(data => {
          if (data.event) {
            setEventInfo(data.event);
            // Pre-fill location from event if not already set
            if (!formData.location && data.event.location) {
              setFormData(prev => ({ ...prev, location: data.event.location }));
            }
          }
        })
        .catch(error => console.error('Failed to fetch event info:', error));
    }
  }, [eventId]);

  // AI-powered suggestions when title or content changes
  useEffect(() => {
    if (formData.title.length > 10 || formData.content.length > 50) {
      const suggestions = generateMetadata(formData.title, formData.content) as any;
      setAiSuggestions(suggestions);
      setShowAiSuggestions(true);
      
      // Auto-set location and urgency if detected and not already set
      if (suggestions.location && !formData.location) {
        setFormData(prev => ({ ...prev, location: suggestions.location || '' }));
      }
      
      if (suggestions.urgency && formData.urgency === 'MEDIUM') {
        setFormData(prev => ({ ...prev, urgency: suggestions.urgency }));
      }
      
      if (suggestions.dealSize && !formData.dealSize) {
        setFormData(prev => ({ ...prev, dealSize: suggestions.dealSize || '' }));
      }
      
      if (suggestions.mediaTypes.length > 0 && formData.mediaType.length === 0) {
        setFormData(prev => ({ ...prev, mediaType: suggestions.mediaTypes }));
      }
    }
  }, [formData.title, formData.content]);

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addMediaType = (mediaType: string) => {
    if (!formData.mediaType.includes(mediaType)) {
      setFormData(prev => ({
        ...prev,
        mediaType: [...prev.mediaType, mediaType]
      }));
    }
  };

  const removeMediaType = (mediaType: string) => {
    setFormData(prev => ({
      ...prev,
      mediaType: prev.mediaType.filter(m => m !== mediaType)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.categoryId) return;

    setIsSubmitting(true);
    try {
      // Parse mentions from content
      const mentions = parseMentions(formData.content);
      
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: JSON.stringify(formData.tags),
          mediaType: JSON.stringify(formData.mediaType),
          // Include mentions for backend processing
          mentions: {
            companies: mentions.companyMentions,
            contacts: mentions.contactMentions
          }
        })
      });

      if (response.ok) {
        const post = await response.json();
        router.push(`/forum/posts/${post.slug}`);
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'text-white bg-red-600';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Context */}
        {eventInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CalendarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900">
                  Creating discussion for event
                </h3>
                <p className="text-sm text-blue-700 font-medium mt-1">
                  {eventInfo.name}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                  <span>{new Date(eventInfo.startDate).toLocaleDateString()}</span>
                  {eventInfo.location && <span>{eventInfo.location}</span>}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="What's the opportunity or question?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <MentionTextarea
            value={formData.content}
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            placeholder="Share details, context, or ask your question... Use @company or @contact to mention organizations or people"
            rows={6}
          />
        </div>

        {/* AI Suggestions */}
        {showAiSuggestions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <TagIcon className="w-4 h-4 mr-2" />
              AI Smart Suggestions
            </h3>
            
            {/* Suggested Tags */}
            {aiSuggestions.tags.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-blue-700 mb-2">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Detected Companies */}
            {aiSuggestions.companies.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-blue-700 mb-2 flex items-center">
                  <BuildingOfficeIcon className="w-3 h-3 mr-1" />
                  Detected companies:
                </p>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.companies.map(company => (
                    <span
                      key={company}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                    >
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detected Media Types */}
            {aiSuggestions.mediaTypes.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-blue-700 mb-2">Suggested media types:</p>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.mediaTypes.map(mediaType => (
                    <button
                      key={mediaType}
                      type="button"
                      onClick={() => addMediaType(mediaType)}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded hover:bg-purple-200 transition-colors"
                    >
                      {mediaType}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Detected Location */}
            {aiSuggestions.location && (
              <div className="mb-3">
                <p className="text-xs text-blue-700 mb-2 flex items-center">
                  <MapPinIcon className="w-3 h-3 mr-1" />
                  Detected location: <span className="font-medium ml-1">{aiSuggestions.location}</span>
                </p>
              </div>
            )}

            {/* Detected Urgency */}
            {aiSuggestions.urgency !== 'MEDIUM' && (
              <div className="mb-3">
                <p className="text-xs text-blue-700 mb-2 flex items-center">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  Detected priority: 
                  <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${getUrgencyColor(aiSuggestions.urgency)}`}>
                    {aiSuggestions.urgency}
                  </span>
                </p>
              </div>
            )}

            {/* Deal Size */}
            {aiSuggestions.dealSize && (
              <div>
                <p className="text-xs text-blue-700 mb-2">
                  Detected deal size: <span className="font-medium">{aiSuggestions.dealSize}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Category and Metadata Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <select
              id="urgency"
              value={formData.urgency}
              onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">🚨 URGENT</option>
            </select>
          </div>

          {/* Deal Size */}
          <div>
            <label htmlFor="dealSize" className="block text-sm font-medium text-gray-700 mb-2">
              Deal Size (Optional)
            </label>
            <select
              id="dealSize"
              value={formData.dealSize}
              onChange={(e) => setFormData(prev => ({ ...prev, dealSize: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Not specified</option>
              <option value="SMALL">Under $50K</option>
              <option value="MEDIUM">$50K - $500K</option>
              <option value="LARGE">$500K - $2M</option>
              <option value="ENTERPRISE">$2M+</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location (Optional)
          </label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="City, state, or region"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Media Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media Types
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.mediaType.map(media => (
              <span
                key={media}
                className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded"
              >
                {media}
                <button
                  type="button"
                  onClick={() => removeMediaType(media)}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {['TV', 'RADIO', 'DIGITAL', 'PRINT', 'OOH', 'STREAMING', 'PODCAST', 'SOCIAL', 'PROGRAMMATIC'].map(media => (
              <button
                key={media}
                type="button"
                onClick={() => addMediaType(media)}
                className={`px-3 py-2 text-sm rounded border transition-colors ${
                  formData.mediaType.includes(media)
                    ? 'bg-purple-100 border-purple-300 text-purple-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {media}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add tags (press Enter)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                e.preventDefault();
                addTag(e.currentTarget.value.trim().toLowerCase());
                e.currentTarget.value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.isAnonymous}
            onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
            Post anonymously (your identity will be hidden)
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.title || !formData.content || !formData.categoryId}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
} 