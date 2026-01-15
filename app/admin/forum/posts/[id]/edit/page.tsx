'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import MentionEditor from '@/components/ui/MentionEditor';
import MentionText from '@/components/ui/MentionText';
import CommentEditor from '@/components/admin/CommentEditor';
import { authedFetch } from '@/lib/authedFetch';

interface Author {
  id: string;
  name: string;
  email: string;
  anonymousUsername?: string;
  publicHandle?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface TopicSuggestion {
  id: string;
  name: string;
  description?: string;
  confidence: number;
  isExisting: boolean;
  context?: string;
}

interface EntitySuggestion {
  id: string;
  name: string;
  type: 'company' | 'contact' | 'topic' | 'category' | 'agency' | 'advertiser' | 'industry' | 'publisher' | 'dsp_ssp' | 'adtech';
  description?: string;
  confidence: number;
  metadata?: {
    title?: string;
    industry?: string;
    companyType?: string;
    verified?: boolean;
    city?: string;
    state?: string;
  };
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
  topicMentions?: {
    topic: {
      id: string;
      name: string;
      description?: string;
      context?: string;
    };
  }[];
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
  const [topicSuggestions, setTopicSuggestions] = useState<TopicSuggestion[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);
  const [manualTopicInput, setManualTopicInput] = useState('');
  const [entitySuggestions, setEntitySuggestions] = useState<EntitySuggestion[]>([]);
  const [showEntityDropdown, setShowEntityDropdown] = useState(false);
  const [searchingEntities, setSearchingEntities] = useState(false);
  const [primaryTopicSearch, setPrimaryTopicSearch] = useState('');
  const [selectedPrimaryTopic, setSelectedPrimaryTopic] = useState<EntitySuggestion | null>(null);

