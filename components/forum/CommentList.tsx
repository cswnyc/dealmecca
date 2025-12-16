'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { MentionDisplayReact } from './MentionDisplay';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import { useFirebaseAuth } from '@/lib/auth/firebase-auth';

interface ForumComment {
  id: string;
  content: string;
  isAnonymous: boolean;
  anonymousHandle?: string;
  anonymousAvatarId?: string;
  depth: number;
  upvotes: number;
  downvotes: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    publicHandle?: string;
    anonymousUsername?: string;
    company?: {
      id: string;
      name: string;
      logoUrl?: string;
    };
  };
  parent?: {
    id: string;
    author: {
      name: string;
    };
  };
  replies?: ForumComment[];
  _count?: {
    replies: number;
  };
}

interface CommentListProps {
  comments: ForumComment[];
  onReply?: (commentId: string) => void;
  onVote?: (commentId: string, type: 'upvote' | 'downvote') => void;
  maxDepth?: number;
}

interface CommentItemProps {
  comment: ForumComment;
  onReply?: (commentId: string) => void;
  onVote?: (commentId: string, type: 'upvote' | 'downvote') => void;
  maxDepth?: number;
}

function CommentItem({ comment, onReply, onVote, maxDepth = 5 }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [currentUserIdentity, setCurrentUserIdentity] = useState<{username: string, avatarId: string} | null>(null);
  const { user: firebaseUser } = useFirebaseAuth();

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

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (isVoting || !onVote) return;
    
    setIsVoting(true);
    try {
      await onVote(comment.id, type);
    } finally {
      setIsVoting(false);
    }
  };

  const indentClass = comment.depth > 0
    ? `ml-${Math.min(comment.depth * 4, 16)} border-l-2 border-border pl-4`
    : '';

  if (comment.isDeleted) {
    return (
      <div className={`py-2 ${indentClass}`}>
        <div className="text-muted-foreground italic text-sm">
          [This comment has been deleted]
        </div>
      </div>
    );
  }


  return (
    <div className={`${indentClass}`}>
      <div className="bg-card rounded-lg p-4 mb-3 border border-border">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
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
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Author Info */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-foreground">
                  {comment.isAnonymous
                    ? (comment.anonymousHandle || 'Anonymous')
                    : (comment.author.anonymousUsername || comment.author.publicHandle || 'User')
                  }
                </span>

                {!comment.isAnonymous && comment.author.company && (
                  <Link
                    href={`/orgs/companies/${comment.author.company.id}`}
                    className="flex items-center space-x-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {comment.author.company.logoUrl ? (
                      <img
                        src={comment.author.company.logoUrl}
                        alt={comment.author.company.name}
                        className="w-3 h-3 rounded-sm object-cover"
                      />
                    ) : (
                      <BuildingOfficeIcon className="w-3 h-3" />
                    )}
                    <span>{comment.author.company.name}</span>
                  </Link>
                )}
              </div>

              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                {comment.parent && (
                  <span>
                    replying to <span className="font-medium">{comment.parent.author.name}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comment Content */}
        <div className="mb-3">
          <MentionDisplayReact content={comment.content} />
        </div>

        {/* Comment Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Voting */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleVote('upvote')}
                disabled={isVoting}
                className="flex items-center space-x-1 px-2 py-1 rounded text-sm text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                <HandThumbUpIcon className="w-4 h-4" />
                <span>{comment.upvotes}</span>
              </button>

              <button
                onClick={() => handleVote('downvote')}
                disabled={isVoting}
                className="flex items-center space-x-1 px-2 py-1 rounded text-sm text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <HandThumbDownIcon className="w-4 h-4" />
                <span>{comment.downvotes}</span>
              </button>
            </div>

            {/* Reply Button */}
            {comment.depth < maxDepth && onReply && (
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center space-x-1 px-2 py-1 rounded text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Replies Toggle */}
          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onVote={onVote}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentList({ comments, onReply, onVote, maxDepth = 5 }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No comments yet</h3>
        <p className="text-muted-foreground">Be the first to share your thoughts on this discussion.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onVote={onVote}
          maxDepth={maxDepth}
        />
      ))}
    </div>
  );
}
