'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  ChatBubbleLeftIcon,
  BookmarkIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon
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
}

export function ForumPostCard({ post, onVote, onBookmark, userVote }: ForumPostCardProps) {
  const urgencyColors = {
    LOW: 'text-gray-500',
    MEDIUM: 'text-blue-500', 
    HIGH: 'text-orange-500',
    URGENT: 'text-red-700'
  };

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start space-x-3 mb-2">
            {/* Author Avatar & Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {/* Author Name */}
                <span className="text-sm font-medium text-gray-900">
                  {post.isAnonymous ? post.anonymousHandle : post.author.name}
                </span>
                
                {/* Company Affiliation */}
                {!post.isAnonymous && post.author.company && (
                  <Link 
                    href={`/orgs/companies/${post.author.company.id}`}
                    className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {post.author.company.logoUrl ? (
                      <img 
                        src={post.author.company.logoUrl} 
                        alt={post.author.company.name}
                        className="w-4 h-4 rounded-sm object-cover"
                      />
                    ) : (
                      <BuildingOfficeIcon className="w-4 h-4" />
                    )}
                    <span className="font-medium">{post.author.company.name}</span>
                    {post.author.company.verified && (
                      <CheckBadgeIcon className="w-3 h-3 text-blue-500" />
                    )}
                  </Link>
                )}
              </div>
              
              {/* Badges Row */}
              <div className="flex items-center space-x-2">
                {/* Category */}
                <span 
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
                >
                  {post.category.name}
                </span>
                
                {/* Urgency Badge */}
                <span className={`px-2 py-1 rounded text-xs font-medium ${urgencyColors[post.urgency]}`}>
                  {urgencyLabels[post.urgency]}
                </span>
                
                {/* Time */}
                <span className="text-xs text-gray-500 flex items-center space-x-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
          
          {/* Content preview with mentions */}
          <div className="text-gray-600 line-clamp-3 mb-3">
            <MentionDisplayReact content={post.content} showIcons={false} />
          </div>

          {/* Companies Mentioned Section */}
          {post.companyMentions && post.companyMentions.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Companies Mentioned
              </h4>
              <div className="flex flex-wrap gap-2">
                {post.companyMentions.map((mention, index) => (
                  <Link
                    key={index}
                    href={`/orgs/companies/${mention.company.id}`}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs transition-colors"
                  >
                    {mention.company.logoUrl ? (
                      <img 
                        src={mention.company.logoUrl} 
                        alt={mention.company.name}
                        className="w-4 h-4 rounded-sm object-cover"
                      />
                    ) : (
                      <BuildingOfficeIcon className="w-4 h-4" />
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
        </div>
        
        {/* Pinned indicator */}
        {post.isPinned && (
          <div className="text-yellow-500 ml-2">
            📌
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          {/* Time */}
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>
          
          {/* Location */}
          {post.location && (
            <div className="flex items-center space-x-1">
              <MapPinIcon className="w-4 h-4" />
              <span>{post.location}</span>
            </div>
          )}
          
          {/* Deal Size */}
          {post.dealSize && (
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
              {dealSizeLabels[post.dealSize]}
            </span>
          )}

          {/* Media Types */}
          {mediaTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {mediaTypes.map((type: string) => (
                <span 
                  key={type}
                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                >
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Views */}
        <span>{post.views} views</span>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map((tag: string) => (
            <span 
              key={tag}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {/* Real-time Votes */}
          <RealTimeVotes
            postId={post.id}
            initialUpvotes={post.upvotes}
            initialDownvotes={post.downvotes}
            onVote={onVote ? (type) => onVote(post.id, type) : () => {}}
            userVote={userVote}
          />

          {/* Comments */}
          <Link 
            href={`/forum/posts/${post.slug}#comments`}
            className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ChatBubbleLeftIcon className="w-4 h-4" />
            <span className="text-sm">{post._count.comments} comments</span>
          </Link>
        </div>

        {/* Bookmark */}
        <button
          onClick={() => onBookmark?.(post.id)}
          className="flex items-center space-x-1 text-gray-500 hover:text-yellow-600 transition-colors"
        >
          <BookmarkIcon className="w-4 h-4" />
          <span className="text-sm">Save</span>
        </button>
      </div>
    </div>
  );
} 