  // Ref for debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    content: '',
    categoryId: '',
    isFeatured: false,
    isPinned: false,
    isLocked: false,
    isAnonymous: false,
    anonymousHandle: '',
    location: '',
    status: 'PENDING',
    topicIds: [] as string[],
    primaryTopicType: '',
    primaryTopicId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch post, categories, and comments in parallel
        const [postResponse, categoriesResponse, commentsResponse] = await Promise.all([
          authedFetch(`/api/admin/forum/posts/${postId}`),
          fetch('/api/forum/categories'),
          authedFetch(`/api/admin/forum/posts/${postId}/comments`)
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

        // Populate form with existing data - load company and contact mentions as topics
        const existingTopicIds = postData.topicMentions?.map((tm: any) => tm.topic.id) || [];

        // Helper to map companyType to entity type
        const getEntityType = (companyType: string | null): string => {
          if (!companyType) return 'company';
          const typeMap: { [key: string]: string } = {
            'AGENCY': 'agency',
            'ADVERTISER': 'advertiser',
            'INDUSTRY': 'industry',
            'PUBLISHER': 'publisher',
            'DSP_SSP': 'dsp_ssp',
            'ADTECH': 'adtech'
          };
          return typeMap[companyType] || 'company';
        };

        // Add company mentions as entity-{type}-{id} topics (using actual company type)
        const companyTopicIds = postData.companyMentions?.map((cm: any) => {
          const entityType = getEntityType(cm.company?.companyType);
          return `entity-${entityType}-${cm.companyId}`;
        }) || [];

        // Add contact mentions as entity-contact-{id} topics
        const contactTopicIds = postData.contactMentions?.map((cm: any) => `entity-contact-${cm.contactId}`) || [];

        // Combine all topic IDs
        const allTopicIds = [...existingTopicIds, ...companyTopicIds, ...contactTopicIds];
        setSelectedTopics(allTopicIds);

        // Store company/contact data for display names
        const loadedSuggestions: TopicSuggestion[] = [];

        if (postData.companyMentions) {
          postData.companyMentions.forEach((cm: any) => {
            if (cm.company) {
              const entityType = getEntityType(cm.company.companyType);
              loadedSuggestions.push({
                id: `entity-${entityType}-${cm.companyId}`,
                name: cm.company.name,
                type: entityType as any,
                confidence: 1.0,
                isExisting: true
              });
            }
          });
        }

        if (postData.contactMentions) {
          postData.contactMentions.forEach((cm: any) => {
            if (cm.contact) {
              loadedSuggestions.push({
                id: `entity-contact-${cm.contactId}`,
                name: `${cm.contact.firstName} ${cm.contact.lastName}`,
                type: 'contact',
                confidence: 1.0,
                isExisting: true
              });
            }
          });
        }

        setTopicSuggestions(loadedSuggestions);

        setFormData({
          content: postData.content || '',
          categoryId: postData.categoryId || '',
          isFeatured: postData.isFeatured || false,
          isPinned: postData.isPinned || false,
          isLocked: postData.isLocked || false,
          isAnonymous: postData.isAnonymous || false,
          anonymousHandle: postData.anonymousHandle || '',
          location: postData.location || '',
          status: postData.status || 'PENDING',
          topicIds: allTopicIds,
          primaryTopicType: postData.primaryTopicType || '',
          primaryTopicId: postData.primaryTopicId || ''
        });

        // If there's a primary topic, use it directly from the API response
        if (postData.primaryTopic) {
          setSelectedPrimaryTopic({
            id: postData.primaryTopic.id,
            name: postData.primaryTopic.name,
            type: postData.primaryTopic.type,
            description: postData.primaryTopic.description || '',
            confidence: 1.0
          });
        }

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

  // Fetch topic suggestions based on content
  const fetchTopicSuggestions = async (content: string, title: string = '') => {
    if (!content || content.trim().length < 10) {
      setTopicSuggestions([]);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const response = await authedFetch('/api/admin/topics/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          title: title || post?.title,
          categoryId: formData.categoryId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTopicSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching topic suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Handle content change and auto-suggest topics
  const handleContentChange = (value: string) => {
    setFormData({ ...formData, content: value });

    // Debounce topic suggestions
    setTimeout(() => {
      fetchTopicSuggestions(value);
    }, 1000);
  };

  // Toggle topic selection
  const toggleTopicSelection = (topicId: string) => {
    const updatedSelectedTopics = selectedTopics.includes(topicId)
      ? selectedTopics.filter(id => id !== topicId)
      : [...selectedTopics, topicId];

    setSelectedTopics(updatedSelectedTopics);
    setFormData({ ...formData, topicIds: updatedSelectedTopics });
  };

  // Remove selected topic
  const removeSelectedTopic = (topicId: string) => {
    const updatedSelectedTopics = selectedTopics.filter(id => id !== topicId);
    setSelectedTopics(updatedSelectedTopics);
    setFormData({ ...formData, topicIds: updatedSelectedTopics });
  };

  // Add manual topic
  const addManualTopic = (topicName: string) => {
    if (!topicName.trim()) return;

    const cleanName = topicName.trim();
    const topicId = `manual-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    // Check if already exists
    if (selectedTopics.includes(topicId)) return;

    const updatedSelectedTopics = [...selectedTopics, topicId];
    setSelectedTopics(updatedSelectedTopics);
    setFormData({ ...formData, topicIds: updatedSelectedTopics });

    // Add to suggestions for display
    const manualSuggestion: TopicSuggestion = {
      id: topicId,
      name: cleanName,
      confidence: 1.0,
      isExisting: false
    };

    setTopicSuggestions(prev => {
      const exists = prev.find(s => s.id === topicId);
      if (!exists) {
        return [manualSuggestion, ...prev];
      }
      return prev;
    });

    setManualTopicInput('');
  };

  // Search entities
  const searchEntities = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setEntitySuggestions([]);
      setShowEntityDropdown(false);
      return;
    }

    try {
      setSearchingEntities(true);
      const response = await authedFetch('/api/admin/topics/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 15 }),
      });

      if (response.ok) {
        const data = await response.json();
        setEntitySuggestions(data.suggestions || []);
        setShowEntityDropdown(data.suggestions && data.suggestions.length > 0);
      }
    } catch (error) {
      console.error('Error searching entities:', error);
    } finally {
      setSearchingEntities(false);
    }
  };

  // Search for primary topic entities (companies, contacts only)
  const searchPrimaryTopics = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setEntitySuggestions([]);
      return;
    }

    try {
      setSearchingEntities(true);
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=10`);

      if (response.ok) {
        const data = await response.json();
        // Filter to only companies and contacts, and map to our EntitySuggestion format
        const filteredSuggestions: EntitySuggestion[] = data.suggestions
          .filter((s: any) => s.type === 'company' || s.type === 'contact')
          .map((s: any) => {
            // Determine the entity type based on category
            let entityType: EntitySuggestion['type'] = 'company';
            if (s.type === 'contact') {
              entityType = 'contact';
            } else if (s.category === 'Agency') {
              entityType = 'agency';
            } else if (s.category === 'Advertiser') {
              entityType = 'advertiser';
            } else if (s.category === 'Industry') {
              entityType = 'industry';
            } else if (s.category === 'DSP/SSP') {
              entityType = 'dsp_ssp';
            } else if (s.category === 'Adtech') {
              entityType = 'adtech';
            } else if (s.category === 'Publisher') {
              entityType = 'publisher';
            }

            return {
              id: s.id,
              name: s.title,
              type: entityType,
              description: s.metadata?.description,
              confidence: 1.0,
              metadata: s.metadata
            };
          });

        setEntitySuggestions(filteredSuggestions);
      }
    } catch (error) {
      console.error('Error searching primary topics:', error);
    } finally {
      setSearchingEntities(false);
    }
  };

  // Handle primary topic selection
  const handlePrimaryTopicSelect = (entity: EntitySuggestion) => {
    setSelectedPrimaryTopic(entity);
    setFormData({
      ...formData,
      primaryTopicType: entity.type,
      primaryTopicId: entity.id
    });
    setPrimaryTopicSearch('');
    setEntitySuggestions([]);
  };

  // Clear primary topic
  const clearPrimaryTopic = () => {
    setSelectedPrimaryTopic(null);
    setFormData({
      ...formData,
      primaryTopicType: '',
      primaryTopicId: ''
    });
  };

  // Handle manual topic input change with search
  const handleManualTopicChange = (value: string) => {
    setManualTopicInput(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Show dropdown immediately if there's text
    if (value.trim().length >= 2) {
      setShowEntityDropdown(true);
    } else {
      setShowEntityDropdown(false);
      setEntitySuggestions([]);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchEntities(value);
    }, 300);
  };

  // Handle manual topic input
  const handleManualTopicKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addManualTopic(manualTopicInput);
      setShowEntityDropdown(false);
    } else if (e.key === 'Escape') {
      setShowEntityDropdown(false);
    }
  };

  // Select entity from suggestions
  const selectEntitySuggestion = (entity: EntitySuggestion) => {
    const topicId = `entity-${entity.type}-${entity.id}`;

    // Check if already selected
    if (selectedTopics.includes(topicId)) return;

    const updatedSelectedTopics = [...selectedTopics, topicId];
    setSelectedTopics(updatedSelectedTopics);
    setFormData({ ...formData, topicIds: updatedSelectedTopics });

    // Add to suggestions for display
    const entityTopicSuggestion: TopicSuggestion = {
      id: topicId,
      name: entity.name,
      confidence: entity.confidence,
      isExisting: true,
      description: entity.description
    };

    setTopicSuggestions(prev => {
      const exists = prev.find(s => s.id === topicId);
      if (!exists) {
        return [entityTopicSuggestion, ...prev];
      }
      return prev;
    });

    setManualTopicInput('');
    setShowEntityDropdown(false);
  };

  // Get topic display name
  const getTopicDisplayName = (topicId: string) => {
    const suggestion = topicSuggestions.find(s => s.id === topicId);
    const existingTopic = post?.topicMentions?.find(tm => tm.topic.id === topicId);

    // Handle entity-based topics
    if (topicId.startsWith('entity-')) {
      return suggestion?.name || topicId.replace(/^entity-[^-]+-/, '');
    }

    // Handle manual topics
    if (topicId.startsWith('manual-')) {
      return suggestion?.name || topicId.replace('manual-', '').replace(/-/g, ' ');
    }

    return suggestion?.name || existingTopic?.topic.name || topicId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await authedFetch(`/api/admin/forum/posts/${postId}`, {
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

      const response = await authedFetch(`/api/admin/forum/posts/${postId}`, {
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
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-4">The forum post you're looking for doesn't exist.</p>
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
        <h1 className="text-2xl font-bold text-foreground">Edit Forum Post</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/admin/forum/posts')}
            className="bg-muted-foreground text-white px-4 py-2 rounded-md hover:bg-muted-foreground/80"
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
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Content *
              </label>
              <MentionEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Enter post content... (use @ to mention companies, contacts, categories, and users)"
                multiline={true}
                className="min-h-[200px]"
              />
            </div>

            {/* Primary Topic Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Primary Topic
                <span className="text-sm text-muted-foreground ml-2">(Company, Agency, Person, Industry, etc.)</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={primaryTopicSearch}
                  onChange={(e) => {
                    setPrimaryTopicSearch(e.target.value);
                    searchPrimaryTopics(e.target.value);
                  }}
                  placeholder="Search for companies, agencies, people, industries..."
                  className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-foreground placeholder:text-muted-foreground"
                />

                {/* Search Results Dropdown */}
                {entitySuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-input rounded-md shadow-lg max-h-60 overflow-auto">
                    {searchingEntities && (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        Searching...
                      </div>
                    )}
                    {!searchingEntities && entitySuggestions.map((entity) => (
                      <button
                        key={entity.id}
                        type="button"
                        onClick={() => handlePrimaryTopicSelect(entity)}
                        className="w-full px-4 py-3 text-left hover:bg-muted flex items-center space-x-3 border-b border-border last:border-b-0"
                      >
                        <div className="flex-shrink-0">
                          {entity.type === 'contact' && <span className="text-xl">👤</span>}
                          {entity.type === 'agency' && <span className="text-xl">🏢</span>}
                          {entity.type === 'advertiser' && <span className="text-xl">🏪</span>}
                          {entity.type === 'industry' && <span className="text-xl">🏭</span>}
                          {entity.type === 'publisher' && <span className="text-xl">📰</span>}
                          {entity.type === 'dsp_ssp' && <span className="text-xl">🔌</span>}
                          {entity.type === 'adtech' && <span className="text-xl">⚙️</span>}
                          {entity.type === 'company' && <span className="text-xl">🏢</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{entity.name}</p>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {entity.type === 'contact' && 'Person'}
                              {entity.type === 'agency' && 'Agency'}
                              {entity.type === 'advertiser' && 'Advertiser'}
                              {entity.type === 'industry' && 'Industry'}
                              {entity.type === 'publisher' && 'Publisher'}
                              {entity.type === 'dsp_ssp' && 'DSP/SSP'}
                              {entity.type === 'adtech' && 'Adtech'}
                              {entity.type === 'company' && 'Company'}
                            </span>
                            {entity.description && (
                              <span className="text-xs text-muted-foreground truncate">{entity.description}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Primary Topic Pill */}
              {selectedPrimaryTopic && (
                <div className="mt-3">
                  <div className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-300">
                    {selectedPrimaryTopic.type === 'contact' && <span className="mr-2">👤</span>}
                    {selectedPrimaryTopic.type === 'agency' && <span className="mr-2">🏢</span>}
                    {selectedPrimaryTopic.type === 'advertiser' && <span className="mr-2">🏪</span>}
                    {selectedPrimaryTopic.type === 'industry' && <span className="mr-2">🏭</span>}
                    {selectedPrimaryTopic.type === 'publisher' && <span className="mr-2">📰</span>}
                    {selectedPrimaryTopic.type === 'dsp_ssp' && <span className="mr-2">🔌</span>}
                    {selectedPrimaryTopic.type === 'adtech' && <span className="mr-2">⚙️</span>}
                    {selectedPrimaryTopic.type === 'company' && <span className="mr-2">🏢</span>}
                    <span className="font-medium mr-2">{selectedPrimaryTopic.name}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-200 text-blue-900 mr-2">
                      {selectedPrimaryTopic.type === 'contact' && 'Person'}
                      {selectedPrimaryTopic.type === 'agency' && 'Agency'}
                      {selectedPrimaryTopic.type === 'advertiser' && 'Advertiser'}
                      {selectedPrimaryTopic.type === 'industry' && 'Industry'}
                      {selectedPrimaryTopic.type === 'publisher' && 'Publisher'}
                      {selectedPrimaryTopic.type === 'dsp_ssp' && 'DSP/SSP'}
                      {selectedPrimaryTopic.type === 'adtech' && 'Adtech'}
                      {selectedPrimaryTopic.type === 'company' && 'Company'}
                    </span>
                    <button
                      type="button"
                      onClick={clearPrimaryTopic}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-foreground"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {formData.isAnonymous && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Anonymous Handle
                </label>
                <input
                  type="text"
                  value={formData.anonymousHandle}
                  onChange={(e) => setFormData({ ...formData, anonymousHandle: e.target.value })}
                  className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-foreground placeholder:text-muted-foreground"
                  placeholder="Anonymous user handle"
                />
              </div>
            )}
          </div>

          {/* Topics Management Section */}
          <div className="border-t pt-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-muted-foreground">
                  Additional Topics (Companies, Industries, DSPs/SSPs, Advertisers, etc.)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowTopicSuggestions(!showTopicSuggestions);
                    if (!showTopicSuggestions && formData.content) {
                      fetchTopicSuggestions(formData.content);
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={loadingSuggestions}
                >
                  {loadingSuggestions ? 'Loading...' : showTopicSuggestions ? 'Hide AI Suggestions' : 'Show AI Suggestions'}
                </button>
              </div>

              {/* Manual Topic Entry */}
              <div className="mb-4 relative">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={manualTopicInput}
                      onChange={(e) => handleManualTopicChange(e.target.value)}
                      onKeyDown={handleManualTopicKeyPress}
                      onFocus={() => {
                        if (manualTopicInput.trim().length >= 2) {
                          setShowEntityDropdown(true);
                        }
                      }}
                      placeholder="Search companies, contacts, topics... (e.g., Nike, John Smith, Programmatic)"
                      className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-foreground placeholder:text-muted-foreground"
                    />

                    {/* Entity Suggestions Dropdown */}
                    {showEntityDropdown && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {searchingEntities ? (
                          <div className="p-3 text-center text-muted-foreground">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-1"></div>
                            Searching database...
                          </div>
                        ) : entitySuggestions.length > 0 ? (
                          <>
                            {entitySuggestions.map((entity, index) => (
                              <div
                                key={`${entity.type}-${entity.id}-${index}`}
                                className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                                onClick={() => selectEntitySuggestion(entity)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-foreground">{entity.name}</span>
                                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                                        entity.type === 'company' ? 'bg-blue-100 text-blue-800' :
                                        entity.type === 'contact' ? 'bg-green-100 text-green-800' :
                                        entity.type === 'topic' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {entity.type.charAt(0).toUpperCase() + entity.type.slice(1)}
                                      </span>
                                      {entity.metadata?.verified && (
                                        <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                                          Verified
                                        </span>
                                      )}
                                    </div>
                                    {entity.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{entity.description}</p>
                                    )}
                                    {entity.metadata && (
                                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        {entity.metadata.industry && (
                                          <span>{entity.metadata.industry}</span>
                                        )}
                                        {entity.metadata.title && (
                                          <span>{entity.metadata.title}</span>
                                        )}
                                        {entity.metadata.city && entity.metadata.state && (
                                          <span>{entity.metadata.city}, {entity.metadata.state}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {Math.round(entity.confidence * 100)}%
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : manualTopicInput.trim().length >= 2 ? (
                          <div className="p-3 text-center text-muted-foreground">
                            No matching entities found. Press Enter to add as custom topic.
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      addManualTopic(manualTopicInput);
                      setShowEntityDropdown(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Type to search existing companies, contacts, topics, or add custom topics. Press Enter or click Add.
                </p>
              </div>

              {/* Selected Topics with Additional Companies Count */}
              {selectedTopics.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Selected Topics:
                    {selectedTopics.filter(t => t.startsWith('entity-company-')).length > 1 && (
                      <span className="ml-2 text-blue-600 font-medium">
                        ({selectedTopics.filter(t => t.startsWith('entity-company-')).length} companies total)
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopics.map((topicId) => {
                      const isCompany = topicId.startsWith('entity-company-');
                      return (
                        <div
                          key={topicId}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                            isCompany ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {isCompany && <span className="mr-1">🏢</span>}
                          <span className="mr-2">{getTopicDisplayName(topicId)}</span>
                          <button
                            type="button"
                            onClick={() => removeSelectedTopic(topicId)}
                            className={isCompany ? 'text-blue-600 hover:text-blue-800' : 'text-muted-foreground hover:text-foreground'}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Topic Suggestions */}
              {showTopicSuggestions && (
                <div className="border border-border rounded-lg p-4 bg-muted">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Suggested Topics
                    {loadingSuggestions && (
                      <span className="ml-2 text-xs text-muted-foreground animate-pulse">Analyzing content...</span>
                    )}
                  </h4>

                  {topicSuggestions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {topicSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedTopics.includes(suggestion.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-border hover:border-input hover:bg-muted'
                          }`}
                          onClick={() => toggleTopicSelection(suggestion.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground flex items-center">
                                {suggestion.name}
                                {suggestion.isExisting && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                                    Existing
                                  </span>
                                )}
                                {!suggestion.isExisting && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                                    New
                                  </span>
                                )}
                              </p>
                              {suggestion.description && (
                                <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                              )}
                              <div className="flex items-center mt-1">
                                <div className="flex-1 bg-muted rounded-full h-1">
                                  <div
                                    className="bg-blue-600 h-1 rounded-full"
                                    style={{ width: `${suggestion.confidence * 100}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {Math.round(suggestion.confidence * 100)}%
                                </span>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedTopics.includes(suggestion.id)}
                              onChange={() => toggleTopicSelection(suggestion.id)}
                              className="ml-3 rounded border-input text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      {loadingSuggestions ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="ml-2">Analyzing content for topics...</span>
                        </div>
                      ) : (
                        <p>
                          {formData.content.trim().length < 10
                            ? 'Enter some content to get topic suggestions'
                            : 'No topic suggestions found for this content'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Post Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full md:w-1/2 border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-foreground"
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
                  className="rounded border-input text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-muted-foreground">Featured</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded border-input text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-muted-foreground">Pinned</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isLocked}
                  onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                  className="rounded border-input text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-muted-foreground">Locked</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="rounded border-input text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-muted-foreground">Anonymous</span>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/admin/forum/posts')}
                className="bg-muted-foreground text-white px-6 py-2 rounded-md hover:bg-muted-foreground/80"
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
        <div className="mt-6 bg-muted rounded-lg p-4">
          <h3 className="text-lg font-medium text-foreground mb-2">Post Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Author:</span>
              <p className="text-muted-foreground">
                {post.author?.anonymousUsername || post.author?.publicHandle || post.author?.name || 'Unknown'}
              </p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Views:</span>
              <p className="text-muted-foreground">{post.views}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Comments:</span>
              <p className="text-muted-foreground">{post._count.comments}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Created:</span>
              <p className="text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Updated:</span>
              <p className="text-muted-foreground">{new Date(post.updatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Slug:</span>
              <p className="text-muted-foreground font-mono">{post.slug}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-6 bg-white rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground">
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
              <div className="text-center py-8 text-muted-foreground">
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