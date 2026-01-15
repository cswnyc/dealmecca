'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict, formatDistanceToNow } from 'date-fns';
import { useFirebaseAuth } from '@/lib/auth/firebase-auth';
import {
  ChatBubbleLeftIcon,
  BookmarkIcon,
  CheckBadgeIcon,
  TagIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { 
  User, 
  MessageCircle, 
  Bookmark, 
  Share2,
  Building2
} from 'lucide-react';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import { RichContentRenderer } from './RichContentRenderer';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  // Primary topic fields
  primaryTopicType?: string;
  primaryTopicId?: string;
  primaryTopic?: {
    id: string;
    name: string;
    type: string;
    logoUrl?: string;
    verified?: boolean;
    description?: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
    anonymousUsername?: string;
    publicHandle?: string;
    avatarSeed?: string;
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
      city?: string;
      state?: string;
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
      categoryId?: string;
      category?: {
        id: string;
        name: string;
        slug: string;
        color?: string;
      };
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
  onBookmark?: (postId: string) => void;
  expandable?: boolean;
}

export function ForumPostCard({ post, onBookmark, expandable = false }: ForumPostCardProps) {
  const [expanded, setExpanded] = useState(expandable);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [currentUserIdentity, setCurrentUserIdentity] = useState<{username: string, avatarId: string} | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showTopicsDropdown, setShowTopicsDropdown] = useState(false);
  // Poll state
  const [pollResults, setPollResults] = useState<{
    voteCounts: Record<number, number>;
    percentages: Record<number, number>;
    totalVotes: number;
    userVote: number | null;
    hasEnded: boolean;
  } | null>(null);
  const [pollLoading, setPollLoading] = useState(false);
  const [pollVoting, setPollVoting] = useState(false);
  const [pollNotice, setPollNotice] = useState<string | null>(null);

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

  // Firebase authentication
  const { user: firebaseUser, idToken, loading: authLoading, refreshToken } = useFirebaseAuth();

  // Derive hero company for the header
  const getHeroCompany = () => {
    // Check if primaryTopic is a company
    if (post.primaryTopic && post.primaryTopicType && 
        ['company', 'agency', 'advertiser', 'publisher', 'dsp_ssp', 'adtech', 'industry'].includes(post.primaryTopicType)) {
      return {
        id: post.primaryTopicId || '',
        name: post.primaryTopic.name,
        logoUrl: post.primaryTopic.logoUrl,
        verified: post.primaryTopic.verified || false,
        companyType: post.primaryTopicType,
        city: undefined,
        state: undefined,
      };
    }
    
    // Fallback to first company mention
    if (post.companyMentions && post.companyMentions.length > 0) {
      return post.companyMentions[0].company;
    }
    
    // Fallback to author's company
    if (!post.isAnonymous && post.author.company) {
      return post.author.company;
    }
    
    return null;
  };

  const heroCompany = getHeroCompany();

  // Build additional topics list for dropdown
  const getAdditionalTopics = () => {
    const topics: Array<{
      type: 'company' | 'contact' | 'topic' | 'category';
      id: string;
      name: string;
      context?: string;
      logoUrl?: string;
      verified?: boolean;
      slug?: string;
      companyType?: string;
      title?: string;
      companyName?: string;
    }> = [];

    // Add remaining company mentions (excluding hero company)
    const heroCompanyId = heroCompany?.id;
    post.companyMentions?.forEach((cm) => {
      if (cm.company.id !== heroCompanyId) {
        topics.push({
          type: 'company',
          id: cm.company.id,
          name: cm.company.name,
          logoUrl: cm.company.logoUrl,
          verified: cm.company.verified,
          companyType: cm.company.companyType,
          context: cm.company.city && cm.company.state ? `${cm.company.city}, ${cm.company.state}` : undefined
        });
      }
    });

    // Add all contact mentions
    post.contactMentions?.forEach((cm) => {
      topics.push({
        type: 'contact',
        id: cm.contact.id,
        name: cm.contact.fullName,
        title: cm.contact.title,
        companyName: cm.contact.company?.name,
        context: cm.contact.company ? `on ${cm.contact.company.name}` : undefined
      });
    });

    // Add topic mentions (including categories)
    post.topicMentions?.forEach((tm) => {
      // If it's a category topic, add as category
      if (tm.topic.context === 'category' && tm.topic.category) {
        topics.push({
          type: 'category',
          id: tm.topic.category.id,
          name: tm.topic.category.name,
          slug: tm.topic.category.slug,
          context: 'Category'
        });
      } else {
        // Regular topic
        topics.push({
          type: 'topic',
          id: tm.topic.id,
          name: tm.topic.name,
          context: tm.topic.description || tm.topic.context
        });
      }
    });

    return topics;
  };

  const additionalTopics = getAdditionalTopics();

  // Get company initials for fallback logo
  const getCompanyInitials = (name: string): string => {
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join('');
  };

  // Format company meta line
  const getCompanyMetaLine = (company: any): string => {
    const parts: string[] = [];
    
    if (company.companyType) {
      const typeLabel = company.companyType.replace(/_/g, ' ');
      parts.push(typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1));
    }
    
    if (company.city && company.state) {
      parts.push(`${company.city}, ${company.state}`);
    } else if (company.city) {
      parts.push(company.city);
    } else if (company.state) {
      parts.push(company.state);
    }
    
    return parts.join(' • ');
  };


  // Auto-load comments when expandable
  useEffect(() => {
    if (expandable && comments.length === 0 && !commentsLoading) {
      fetchComments();
    }
  }, [expandable]);

  // Fetch follow and bookmark status
  useEffect(() => {
    const fetchFollowAndBookmarkStatus = async () => {
      if (!firebaseUser || !idToken) return;

      try {
        // Fetch follow status
        const followResponse = await fetch(`/api/forum/posts/${post.id}/follow`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        if (followResponse.ok) {
          const followData = await followResponse.json();
          setIsFollowing(followData.isFollowing);
        }

        // Fetch bookmark status
        const bookmarkResponse = await fetch(`/api/forum/posts/${post.id}/bookmark`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        if (bookmarkResponse.ok) {
          const bookmarkData = await bookmarkResponse.json();
          setIsBookmarked(bookmarkData.isBookmarked);
        }
      } catch (error) {
        console.error('Failed to fetch follow/bookmark status:', error);
      }
    };

    fetchFollowAndBookmarkStatus();
  }, [firebaseUser, idToken, post.id]);

  // Fetch current user's anonymous identity for their own comments
  useEffect(() => {
    const fetchCurrentUserIdentity = async () => {
      if (firebaseUser?.uid) {
        try {
          const response = await fetch(`/api/users/identity?firebaseUid=${firebaseUser.uid}`);
          if (response.ok) {
            const data = await response.json();
            if (data.currentUsername && data.currentAvatarId) {
              setCurrentUserIdentity({
                username: data.currentUsername,
                avatarId: data.currentAvatarId
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user identity:', error);
        }
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

  // Fetch poll results for poll posts
  useEffect(() => {
    const fetchPollResults = async () => {
      if (post.postType !== 'poll') return;

      setPollLoading(true);
      try {
        const headers: Record<string, string> = {};
        if (idToken) {
          headers['Authorization'] = `Bearer ${idToken}`;
        }

        const response = await fetch(`/api/forum/posts/${post.id}/poll-results`, { headers });
        if (response.ok) {
          const data = await response.json();
          setPollResults({
            voteCounts: data.voteCounts || {},
            percentages: data.percentages || {},
            totalVotes: data.totalVotes || 0,
            userVote: data.userVote,
            hasEnded: data.hasEnded || false,
          });
        }
      } catch (error) {
        console.error('Failed to fetch poll results:', error);
      } finally {
        setPollLoading(false);
      }
    };

    fetchPollResults();
  }, [post.id, post.postType, idToken]);

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

    const anonymousHandle = commentAnonymous ? (currentUserIdentity?.username || 'Anonymous User') : null;
    const anonymousAvatarId = commentAnonymous ? (currentUserIdentity?.avatarId || 'avatar_1') : null;

    try {
      const { authedFetch } = await import('@/lib/authedFetch');
      const response = await authedFetch(`/api/forum/posts/${post.id}/comments`, {
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

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo(commentId);
    setReplyText(`@${authorName} `);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !replyingTo) return;

    try {
      const { authedFetch } = await import('@/lib/authedFetch');
      const response = await authedFetch(`/api/forum/posts/${post.id}/comments`, {
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
    if (!firebaseUser || !idToken) {
      return;
    }

    try {
      let token = idToken;
      let response = await fetch(`/api/forum/posts/${post.id}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: firebaseUser.uid,
          follow: !isFollowing
        }),
      });

      // If token expired, refresh and retry once
      if (response.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          token = newToken;
          response = await fetch(`/api/forum/posts/${post.id}/follow`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: firebaseUser.uid,
              follow: !isFollowing
            }),
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(!isFollowing);
      } else {
        const errorText = await response.text();
        console.error('Failed to toggle follow:', response.status, errorText);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const handleBookmark = async () => {
    if (!firebaseUser || !idToken) {
      return;
    }

    try {
      let token = idToken;
      let response = await fetch(`/api/forum/posts/${post.id}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: firebaseUser.uid,
          bookmark: !isBookmarked
        }),
        credentials: 'include'
      });

      // If token expired, refresh and retry once
      if (response.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          token = newToken;
          response = await fetch(`/api/forum/posts/${post.id}/bookmark`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: firebaseUser.uid,
              bookmark: !isBookmarked
            }),
            credentials: 'include'
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(!isBookmarked);
        onBookmark?.(post.id);
      } else {
        const errorText = await response.text();
        console.error('Failed to toggle bookmark:', response.status, errorText);
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

  const handlePollVote = async (choiceIndex: number) => {
    if (!firebaseUser || !idToken) {
      setPollNotice('Please sign in to vote.');
      return;
    }

    if (pollResults?.hasEnded) {
      setPollNotice('This poll has ended.');
      return;
    }

    if (pollVoting) return;

    setPollNotice(null);
    setPollVoting(true);
    try {
      const response = await fetch(`/api/forum/posts/${post.id}/vote-poll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ choiceIndex }),
      });

      if (response.ok) {
        const data = await response.json();
        setPollResults({
          voteCounts: data.voteCounts || {},
          percentages: {},
          totalVotes: data.totalVotes || 0,
          userVote: data.userVote,
          hasEnded: pollResults?.hasEnded || false,
        });

        // Recalculate percentages
        const newPercentages: Record<number, number> = {};
        pollChoicesArray.forEach((_, index) => {
          newPercentages[index] = data.totalVotes > 0
            ? Math.round((data.voteCounts[index] / data.totalVotes) * 100)
            : 0;
        });
        setPollResults(prev => prev ? { ...prev, percentages: newPercentages } : null);
      } else {
        console.error('Failed to vote');
        setPollNotice('Failed to vote. Please try again.');
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      setPollNotice('Failed to vote. Please try again.');
    } finally {
      setPollVoting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer">
      {/* Company Header (Optional - only when heroCompany exists) */}
      {heroCompany && (
        <div className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-950 dark:to-violet-950 p-4 border-b border-blue-100 dark:border-blue-900">
          <div className="flex items-center gap-3">
            {/* Company Logo */}
            <Link href={`/orgs/companies/${heroCompany.id}`} className="flex-shrink-0">
              {heroCompany.logoUrl ? (
                <img
                  src={heroCompany.logoUrl}
                  alt={heroCompany.name}
                  className="w-12 h-12 rounded-xl shadow-sm object-cover"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}
                >
                  <span className="text-base font-bold text-white">
                    {getCompanyInitials(heroCompany.name)}
                  </span>
                </div>
              )}
            </Link>

            {/* Company Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link 
                  href={`/orgs/companies/${heroCompany.id}`}
                  className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {heroCompany.name}
                </Link>
                {additionalTopics.length > 0 && (
                  <DropdownMenu open={showTopicsDropdown} onOpenChange={setShowTopicsDropdown}>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTopicsDropdown(!showTopicsDropdown);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium cursor-pointer"
                      >
                        + {additionalTopics.length} more
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-blue-600">
                          {additionalTopics.length} more topic{additionalTopics.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="py-2">
                        {additionalTopics.map((topic, index) => {
                          let href = '';
                          if (topic.type === 'company') {
                            href = `/orgs/companies/${topic.id}`;
                          } else if (topic.type === 'contact') {
                            href = `/contacts/${topic.id}`;
                          } else if (topic.type === 'category') {
                            href = `/forum?category=${topic.slug}`;
                          } else if (topic.type === 'topic') {
                            href = `/forum?topic=${encodeURIComponent(topic.name)}`;
                          }

                          return (
                            <Link
                              key={`${topic.type}-${topic.id}-${index}`}
                              href={href}
                              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Avatar */}
                              {topic.type === 'company' && (
                                topic.logoUrl ? (
                                  <img src={topic.logoUrl} alt={topic.name} className="w-8 h-8 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                                    {getCompanyInitials(topic.name)}
                                  </div>
                                )
                              )}
                              {topic.type === 'contact' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                                  {topic.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              {(topic.type === 'topic' || topic.type === 'category') && (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                                  {topic.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{topic.name}</p>
                                {topic.context && (
                                  <p className="text-xs text-gray-500 truncate">{topic.context}</p>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {getCompanyMetaLine(heroCompany) && (
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  {getCompanyMetaLine(heroCompany)}
                </div>
              )}
            </div>

            {/* Follow Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFollow();
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isFollowing
                  ? 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      )}

      {/* Category Bar */}
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <Link 
          href={`/forum?category=${post.category.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}
          />
          {post.category.name}
        </Link>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {/* Post Content */}
        {post.postType === 'poll' && pollChoicesArray.length > 0 ? (
          <div className="space-y-3">
            {/* Poll Question */}
            {post.content && (
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium mb-4">
                {post.content}
              </div>
            )}

            {pollNotice && (
              <p className="text-sm text-red-600 dark:text-red-400" role="status">
                {pollNotice}
              </p>
            )}

              {/* Loading state */}
              {pollLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
              <>
                {/* Poll Choices */}
                {pollChoicesArray.map((choice, index) => {
                  const percentage = pollResults?.percentages[index] || 0;
                  const voteCount = pollResults?.voteCounts[index] || 0;
                  const isUserVote = pollResults?.userVote === index;
                  const hasEnded = pollResults?.hasEnded || false;

                  return (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!hasEnded) handlePollVote(index);
                      }}
                      disabled={hasEnded || pollVoting}
                      className={`relative w-full text-left transition-all ${
                        !hasEnded && !pollVoting
                          ? 'cursor-pointer hover:shadow-md'
                          : 'cursor-not-allowed'
                      }`}
                    >
                      {/* Background bar */}
                      <div
                        className={`absolute inset-0 rounded-lg transition-all ${
                          isUserVote ? 'bg-blue-200 dark:bg-blue-900' : 'bg-blue-100 dark:bg-blue-950'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>

                      {/* Content */}
                      <div className="relative flex items-center justify-between px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-800 dark:text-gray-200 font-medium">{choice}</span>
                          {isUserVote && (
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">{percentage}%</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">({voteCount})</span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Poll metadata */}
                <div className="text-sm text-gray-500 dark:text-gray-400 pt-2">
                  {pollResults?.hasEnded ? (
                    <>
                      <span className="font-medium">Final results</span>
                      {' · '}
                      <span>{pollResults.totalVotes} votes</span>
                      {post.pollEndsAt && (
                        <>
                          {' · '}
                          <span>Poll ended {formatDistanceToNow(new Date(post.pollEndsAt), { addSuffix: true })}</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{pollResults?.totalVotes || 0} votes</span>
                      {post.pollEndsAt && (
                        <>
                          {' · '}
                          <span>Ends {formatDistanceToNow(new Date(post.pollEndsAt), { addSuffix: true })}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ) : post.postType === 'list' && listItemsArray.length > 0 ? (
          <div className="space-y-2">
            {listItemsArray.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
            <RichContentRenderer
              content={post.content}
              mentions={{
                companies: post.companyMentions?.map(cm => cm.company) || [],
                contacts: post.contactMentions?.map(cm => cm.contact) || []
              }}
              className="[&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:font-medium [&_a]:hover:underline [&_a]:cursor-pointer"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          {/* Left side: Author info */}
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <AvatarDisplay
              avatarId={post.author.avatarSeed}
              username={post.isAnonymous 
                ? (post.anonymousHandle || post.author.anonymousUsername || 'Anonymous')
                : (post.author.anonymousUsername || post.author.publicHandle || post.author.name || 'Member')}
              size={16}
            />
            <span>
              {post.isAnonymous
                ? (post.anonymousHandle || post.author.anonymousUsername || 'Anonymous')
                : (post.author.anonymousUsername || post.author.publicHandle || post.author.name || 'Member')}
            </span>
            <span>•</span>
            <span>{formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-1">
            {/* Comment Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleComments();
              }}
              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" />
              {post._count.comments > 0 && (
                <span className="text-xs">{post._count.comments}</span>
              )}
            </button>

            {/* Save Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBookmark();
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950'
                  : 'text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Share Button */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShareMenu(!showShareMenu);
                }}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Share Menu */}
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare('copy');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy link</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare('twitter');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare('linkedin');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
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
        </div>
      </div>

      {/* Inline Comment Composer (restyled to match Variation F) */}
      {expandable && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800">
          <div className="mt-4">
            <div className="relative">
              <textarea
                value={commentText}
                onChange={(e) => {
                  const value = e.target.value;
                  setCommentText(value);
                  
                  // Auto-expand
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                  
                  // Topic @mention detection
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
                          setMentionSuggestions([]);
                        });
                    }
                  } else {
                    setShowMentions(false);
                  }
                }}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                rows={2}
                disabled={submittingComment}
                style={{ minHeight: '60px', maxHeight: '150px' }}
              />
              
              {/* Mention Suggestions */}
              {showMentions && mentionSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                  {mentionSuggestions.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const words = commentText.split(' ');
                        words[words.length - 1] = `@${topic.name}`;
                        setCommentText(words.join(' ') + ' ');
                        setShowMentions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <TagIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{topic.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{topic.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center space-x-4">
                <label className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                    checked={commentAnonymous}
                    onChange={(e) => setCommentAnonymous(e.target.checked)}
                    disabled={submittingComment}
                  />
                  Anonymous
                </label>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {commentText.length}/500
                </span>
              </div>

              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submittingComment || commentText.length > 500}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
      )}

      {/* Expanded Comments Section (restyled to match Variation F) */}
      {expandable && expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800">
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Discussion ({post._count.comments})
            </h4>
            
            {commentsLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length > 0 ? (
              <>
                {comments.length > 1 && !showAllComments && (
                  <button
                    onClick={() => setShowAllComments(true)}
                    className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-4 transition-colors"
                  >
                    <ChevronDownIcon className="w-4 h-4" />
                    <span>See all {comments.length} comments</span>
                  </button>
                )}

                {showAllComments && (
                  <button
                    onClick={() => setShowAllComments(false)}
                    className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-4 transition-colors"
                  >
                    <ChevronUpIcon className="w-4 h-4" />
                    <span>Hide comments</span>
                  </button>
                )}

                <div className="space-y-3">
                  {(showAllComments ? comments : comments.slice(0, 1)).map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <AvatarDisplay
                          avatarId={comment.author?.avatarSeed}
                          username={comment.isAnonymous 
                            ? (comment.anonymousHandle || 'Anonymous')
                            : (comment.author?.anonymousUsername || comment.author?.name || 'User')}
                          size={32}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {comment.isAnonymous
                                  ? (comment.anonymousHandle || 'Anonymous')
                                  : (comment.author?.anonymousUsername || comment.author?.name || 'User')
                                }
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-800 dark:text-gray-200">
                            {comment.content}
                          </div>

                          {/* Comment Actions */}
                          <div className="flex items-center space-x-4 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => handleReply(comment.id, comment.isAnonymous ? comment.anonymousHandle : comment.author.name)}
                              className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              Reply
                            </button>
                          </div>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 ml-6 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-300 dark:border-blue-700">
                            <div className="flex space-x-2">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your reply..."
                                className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded text-sm resize-none text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800"
                                rows={2}
                              />
                            </div>
                            <div className="flex justify-end space-x-2 mt-2">
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSubmitReply}
                                className="px-3 py-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs rounded hover:opacity-90"
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
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
