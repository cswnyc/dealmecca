'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
// Firebase imports removed to prevent authentication conflicts with LinkedIn OAuth
import {
  ChatBubbleLeftIcon,
  BookmarkIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import { RealTimeVotes } from './RealTimeVotes';
import { RichContentRenderer } from './RichContentRenderer';
import { TopicChip } from './TopicChip';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  isAnonymous: boolean;
  anonymousHandle?: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dealSize?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
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
  // Post type fields
  postType?: string;
  listItems?: string; // JSON string of array
  pollChoices?: string; // JSON string of array
  pollDuration?: number;
  pollEndsAt?: string;
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
      industry?: string;
      city?: string;
      state?: string;
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
  topicMentions?: Array<{
    id: string;
    topic: {
      id: string;
      name: string;
      description?: string;
      context?: string;
      color?: string;
      icon?: string;
      companies: Array<{
        id: string;
        company: {
          id: string;
          name: string;
          logoUrl?: string;
          verified: boolean;
          companyType?: string;
          industry?: string;
          city?: string;
          state?: string;
        };
        context?: string;
        role?: string;
        order: number;
      }>;
      contacts: Array<{
        id: string;
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
        context?: string;
        role?: string;
        order: number;
      }>;
    };
  }>;
  _count: {
    comments: number;
  };
}

interface ForumPostCardProps {
  post: ForumPost;
  onVote?: (postId: string, type: 'upvote' | 'downvote') => void;
  onBookmark?: (postId: string) => void;
  userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
  expandable?: boolean;
}

