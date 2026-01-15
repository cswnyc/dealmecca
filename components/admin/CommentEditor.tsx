'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Save,
  X,
  User,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Eye,
  EyeOff,
  UserX
} from 'lucide-react';
import MentionEditor from '@/components/ui/MentionEditor';
import { authedFetch } from '@/lib/authedFetch';
import MentionText from '@/components/ui/MentionText';

interface Author {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;
  isAnonymous: boolean;
  anonymousHandle?: string;
  upvotes: number;
  downvotes: number;
  isModerated?: boolean;
  moderationReason?: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  replies?: Comment[];
  _count: {
    replies: number;
  };
}

interface CommentEditorProps {
  comment: Comment;
  onUpdate: (updatedComment: Comment) => void;
  onDelete: (commentId: string) => void;
  level?: number;
  maxLevel?: number;
}

export default function CommentEditor({
  comment,
  onUpdate,
  onDelete,
  level = 0,
  maxLevel = 3
}: CommentEditorProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editAnonymous, setEditAnonymous] = useState(comment.isAnonymous);
  const [editAnonymousHandle, setEditAnonymousHandle] = useState(comment.anonymousHandle || '');
  const [editModerated, setEditModerated] = useState(comment.isModerated || false);
  const [editModerationReason, setEditModerationReason] = useState(comment.moderationReason || '');
  const [saving, setSaving] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  // Reset edit state when comment changes
  useEffect(() => {
    setEditContent(comment.content);
    setEditAnonymous(comment.isAnonymous);
    setEditAnonymousHandle(comment.anonymousHandle || '');
    setEditModerated(comment.isModerated || false);
    setEditModerationReason(comment.moderationReason || '');
  }, [comment]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await authedFetch(`/api/admin/forum/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
          isAnonymous: editAnonymous,
          anonymousHandle: editAnonymous ? editAnonymousHandle : null,
          isModerated: editModerated,
          moderationReason: editModerated ? editModerationReason : null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      const updatedComment = await response.json();
      onUpdate(updatedComment);
      setIsEditing(false);

    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await authedFetch(`/api/admin/forum/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      onDelete(comment.id);

    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setEditAnonymous(comment.isAnonymous);
    setEditAnonymousHandle(comment.anonymousHandle || '');
    setEditModerated(comment.isModerated || false);
    setEditModerationReason(comment.moderationReason || '');
    setIsEditing(false);
  };

  const displayName = comment.isAnonymous
    ? (comment.anonymousHandle || 'Anonymous User')
    : (comment.author.name || comment.author.email);

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={`border-l-2 ${level > 0 ? 'border-border ml-4 pl-4' : 'border-transparent'}`}>
      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {comment.author.profileImage && !comment.isAnonymous ? (
              <img
                src={comment.author.profileImage}
                alt={displayName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                comment.isAnonymous ? 'bg-muted' : 'bg-primary/10'
              }`}>
                {comment.isAnonymous ? (
                  <UserX className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {displayName}
                {comment.isAnonymous && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground">
                    Anonymous
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleString()}
                {comment.updatedAt !== comment.createdAt && (
                  <span className="ml-1">(edited)</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Comment Content */}
            <div className="mb-3">
              {isEditing ? (
                <div className="space-y-3">
                  <MentionEditor
                    value={editContent}
                    onChange={(value) => setEditContent(value)}
                    placeholder="Edit comment content..."
                    multiline={true}
                    className="min-h-[100px]"
                  />

                  {/* Anonymous Settings */}
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editAnonymous}
                        onChange={(e) => setEditAnonymous(e.target.checked)}
                        className="rounded border-border text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-foreground">Anonymous Comment</span>
                    </label>

                    {editAnonymous && (
                      <input
                        type="text"
                        value={editAnonymousHandle}
                        onChange={(e) => setEditAnonymousHandle(e.target.value)}
                        placeholder="Anonymous handle (optional)"
                        className="text-sm border border-border rounded px-2 py-1"
                      />
                    )}
                  </div>

                  {/* Moderation Settings */}
                  <div className="border-t pt-3">
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={editModerated}
                        onChange={(e) => setEditModerated(e.target.checked)}
                        className="rounded border-border text-destructive shadow-sm focus:border-destructive focus:ring focus:ring-destructive/20 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-foreground">Mark as Moderated</span>
                    </label>

                    {editModerated && (
                      <input
                        type="text"
                        value={editModerationReason}
                        onChange={(e) => setEditModerationReason(e.target.value)}
                        placeholder="Moderation reason"
                        className="w-full text-sm border border-border rounded px-2 py-1"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-foreground">
                  {comment.isModerated ? (
                    <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                      <div className="flex items-center space-x-2 text-destructive mb-1">
                        <Flag className="w-4 h-4" />
                        <span className="text-sm font-medium">Moderated Content</span>
                      </div>
                      {comment.moderationReason && (
                        <p className="text-xs text-destructive/80 mb-2">
                          Reason: {comment.moderationReason}
                        </p>
                      )}
                      <div className="text-muted-foreground italic">
                        <MentionText>{comment.content}</MentionText>
                      </div>
                    </div>
                  ) : (
                    <MentionText>{comment.content}</MentionText>
                  )}
                </div>
              )}
            </div>

            {/* Comment Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{comment.upvotes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsDown className="w-3 h-3" />
                  <span>{comment.downvotes}</span>
                </div>
                {hasReplies && (
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{comment._count.replies} replies</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span>ID: {comment.id}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {hasReplies && (
                  <button
                    onClick={() => setShowReplies(!showReplies)}
                    className="text-xs px-2 py-1 bg-muted text-foreground rounded hover:bg-muted/80"
                  >
                    {showReplies ? (
                      <><EyeOff className="w-3 h-3 inline mr-1" />Hide Replies</>
                    ) : (
                      <><Eye className="w-3 h-3 inline mr-1" />Show {comment._count.replies} Replies</>
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="text-xs px-3 py-1 bg-muted text-foreground rounded hover:bg-muted/80 disabled:opacity-50"
                    >
                      <X className="w-3 h-3 inline mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !editContent.trim()}
                      className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Save className="w-3 h-3 inline mr-1" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Edit className="w-3 h-3 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-xs px-3 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
                    >
                      <Trash2 className="w-3 h-3 inline mr-1" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Replies */}
      {isExpanded && showReplies && hasReplies && level < maxLevel && (
        <div className="ml-4">
          {comment.replies?.map((reply) => (
            <CommentEditor
              key={reply.id}
              comment={reply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              level={level + 1}
              maxLevel={maxLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
}