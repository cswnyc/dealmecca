'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Firebase imports removed to prevent authentication conflicts with LinkedIn OAuth
import { generateMetadata } from '@/lib/ai-tagging';
import { parseMentions } from '@/lib/mention-utils';
import { authedFetch } from '@/lib/authedFetch';
import { EnhancedMentionTextarea } from './EnhancedMentionTextarea';
import { CodeGenerationInterface } from '@/components/code/CodeGenerationInterface';
import { TagIcon, MapPinIcon, ExclamationTriangleIcon, BuildingOfficeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useUser } from '@/hooks/useUser';

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

interface SmartPostFormProps {
  categories: ForumCategory[];
  postType?: 'post' | 'list' | 'poll' | 'code';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SmartPostForm({ categories, postType = 'post', onSuccess, onCancel }: SmartPostFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  // Use backend session authentication instead of Firebase
  const { user, loading: authLoading } = useUser();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: [] as string[],
    isAnonymous: false,
    location: '',
    mediaType: [] as string[],
    eventId: eventId || '',
    // List specific fields
    listItems: [''],
    // Poll specific fields
    pollQuestion: '',
    pollChoices: ['', ''],
    pollDuration: 7, // days
    // Code specific fields
    codePrompt: '',
    codeLanguage: 'typescript',
    codeFramework: 'React',
    codeType: 'component',
    codeComplexity: 'intermediate',
    generatedCode: ''
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
    mediaTypes: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  // Functions for handling list items
  const addListItem = () => {
    setFormData(prev => ({
      ...prev,
      listItems: [...prev.listItems, '']
    }));
  };

  const updateListItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      listItems: prev.listItems.map((item, i) => i === index ? value : item)
    }));
  };

  const removeListItem = (index: number) => {
    if (formData.listItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        listItems: prev.listItems.filter((_, i) => i !== index)
      }));
    }
  };

  // Functions for handling poll choices
  const addPollChoice = () => {
    setFormData(prev => ({
      ...prev,
      pollChoices: [...prev.pollChoices, '']
    }));
  };

  const updatePollChoice = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      pollChoices: prev.pollChoices.map((choice, i) => i === index ? value : choice)
    }));
  };

  const removePollChoice = (index: number) => {
    if (formData.pollChoices.length > 2) {
      setFormData(prev => ({
        ...prev,
        pollChoices: prev.pollChoices.filter((_, i) => i !== index)
      }));
    }
  };

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

  // Enhanced AI-powered suggestions when content changes
  useEffect(() => {
    if (formData.content.length > 50) {
      const getSuggestions = async () => {
        try {
          // Use Claude Code SDK via API for more advanced suggestions
          const response = await fetch('/api/claude-code/forum-suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: formData.content })
          });
          const claudeSuggestions = response.ok ? await response.json() : null;
          
          // Fallback to local suggestions if Claude fails
          const fallbackSuggestions = generateMetadata('', formData.content) as any;
          
          // Merge suggestions, prioritizing Claude's suggestions
          const mergedSuggestions = {
            tags: [...(claudeSuggestions?.tags || []), ...((fallbackSuggestions?.tags) || [])].slice(0, 10),
            companies: [...(claudeSuggestions?.technologies || []), ...((fallbackSuggestions?.companies) || [])],
            location: claudeSuggestions?.location || fallbackSuggestions?.location || '',
            mediaTypes: [...(claudeSuggestions?.frameworks || []), ...((fallbackSuggestions?.mediaTypes) || [])],
          };
          
          setAiSuggestions(mergedSuggestions);
          setShowAiSuggestions(true);
          
          // Auto-set detected values if not already set
          if (mergedSuggestions.location && !formData.location) {
            setFormData(prev => ({ ...prev, location: mergedSuggestions.location || '' }));
          }
          
          
          if (mergedSuggestions.mediaTypes.length > 0 && formData.mediaType.length === 0) {
            setFormData(prev => ({ ...prev, mediaType: mergedSuggestions.mediaTypes }));
          }
        } catch (error) {
          console.error('Failed to get Claude suggestions, using fallback:', error);
          // Use fallback suggestions on error
          const suggestions = generateMetadata('', formData.content) as any;
          if (suggestions) {
            setAiSuggestions(suggestions);
            setShowAiSuggestions(true);
          }
        }
      };
      
      getSuggestions();
    }
  }, [formData.content]);

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

  const handleCancel = (): void => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/forum');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation based on post type

    if (postType === 'post' && !formData.content) return;
    if (postType === 'list' && formData.listItems.filter(item => item.trim()).length === 0) return;
    if (postType === 'poll' && (!formData.pollQuestion.trim() || formData.pollChoices.filter(choice => choice.trim()).length < 2)) return;
    if (postType === 'code' && !formData.generatedCode && !formData.content) return;

    if (postType !== 'poll' && !formData.categoryId) return;

    // Check authentication with detailed logging

    setIsSubmitting(true);
    try {
      // Prepare content based on post type
      let content = formData.content;
      let additionalData = {};

      if (postType === 'list') {
        content = formData.listItems.filter(item => item.trim()).join('\n');
        additionalData = { 
          postType: 'list',
          listItems: formData.listItems.filter(item => item.trim())
        };
      } else if (postType === 'poll') {
        content = formData.pollQuestion;
        additionalData = {
          postType: 'poll',
          pollChoices: formData.pollChoices.filter(choice => choice.trim()),
          pollDuration: formData.pollDuration,
          pollEndsAt: new Date(Date.now() + formData.pollDuration * 24 * 60 * 60 * 1000).toISOString()
        };
      } else if (postType === 'code') {
        // For code posts, include both generated code and additional context
        content = formData.generatedCode ? 
          `\`\`\`${formData.codeLanguage}\n${formData.generatedCode}\n\`\`\`\n\n${formData.content}` : 
          formData.content;
        additionalData = { 
          postType: 'code',
          codeLanguage: formData.codeLanguage,
          codeFramework: formData.codeFramework,
          codeType: formData.codeType,
          codeComplexity: formData.codeComplexity,
          generatedCode: formData.generatedCode
        };
      } else {
        additionalData = { postType: 'post' };
      }

      // Parse mentions from content
      const mentions = parseMentions(content);
      
      // Auto-generate title from content (first 50 characters)
      const autoTitle = content.length > 0 ? 
        content.replace(/\s+/g, ' ').trim().substring(0, 50) + (content.length > 50 ? '...' : '') :
        'New Post';
      
      const requestBody = {
        ...formData,
        title: autoTitle,
        content,
        authorId: user?.id,
        ...additionalData,
        tags: JSON.stringify(formData.tags),
        mediaType: Array.isArray(formData.mediaType) && formData.mediaType.length > 0
          ? formData.mediaType[0]
          : 'text', // Default to 'text' if no media type selected
        // Include mentions for backend processing
        mentions: {
          companies: mentions.companyMentions,
          contacts: mentions.contactMentions
        }
      };


      const response = await authedFetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const post = await response.json();
        if (onSuccess) {
          onSuccess();
        } else {
          // Only redirect if no onSuccess callback provided
          router.push('/forum');
        }
      } else {
        const errorText = await response.text();
        console.error('Server responded with error:', response.status, errorText);
        throw new Error(`Failed to create post: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'text-destructive-foreground bg-destructive';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Context */}
        {eventInfo && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CalendarIcon className="w-5 h-5 text-brand-primary dark:text-[#5B8DFF] mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">
                  Creating discussion for event
                </h3>
                <p className="text-sm text-brand-primary dark:text-[#5B8DFF] font-medium mt-1">
                  {eventInfo.name}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-brand-primary dark:text-[#5B8DFF]">
                  <span>{new Date(eventInfo.startDate).toLocaleDateString()}</span>
                  {eventInfo.location && <span>{eventInfo.location}</span>}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Dynamic Content Based on Post Type */}
        {postType === 'post' && (
          <>

            {/* Post Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
                Content *
              </label>
              <EnhancedMentionTextarea
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Share details, context, or ask your question... Use @company, @contact, or @topic mentions"
                rows={6}
              />
            </div>
          </>
        )}

        {postType === 'list' && (
          <>

            {/* List Items */}
            <div className="bg-muted rounded-lg p-4 space-y-3">
              {formData.listItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateListItem(index, e.target.value)}
                    placeholder="Add an item"
                    className="flex-1 px-3 py-2 border border-border rounded bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                  {formData.listItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeListItem(index)}
                      className="text-destructive hover:text-destructive/80 p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addListItem}
                className="w-full text-left px-3 py-2 border border-border rounded bg-card text-muted-foreground hover:bg-muted transition-colors"
              >
                Add an item
              </button>
            </div>
          </>
        )}

        {postType === 'code' && (
          <>

            {/* Code Generation Interface */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Code Generation
              </label>
              <CodeGenerationInterface
                initialPrompt={formData.codePrompt}
                initialLanguage={formData.codeLanguage}
                initialFramework={formData.codeFramework}
                onCodeGenerated={(code, language) => {
                  setFormData(prev => ({
                    ...prev,
                    generatedCode: code,
                    codeLanguage: language,
                    content: code // Set the generated code as the post content
                  }));
                }}
              />
            </div>

            {/* Optional additional context */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
                Additional Context (Optional)
              </label>
              <EnhancedMentionTextarea
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Add any additional context, questions, or discussion points about this code..."
                rows={4}
              />
            </div>
          </>
        )}

        {postType === 'poll' && (
          <>
            {/* Poll Question */}
            <div>
              <label htmlFor="pollQuestion" className="block text-sm font-medium text-foreground mb-2">
                Your question *
              </label>
              <textarea
                id="pollQuestion"
                value={formData.pollQuestion}
                onChange={(e) => {
                  if (e.target.value.length <= 140) {
                    setFormData(prev => ({ ...prev, pollQuestion: e.target.value }));
                  }
                }}
                placeholder="E.g., How do you commute to work?"
                rows={3}
                maxLength={140}
                className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
              <div className="text-right text-sm text-muted-foreground mt-1">
                {formData.pollQuestion.length}/140
              </div>
            </div>

            {/* Poll Choices */}
            <div className="space-y-4">
              {formData.pollChoices.map((choice, index) => (
                <div key={index}>
                  <label htmlFor={`option-${index}`} className="block text-sm font-medium text-foreground mb-2">
                    Option {index + 1} *
                  </label>
                  <div className="flex items-start space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        id={`option-${index}`}
                        value={choice}
                        onChange={(e) => {
                          if (e.target.value.length <= 30) {
                            updatePollChoice(index, e.target.value);
                          }
                        }}
                        placeholder={index === 0 ? "E.g., Public transportation" : index === 1 ? "E.g., Drive myself" : `Option ${index + 1}`}
                        maxLength={30}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                        required
                      />
                      <div className="text-right text-sm text-muted-foreground mt-1">
                        {choice.length}/30
                      </div>
                    </div>
                    {formData.pollChoices.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePollChoice(index)}
                        className="mt-3 text-destructive hover:text-destructive/80 p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addPollChoice}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-brand-primary dark:border-[#5B8DFF] text-brand-primary dark:text-[#5B8DFF] rounded-full font-medium hover:bg-[#EAF1FF] dark:hover:bg-[#162449] transition-colors"
              >
                <span className="text-xl font-bold">+</span>
                <span>Add option</span>
              </button>
            </div>

            {/* Poll Duration */}
            <div>
              <label htmlFor="pollDuration" className="block text-sm font-medium text-foreground mb-2">
                Poll duration
              </label>
              <select
                id="pollDuration"
                value={formData.pollDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, pollDuration: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>1 week</option>
                <option value={14}>2 weeks</option>
                <option value={30}>1 month</option>
              </select>
            </div>

            {/* Category for Poll */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
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
          </>
        )}

        {/* AI Suggestions */}
        {showAiSuggestions && postType !== 'poll' && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center">
              <TagIcon className="w-4 h-4 mr-2" />
              AI Smart Suggestions
            </h3>

            {/* Suggested Tags */}
            {aiSuggestions.tags.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-brand-primary dark:text-[#5B8DFF] mb-2">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-2 py-1 bg-[#EAF1FF] dark:bg-[#162449] text-brand-primary dark:text-[#5B8DFF] text-xs rounded hover:bg-[#EAF1FF]/80 dark:hover:bg-[#162449]/80 transition-colors"
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
                <p className="text-xs text-brand-primary dark:text-[#5B8DFF] mb-2 flex items-center">
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
                <p className="text-xs text-brand-primary dark:text-[#5B8DFF] mb-2">Suggested media types:</p>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.mediaTypes.map(mediaType => (
                    <button
                      key={mediaType}
                      type="button"
                      onClick={() => addMediaType(mediaType)}
                      className="px-2 py-1 bg-accent/20 text-accent-foreground text-xs rounded hover:bg-accent/30 transition-colors"
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
                <p className="text-xs text-brand-primary dark:text-[#5B8DFF] mb-2 flex items-center">
                  <MapPinIcon className="w-3 h-3 mr-1" />
                  Detected location: <span className="font-medium ml-1">{aiSuggestions.location}</span>
                </p>
              </div>
            )}

            {/* Detected Urgency */}
          </div>
        )}

        {/* Category and Metadata Row - Hide for polls */}
        {postType !== 'poll' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
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

            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, state, or region"
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Media Types */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Media Types
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.mediaType.map(media => (
                  <span
                    key={media}
                    className="inline-flex items-center px-2 py-1 bg-accent/20 text-accent-foreground text-sm rounded"
                  >
                    {media}
                    <button
                      type="button"
                      onClick={() => removeMediaType(media)}
                      className="ml-1 text-accent-foreground/80 hover:text-accent-foreground"
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
                        ? 'bg-accent/20 border-accent/50 text-accent-foreground'
                        : 'bg-card border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {media}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-[#EAF1FF] dark:bg-[#162449] text-brand-primary dark:text-[#5B8DFF] text-sm rounded"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-brand-primary/80 dark:text-[#5B8DFF]/80 hover:text-brand-primary dark:hover:text-[#5B8DFF]"
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
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Anonymous Option */}
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                  className="w-4 h-4 text-brand-primary dark:text-[#5B8DFF] border-border rounded focus:ring-2 focus:ring-brand-primary/20 dark:focus:ring-[#5B8DFF]/20"
                />
                <label htmlFor="anonymous" className="ml-2 text-sm text-foreground">
                  Post anonymously
                </label>
              </div>

              {formData.isAnonymous && (
                <div className="ml-6 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground">?</span>
                    </div>
                    <span className="text-muted-foreground">Will be posted as:</span>
                    <span className="font-medium text-foreground">Anonymous User</span>
                    <span className="text-xs bg-[#EAF1FF] dark:bg-[#162449] text-brand-primary dark:text-[#5B8DFF] px-2 py-1 rounded-full">Anonymous</span>
                  </div>
                  <div className="text-xs text-brand-primary dark:text-[#5B8DFF] mt-2">
                    💡 Set an anonymous handle in your profile to maintain consistency across anonymous posts
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting ||
              (postType === 'post' && !formData.content) ||
              (postType === 'list' && formData.listItems.filter(item => item.trim()).length === 0) ||
              (postType === 'poll' && (!formData.pollQuestion.trim() || formData.pollChoices.filter(choice => choice.trim()).length < 2 || !formData.categoryId)) ||
              (postType === 'code' && !formData.generatedCode && !formData.content) ||
              (postType !== 'poll' && !formData.categoryId)}
            className="px-6 py-2 bg-gradient-brand text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Creating...' : `Create ${postType.charAt(0).toUpperCase() + postType.slice(1)}`}
          </button>
        </div>
      </form>
    </div>
  );
} 