export function ForumPostCard({ post, onVote, onBookmark, userVote, expandable = false }: ForumPostCardProps) {
  const [expanded, setExpanded] = useState(expandable);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentVotes, setCommentVotes] = useState<{[key: string]: string}>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [currentUserIdentity, setCurrentUserIdentity] = useState<{username: string, avatarId: string} | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Helper functions to parse JSON string fields
  const parseListItems = (listItems?: string): string[] => {
    if (!listItems) return [];
    try {
      return JSON.parse(listItems);
    } catch {
      return [];
    }
  };

  const parsePollChoices = (pollChoices?: string): string[] => {
    if (!pollChoices) return [];
    try {
      return JSON.parse(pollChoices);
    } catch {
      return [];
    }
  };

  const listItemsArray = parseListItems(post.listItems);
  const pollChoicesArray = parsePollChoices(post.pollChoices);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  // Safe authentication state - handles missing Firebase provider
  const hasFirebaseSession = false;
  const firebaseUser = null;
  const authLoading = false;
  const urgencyColors = {
    LOW: 'text-gray-500',
    MEDIUM: 'text-blue-500', 
    HIGH: 'text-orange-500',
    URGENT: 'text-red-700'
  };

  // Auto-load comments when expandable
  useEffect(() => {
    if (expandable && comments.length === 0 && !commentsLoading) {
      fetchComments();
    }
  }, [expandable]);

  // Fetch current user's anonymous identity for their own comments
  useEffect(() => {
    console.log('🔄 ForumPostCard component loaded, Firebase user:', firebaseUser?.uid);

    const fetchCurrentUserIdentity = async () => {
      if (firebaseUser?.uid) {
        console.log('🔍 Fetching user identity for UID:', firebaseUser.uid);

        try {
          const response = await fetch(`/api/users/identity?firebaseUid=${firebaseUser.uid}`);
          console.log('📡 Identity API response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('📦 Identity API data:', data);

            if (data.currentUsername && data.currentAvatarId) {
              setCurrentUserIdentity({
                username: data.currentUsername,
                avatarId: data.currentAvatarId
              });
              console.log('✅ User identity loaded:', data.currentUsername, data.currentAvatarId);
            } else {
              console.log('❌ User identity data incomplete:', data);
            }
          } else {
            console.log('❌ Identity API request failed:', response.status);
          }
        } catch (error) {
          console.error('💥 Error fetching user identity:', error);
        }
      } else {
        console.log('⚠️ No Firebase UID available');
      }
    };

    fetchCurrentUserIdentity();
  }, [firebaseUser?.uid]);

  // Load user's follow/bookmark status
  useEffect(() => {
    const loadUserStatus = async () => {
      if (!firebaseUser?.uid) return;

      try {
        // Check follow status
        const followResponse = await fetch(`/api/forum/posts/${post.id}/status?userId=${firebaseUser.uid}`);
        if (followResponse.ok) {
          const followData = await followResponse.json();
          setIsFollowing(followData.isFollowing || false);
          setIsBookmarked(followData.isBookmarked || false);
        }
      } catch (error) {
        console.error('Failed to load user status:', error);
      }
    };

    loadUserStatus();
  }, [post.id, firebaseUser?.uid]);

  const urgencyLabels = {
    LOW: 'Low Priority',
    MEDIUM: 'Medium Priority',
    HIGH: 'High Priority', 
    URGENT: 'URGENT'
  };

  const dealSizeLabels = {
    SMALL: 'Small Deal',
    MEDIUM: 'Medium Deal',
    LARGE: 'Large Deal',
    ENTERPRISE: 'Enterprise Deal'
  };


  // Safe parsing for media types - handle various formats  
  const safeParseMediaTypes = (mediaData: any): string[] => {
    if (!mediaData) return [];
    
    // If already an array, return it
    if (Array.isArray(mediaData)) return mediaData;
    
    // If it's a string, try different parsing methods
    if (typeof mediaData === 'string') {
      // First try JSON parsing
      try {
        const parsed = JSON.parse(mediaData);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // If JSON parsing fails, try comma-separated parsing
        return mediaData.split(',').map(type => type.trim()).filter(type => type.length > 0);
      }
    }
    
    return [];
  };

  const mediaTypes = safeParseMediaTypes(post.mediaType);

  const fetchComments = async () => {
    if (!expandable || commentsLoading) return;
    
    setCommentsLoading(true);
    try {
      const response = await fetch(`/api/forum/posts/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleToggleComments = () => {
    if (!expanded && comments.length === 0) {
      fetchComments();
    }
    setExpanded(!expanded);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submittingComment) return;

    // If anonymous comment is requested but user identity is not loaded yet, wait a bit
    if (commentAnonymous && !currentUserIdentity) {
      console.warn('⏳ User identity not loaded yet, retrying in 1 second...');
      setTimeout(() => handleSubmitComment(), 1000);
      return;
    }
    
    setSubmittingComment(true);

    const anonymousHandle = commentAnonymous ? 'Anonymous User' : null;
    const anonymousAvatarId = commentAnonymous ? (currentUserIdentity?.avatarId || 'avatar_1') : null;

    console.log('🚀 Submitting comment:', {
      isAnonymous: commentAnonymous,
      currentUserIdentity,
      anonymousHandle,
      anonymousAvatarId
    });

    // Temporary alert for debugging
    if (commentAnonymous) {
      alert(`Submitting as: ${anonymousHandle} with avatar: ${anonymousAvatarId}`);
    }

    try {
      const response = await fetch(`/api/forum/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText.trim(),
          isAnonymous: commentAnonymous,
          authorId: firebaseUser?.uid,
          anonymousHandle,
          anonymousAvatarId
        })
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prev => [...prev, newComment]);
        setCommentText('');
        setCommentAnonymous(false);
        // Refresh to get updated comment count
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentVote = async (commentId: string, voteType: 'up' | 'down') => {
    try {
      // Use Firebase user ID or create anonymous user ID
      const userId = firebaseUser?.uid || 'anonymous-user-' + Math.random().toString(36).substr(2, 9);
      
      const response = await fetch(`/api/forum/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: voteType,
          userId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the comment in our local state
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, upvotes: data.comment.upvotes, downvotes: data.comment.downvotes }
              : comment
          )
        );
        // Track user's vote
        setCommentVotes(prev => ({
          ...prev,
          [commentId]: data.userVote
        }));
      }
    } catch (error) {
      console.error('Failed to vote on comment:', error);
    }
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo(commentId);
    setReplyText(`@${authorName} `);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !replyingTo) return;

    try {
      const response = await fetch(`/api/forum/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyText,
          parentId: replyingTo,
          isAnonymous: true,
          authorId: firebaseUser?.uid,
          anonymousHandle: currentUserIdentity?.username || 'Anonymous User',
          anonymousAvatarId: currentUserIdentity?.avatarId || 'avatar_1'
        }),
      });

      if (response.ok) {
        setReplyText('');
        setReplyingTo(null);
        // Refresh comments
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/forum/posts/${post.id}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: firebaseUser?.uid,
          follow: !isFollowing
        }),
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const handleBookmark = async () => {
    if (!firebaseUser) {
      console.log('🔥 User not authenticated, cannot bookmark');
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${post.id}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: firebaseUser.uid,
          bookmark: !isBookmarked
        }),
        credentials: 'include'
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
        onBookmark?.(post.id);
      } else {
        console.error('Failed to toggle bookmark:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleShare = async (shareType: 'copy' | 'twitter' | 'linkedin') => {
    const postUrl = `${window.location.origin}/forum/posts/${post.slug}`;
    
    switch (shareType) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(postUrl);
          // Show success feedback (you could add a toast notification here)
          alert('Link copied to clipboard!');
        } catch (error) {
          console.error('Failed to copy to clipboard:', error);
        }
        break;
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.content.substring(0, 100) + '...')}`;
        window.open(twitterUrl, '_blank');
        break;
      case 'linkedin':
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        window.open(linkedinUrl, '_blank');
        break;
    }
    setShowShareMenu(false);
  };

  const handlePostVote = async (type: 'upvote' | 'downvote') => {
    if (!firebaseUser) {
      console.log('🔥 User not authenticated, cannot vote');
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${post.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: type.toUpperCase(),
          userId: firebaseUser.uid
        }),
        credentials: 'include'
      });

      if (response.ok) {
        // Force page refresh to show updated vote counts
        window.location.reload();
      } else {
        console.error('Failed to vote on post:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to vote on post:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-0.5 group">
      {/* Header */}
      <div className="flex items-start space-x-3 mb-4">
        {/* Company Logo as Main Avatar */}
        {!post.isAnonymous && post.author.company ? (
          <Link href={`/orgs/companies/${post.author.company.id}`} className="flex-shrink-0">
            {post.author.company.logoUrl ? (
              <img 
                src={post.author.company.logoUrl} 
                alt={post.author.company.name}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-blue-100 border border-gray-200 flex items-center justify-center">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
              </div>
            )}
          </Link>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 border border-gray-200 flex items-center justify-center">
            <span className="text-xl">
              {['🎯', '💡', '🚀', '🎨', '📊', '🔥', '⭐', '💎'][Math.floor(Math.random() * 8)]}
                </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Primary Display: Company/Agency + Category */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {!post.isAnonymous ? (
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {/* Primary Display - Prioritize Topics */}
                  {post.topicMentions && post.topicMentions.length > 0 ? (
                    // Display expandable topics
                    <div className="w-full">
                      <MultiTopicDisplay
                        topicMentions={post.topicMentions}
                        className="w-full"
                      />
                    </div>
                  ) : post.author.company ? (
                    // Fallback to company display when no topics
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/orgs/companies/${post.author.company.id}`}
                        className="font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors flex items-center space-x-1"
                      >
                        <span>{post.author.company.name}</span>
                        {post.author.company.verified && (
                          <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                        )}
                      </Link>
                      {/* Show Company @ Agency format if there are company mentions */}
                      {post.companyMentions && post.companyMentions.length > 0 && (
                        <>
                          <span className="text-gray-400 text-lg">@</span>
                          <Link
                            href={`/orgs/companies/${post.companyMentions[0].company.id}`}
                            className="font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                          >
                            <span>{post.companyMentions[0].company.name}</span>
                            {post.companyMentions[0].company.verified && (
                              <CheckBadgeIcon className="w-3 h-3 text-blue-500" />
                            )}
                          </Link>
                        </>
                      )}
                    </div>
                  ) : (
                    // Fallback to category when no company - NEVER show username as main header
                    <Link
                      href={`/forum?category=${post.category.slug}`}
                      className="font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors no-underline"
                    >
                      {post.category.name}
                    </Link>
                  )}
                  
                  {/* Show mentions count for legacy posts without topics */}
                  {(!post.topicMentions || post.topicMentions.length === 0) && ((post.companyMentions && post.companyMentions.length > 1) || (post.contactMentions && post.contactMentions.length > 0)) && (
                    <>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center space-x-1">
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          <BuildingOfficeIcon className="w-3 h-3 mr-1" />
                          {((post.companyMentions?.length || 0) - 1) + (post.contactMentions?.length || 0)} related
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href={`/forum?category=${post.category.slug}`}
                  className="font-semibold text-gray-900 text-lg hover:text-blue-600 transition-colors no-underline"
                >
                  {post.category.name}
                </Link>
              )}
            </div>
            <button 
              onClick={handleFollow}
              className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center space-x-1 ${
                isFollowing 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isFollowing ? (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Following</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Follow</span>
                </>
              )}
            </button>
          </div>
          
          {/* Category Only - Clean display */}
          <div className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
            <span>in</span>
            <span className="text-blue-600 font-medium">{post.category.name}</span>
          </div>
        </div>
          </div>

      {/* Engagement indicators only (no title) */}
      <div className="flex items-center justify-end mb-3">
        <div className="flex items-center space-x-2">
          {/* Trending indicator */}
          {post.views > 100 && (
            <div className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              <span>🔥</span>
              <span>Hot</span>
            </div>
          )}
          {/* New indicator */}
          {new Date(post.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>
        
      {/* Content preview with mentions - Dynamic based on post type */}
      <div className="text-gray-700 mb-4">
        {post.postType === 'list' && listItemsArray.length > 0 ? (
          <div className="space-y-2">
            {listItemsArray.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
            {listItemsArray.length > 3 && (
              <div className="text-gray-500 text-sm">+{listItemsArray.length - 3} more items</div>
            )}
          </div>
        ) : post.postType === 'poll' && pollChoicesArray.length > 0 ? (
          <div className="space-y-2">
            {pollChoicesArray.slice(0, 3).map((choice, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 border border-gray-200 rounded">
                <div className="w-4 h-4 border border-gray-300 rounded"></div>
                <span>{choice}</span>
              </div>
            ))}
            {pollChoicesArray.length > 3 && (
              <div className="text-gray-500 text-sm">+{pollChoicesArray.length - 3} more choices</div>
            )}
            {post.pollEndsAt && (
              <div className="text-xs text-gray-500 mt-2">
                Poll ends {formatDistanceToNow(new Date(post.pollEndsAt), { addSuffix: true })}
              </div>
            )}
          </div>
        ) : (
          <RichContentRenderer
            content={post.content}
            mentions={{
              companies: post.companyMentions?.map(cm => cm.company) || [],
              contacts: post.contactMentions?.map(cm => cm.contact) || []
            }}
          />
        )}
      </div>


      {/* Contact Mentions Section - Enhanced Display (only for legacy posts without topics) */}
      {(!post.topicMentions || post.topicMentions.length === 0) && post.contactMentions && post.contactMentions.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="text-sm text-gray-600 mb-2">few in house contacts</div>
          <div className="space-y-1">
            {post.contactMentions.slice(0, 2).map((mention, index) => (
              <div key={mention.contact.id} className="flex items-center space-x-2">
                <a 
                  href={`mailto:${mention.contact.email}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {mention.contact.email}
                </a>
                <span className="text-gray-500 text-sm">
                  - {mention.contact.title || 'Contact'}
                </span>
              </div>
              ))}
            {post.contactMentions.length > 2 && (
              <button className="text-blue-600 text-sm hover:text-blue-800">
                Read more
              </button>
          )}
        </div>
        </div>
      )}

      {/* User Attribution & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          {/* User Avatar who posted */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center border">
              <span className="text-xs">
                {['🎭', '👤', '🕶️', '🎪', '🎨', '🔮'][Math.floor(Math.random() * 6)]}
              </span>
            </div>
            <span className="text-sm text-gray-700">
              {post.isAnonymous ? post.anonymousHandle : post.author.name}
            </span>
            <span className="text-sm text-gray-600">•</span>
            <span className="text-sm text-gray-700">
              {formatDistanceToNow(new Date(post.createdAt))} ago
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`flex items-center space-x-1 transition-colors ${
              isBookmarked
                ? 'text-yellow-600 hover:text-yellow-700'
                : 'text-gray-700 hover:text-yellow-600'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
          >
            <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-yellow-500' : ''}`} />
            <span className="text-xs">{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          {/* Share Button */}
          <div className="relative">
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
              title="Share post"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="text-xs">Share</span>
            </button>
            
            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy link</span>
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span>Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn</span>
                </button>
              </div>
            )}
          </div>
        </div>

          {/* Real-time Votes */}
          <RealTimeVotes
            postId={post.id}
            initialUpvotes={post.upvotes}
            initialDownvotes={post.downvotes}
            onVote={handlePostVote}
            userVote={userVote}
          />
      </div>

      {/* Enhanced Comment Box */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div>
          {/* Enhanced Comment Input */}
          <div>
            <div className="relative">
              <textarea
                value={commentText}
                onChange={(e) => {
                  const value = e.target.value;
                  setCommentText(value);
                  
                  // Auto-expand
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                  
                  // Topic @mention detection for two-tiered system
                  const lastWord = value.split(' ').pop() || '';
                  if (lastWord.startsWith('@') && lastWord.length > 1) {
                    const query = lastWord.slice(1);
                    setMentionQuery(query);
                    setShowMentions(true);
                    
                    // Fetch topic suggestions from API
                    if (query.length >= 2) {
                      fetch(`/api/forum/mentions/topics?q=${encodeURIComponent(query)}`)
                        .then(res => res.json())
                        .then(data => {
                          setMentionSuggestions((data.topics || []).map(topic => ({
                            name: topic.name,
                            type: 'topic',
                            description: topic.description
                          })));
                        })
                        .catch(() => {
                          // Fallback to mock suggestions
                          setMentionSuggestions([
                            { name: 'Programmatic', type: 'topic', description: 'Automated advertising' },
                            { name: 'CTV', type: 'topic', description: 'Connected TV' },
                            { name: 'Retail Media', type: 'topic', description: 'Retail advertising' }
                          ].filter(topic => topic.name.toLowerCase().includes(query.toLowerCase())));
                        });
                    }
                  } else {
                    setShowMentions(false);
                  }
                }}
                placeholder="Add a comment... Use @topic to mention categories"
                className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-900 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                rows={2}
                disabled={submittingComment}
                style={{ minHeight: '60px', maxHeight: '150px' }}
              />
              
              {/* Topic Mention Suggestions */}
              {showMentions && mentionSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                  {mentionSuggestions.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const words = commentText.split(' ');
                        words[words.length - 1] = `@${topic.name}`;
                        setCommentText(words.join(' ') + ' ');
                        setShowMentions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <TagIcon className="w-3 h-3 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{topic.name}</div>
                        <div className="text-xs text-gray-500">{topic.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {/* Quick reactions */}
              {!commentText && (
                <div className="absolute right-3 top-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {['👍', '💡', '🔥', '🎯'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setCommentText(emoji + ' ')}
                      className="text-lg hover:scale-125 transition-transform"
                      title="Quick reaction"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center space-x-4">
                <label className="flex items-center text-xs text-gray-700">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4 rounded border-gray-300 focus:ring-blue-500"
                    checked={commentAnonymous}
                    onChange={(e) => setCommentAnonymous(e.target.checked)}
                    disabled={submittingComment}
                  />
                  Anonymous
                </label>
                <span className="text-xs text-gray-600">
                  {commentText.length}/500
                </span>
              </div>
              
              <button 
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submittingComment || commentText.length > 500}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 hover:shadow-md"
              >
                {submittingComment ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <span>Comment</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Comments Section */}
      {expandable && expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Discussion ({post._count.comments})
            </h4>
            
            {commentsLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-100 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {comment.isAnonymous ? (
                        <AvatarDisplay
                          avatarId={comment.anonymousAvatarId}
                          username={comment.anonymousHandle || 'Anonymous'}
                          size={32}
                        />
                      ) : currentUserIdentity && comment.author.name === 'Christopher Wong' ? (
                        <AvatarDisplay
                          avatarId={currentUserIdentity.avatarId}
                          username={currentUserIdentity.username}
                          size={32}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.isAnonymous
                                ? (comment.anonymousHandle || 'Anonymous User')
                                : (comment.author.name || 'Unknown User')
                              }
                            </span>
                            <span className="text-xs text-gray-700">
                              {formatDistanceToNow(new Date(comment.createdAt))} ago
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-800">
                          {comment.content}
                        </div>
                        
                        {/* Comment Actions */}
                        <div className="flex items-center space-x-4 mt-2 pt-2 border-t border-gray-200">
                          {/* Vote buttons */}
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => handleCommentVote(comment.id, 'up')}
                              className={`flex items-center space-x-1 text-xs transition-colors ${
                                commentVotes[comment.id] === 'up'
                                  ? 'text-blue-600'
                                  : 'text-gray-700 hover:text-blue-600'
                              }`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                              <span>{comment.upvotes || 0}</span>
                            </button>
                            <button 
                              onClick={() => handleCommentVote(comment.id, 'down')}
                              className={`flex items-center space-x-1 text-xs transition-colors ${
                                commentVotes[comment.id] === 'down'
                                  ? 'text-red-600'
                                  : 'text-gray-700 hover:text-red-600'
                              }`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              <span>{comment.downvotes || 0}</span>
                            </button>
                          </div>
                          
                          {/* Reply button */}
                          <button 
                            onClick={() => handleReply(comment.id, comment.isAnonymous ? comment.anonymousHandle : comment.author.name)}
                            className="text-xs text-gray-700 hover:text-blue-600 transition-colors"
                          >
                            Reply
                          </button>
                        </div>
        </div>

                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 ml-6 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                          <div className="flex space-x-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your reply..."
                              className="flex-1 p-2 border border-gray-200 rounded text-sm resize-none"
                              rows={2}
                            />
                          </div>
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="px-3 py-1 text-xs text-gray-700 hover:text-gray-900"
                            >
                              Cancel
                            </button>
        <button
                              onClick={handleSubmitReply}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
        >
                              Reply
        </button>
      </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700 italic">No comments yet. Be the first to comment!</p>
            )}
          </div>


        </div>
      )}
    </div>
  );
}

// MultiTopicDisplay component - Clean, modern UX focused on simplicity
function MultiTopicDisplay({
  topicMentions,
  className = ''
}: {
  topicMentions: any[],
  className?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!topicMentions || topicMentions.length === 0) return null;

  const primaryTopic = topicMentions[0];
  const hasMultipleTopics = topicMentions.length > 1;
  const remainingTopics = topicMentions.slice(1);

  return (
    <div className={`${className}`}>
      {/* Clean Topic Display */}
      <div className="flex items-center gap-2">
        {/* Primary Topic Name - Large, Clickable, Clean */}
        <Link
          href={`/forum?topic=${encodeURIComponent(primaryTopic.topic.name)}`}
          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 no-underline"
        >
          {primaryTopic.topic.name}
        </Link>

        {/* Minimal Expansion Indicator */}
        {hasMultipleTopics && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 font-medium"
          >
            +{remainingTopics.length} more
          </button>
        )}
      </div>

      {/* Simple Expanded List */}
      {isExpanded && hasMultipleTopics && (
        <div className="mt-3 space-y-1 animate-in slide-in-from-top-1 duration-200">
          {remainingTopics.map((tm, index) => (
            <div key={tm.topic.id}>
              <Link
                href={`/forum?topic=${encodeURIComponent(tm.topic.name)}`}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 no-underline font-medium"
              >
                {tm.topic.name}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 