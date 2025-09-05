'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/react';
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
import { RealTimeVotes } from './RealTimeVotes';
import { MentionDisplayReact } from './MentionDisplay';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  isAnonymous: boolean;
  anonymousHandle?: string;
  tags: string;
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
  const [tagsExpanded, setTagsExpanded] = useState(false);

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
  const { data: session } = useSession();
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

  // Safe parsing for tags - handle various formats
  const safeParseTags = (tagsData: any): string[] => {
    if (!tagsData) return [];
    
    // If already an array, return it
    if (Array.isArray(tagsData)) return tagsData;
    
    // If it's a string, try different parsing methods
    if (typeof tagsData === 'string') {
      // First try JSON parsing
      try {
        const parsed = JSON.parse(tagsData);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // If JSON parsing fails, try comma-separated parsing
        return tagsData.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }
    
    return [];
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

  const tags = safeParseTags(post.tags);
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
    
    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/forum/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText.trim(),
          isAnonymous: commentAnonymous,
          authorId: session?.user?.id,
          anonymousHandle: commentAnonymous ? `User${Math.floor(Math.random() * 1000)}` : null
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
      // Use session user ID or create anonymous user ID
      const userId = session?.user?.id || 'anonymous-user-' + Math.random().toString(36).substr(2, 9);
      
      const response = await fetch(`/api/forum/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voteType,
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
          authorId: session?.user?.id,
          anonymousHandle: `User${Math.floor(Math.random() * 1000)}`
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
          {/* Primary Display: Company/Agency + Tags */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {!post.isAnonymous ? (
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {/* Primary Company Display - Most Prominent */}
                  {post.author.company ? (
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
                    // Fallback to author name when no company
                    <span className="font-semibold text-gray-900 text-lg">
                      {post.author.name}
                    </span>
                  )}
                  
                  {/* Enhanced Tag Display */}
                  {(post.companyMentions && post.companyMentions.length > 1) || tags.length > 0 ? (
                    <>
                      <span className="text-gray-400">+</span>
                      <div className="flex items-center space-x-1">
                        {/* Additional Company Mentions (after first one used in @ format) */}
                        {post.companyMentions && post.companyMentions.slice(1, 3).map((mention, index) => (
                          <Link
                            key={mention.company.id}
                            href={`/orgs/companies/${mention.company.id}`}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors"
                          >
                            {mention.company.logoUrl ? (
                              <img 
                                src={mention.company.logoUrl} 
                                alt={`${mention.company.name} logo`}
                                className="w-3 h-3 rounded object-cover"
                              />
                            ) : (
                              <BuildingOfficeIcon className="w-3 h-3" />
                            )}
                            <span>{mention.company.name}</span>
                          </Link>
                        ))}
                        
                        {/* Custom Tags */}
                        {tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors">
                            <TagIcon className="w-3 h-3" />
                            <span>{tag}</span>
                          </span>
                        ))}
                        
                        {/* Expandable "more" indicator */}
                        {(post.companyMentions && post.companyMentions.length > 3) || tags.length > 2 || (post.contactMentions && post.contactMentions.length > 0) ? (
                          <button 
                            onClick={() => setTagsExpanded(!tagsExpanded)}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors"
                          >
                            {tagsExpanded ? '- less' : `+ ${Math.max(0, ((post.companyMentions?.length || 0) - 3) + Math.max(0, (tags.length - 2)) + (post.contactMentions?.length || 0))} more`}
                          </button>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              ) : (
                <span className="font-semibold text-gray-900 text-lg">
                  {post.anonymousHandle}
                </span>
              )}
            </div>
          
          {/* Expanded Tags Section - Enhanced UX */}
          {tagsExpanded && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl border border-blue-100/50">
              <div className="space-y-4">
                {/* Companies Section */}
                {post.companyMentions && post.companyMentions.slice(3).length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-medium text-blue-800">Additional Companies</h4>
                      <div className="flex-1 h-px bg-blue-200"></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.companyMentions.slice(3).map((mention) => (
                        <Link
                          key={mention.company.id}
                          href={`/orgs/companies/${mention.company.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-all duration-200 hover:shadow-sm border border-blue-100"
                        >
                          {mention.company.logoUrl ? (
                            <img 
                              src={mention.company.logoUrl} 
                              alt={`${mention.company.name} logo`}
                              className="w-3 h-3 rounded object-cover"
                            />
                          ) : (
                            <BuildingOfficeIcon className="w-3 h-3" />
                          )}
                          <span className="font-medium">{mention.company.name}</span>
                          {mention.company.verified && (
                            <CheckBadgeIcon className="w-3 h-3 text-blue-500" />
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Contacts Section */}
                {post.contactMentions && post.contactMentions.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <UserIcon className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-medium text-blue-800">Key Contacts</h4>
                      <div className="flex-1 h-px bg-blue-200"></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.contactMentions.map((mention) => (
                        <Link
                          key={mention.contact.id}
                          href={`/orgs/contacts/${mention.contact.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-all duration-200 hover:shadow-sm border border-blue-100"
                        >
                          <UserIcon className="w-3 h-3" />
                          <span className="font-medium">{mention.contact.fullName}</span>
                          {mention.contact.title && (
                            <span className="text-blue-600 text-xs">• {mention.contact.title}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Tags Section */}
                {tags.slice(2).length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <TagIcon className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-medium text-blue-800">Additional Tags</h4>
                      <div className="flex-1 h-px bg-blue-200"></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.slice(2).map((tag, index) => (
                        <span key={index} className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-all duration-200 border border-blue-100">
                          <TagIcon className="w-3 h-3" />
                          <span className="font-medium">{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collapse Button */}
                <div className="pt-2 border-t border-blue-200/50">
                  <button 
                    onClick={() => setTagsExpanded(false)}
                    className="w-full text-center py-2 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    ↑ Show less
                  </button>
                </div>
              </div>
            </div>
          )}
            <button className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors flex items-center space-x-1">
              <span>Follow</span>
            </button>
          </div>
          
          {/* Categories */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span>in</span>
            <span className="text-blue-600">{post.category.name}</span>
            {tags.length > 0 && (
              <>
                <span>,</span>
                <span className="text-blue-600">{tags.slice(0, 2).join(', ')}</span>
                {tags.length > 2 && <span>+{tags.length - 2} more</span>}
              </>
            )}
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
          <MentionDisplayReact content={post.content} showIcons={false} />
        )}
      </div>

      {/* Contact Mentions Section - Enhanced Display */}
      {post.contactMentions && post.contactMentions.length > 0 && (
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
            <span className="text-sm text-gray-600">
              {post.isAnonymous ? post.anonymousHandle : post.author.name.split(' ')[0]} 
            </span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt))} ago
            </span>
          </div>

          {/* Bookmark */}
          <button
            onClick={() => onBookmark?.(post.id)}
            className="flex items-center space-x-1 text-gray-500 hover:text-yellow-600 transition-colors"
          >
            <BookmarkIcon className="w-4 h-4" />
          </button>

          {/* Share/Actions Icon */}
          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>

          {/* Real-time Votes */}
          <RealTimeVotes
            postId={post.id}
            initialUpvotes={post.upvotes}
            initialDownvotes={post.downvotes}
            onVote={onVote ? (type) => onVote(post.id, type) : () => {}}
            userVote={userVote}
          />
      </div>

      {/* Enhanced Comment Box */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex space-x-3">
          {/* Anonymous User Avatar with hover effect */}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border border-gray-200 hover:scale-105 transition-transform cursor-pointer">
            <span className="text-sm font-medium text-gray-600">
              {Math.random() > 0.5 ? '👤' : '🎭'}
            </span>
          </div>
          
          {/* Enhanced Comment Input */}
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={commentText}
                onChange={(e) => {
                  const value = e.target.value;
                  setCommentText(value);
                  
                  // Auto-expand
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                  
                  // Simple @mention detection
                  const lastWord = value.split(' ').pop() || '';
                  if (lastWord.startsWith('@') && lastWord.length > 1) {
                    setMentionQuery(lastWord.slice(1));
                    setShowMentions(true);
                    // Mock suggestions for now
                    setMentionSuggestions([
                      { name: 'John Doe', company: 'Nike' },
                      { name: 'Jane Smith', company: 'Adidas' },
                      { name: 'Mike Johnson', company: 'Pepsi' }
                    ].filter(user => user.name.toLowerCase().includes(lastWord.slice(1).toLowerCase())));
                  } else {
                    setShowMentions(false);
                  }
                }}
                placeholder="Add a comment... Use @username to mention someone"
                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                rows={2}
                disabled={submittingComment}
                style={{ minHeight: '60px', maxHeight: '150px' }}
              />
              
              {/* Mention Suggestions */}
              {showMentions && mentionSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                  {mentionSuggestions.map((user, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const words = commentText.split(' ');
                        words[words.length - 1] = `@${user.name}`;
                        setCommentText(words.join(' ') + ' ');
                        setShowMentions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs">👤</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.company}</div>
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
                <label className="flex items-center text-xs text-gray-600">
                  <input 
                    type="checkbox" 
                    className="mr-2 w-4 h-4 rounded border-gray-300 focus:ring-blue-500" 
                    checked={commentAnonymous}
                    onChange={(e) => setCommentAnonymous(e.target.checked)}
                    disabled={submittingComment}
                  />
                  Anonymous
                </label>
                <span className="text-xs text-gray-400">
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
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center border">
                      <span className="text-xs">
                        {['🎭', '👤', '🕶️', '🎪', '🎨', '🔮'][Math.floor(Math.random() * 6)]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {comment.isAnonymous ? comment.anonymousHandle : comment.author.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt))} ago
                            </span>
                          </div>
                        </div>
                        <MentionDisplayReact content={comment.content} showIcons={false} />
                        
                        {/* Comment Actions */}
                        <div className="flex items-center space-x-4 mt-2 pt-2 border-t border-gray-200">
                          {/* Vote buttons */}
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => handleCommentVote(comment.id, 'up')}
                              className={`flex items-center space-x-1 text-xs transition-colors ${
                                commentVotes[comment.id] === 'up' 
                                  ? 'text-blue-600' 
                                  : 'text-gray-500 hover:text-blue-600'
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
                                  : 'text-gray-500 hover:text-red-600'
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
                            className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            Reply
                          </button>
                          
                          {/* Share button */}
                          <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                            Share
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
                              className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
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
              <p className="text-sm text-gray-500 italic">No comments yet. Be the first to comment!</p>
            )}
          </div>


        </div>
      )}
    </div>
  );
} 