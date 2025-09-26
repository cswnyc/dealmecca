'use client';

import { useState } from 'react';
import { useFirebaseSession } from '@/hooks/useFirebaseSession';
import { useAuth } from '@/lib/auth/firebase-auth';
import { 
  PaperAirplaneIcon,
  EyeSlashIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { MentionTextarea } from './MentionTextarea';

interface CommentFormProps {
  postSlug: string;
  parentId?: string;
  parentAuthor?: string;
  onCommentCreated?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
}

export function CommentForm({ 
  postSlug, 
  parentId, 
  parentAuthor,
  onCommentCreated, 
  onCancel,
  placeholder = "Share your thoughts...",
  className = ""
}: CommentFormProps) {
  const hasFirebaseSession = useFirebaseSession();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!firebaseUser) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <UserIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-gray-600 mb-4">Please sign in to join the discussion</p>
        <button
          onClick={() => window.location.href = '/auth/signin'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Get user profile to get the user ID and anonymous handle
      const userResponse = await fetch('/api/users/profile');
      const userData = await userResponse.json();

      // Get anonymous identity if posting anonymously
      let anonymousHandle = null;
      let anonymousAvatarId = null;
      if (isAnonymous) {
        const identityResponse = await fetch(`/api/users/identity?firebaseUid=${firebaseUser.uid}`);
        const identityData = await identityResponse.json();
        anonymousHandle = identityData.currentUsername;
        anonymousAvatarId = identityData.currentAvatarId;
      }

      const response = await fetch(`/api/forum/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          parentId,
          authorId: userData.id,
          isAnonymous,
          anonymousHandle,
          anonymousAvatarId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post comment');
      }

      // Reset form
      setContent('');
      setIsAnonymous(false);
      setError('');

      // Notify parent component
      if (onCommentCreated) {
        onCommentCreated();
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReply = Boolean(parentId);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Reply Context */}
      {isReply && parentAuthor && (
        <div className="mb-3 text-sm text-gray-600">
          <span>Replying to <span className="font-medium">{parentAuthor}</span></span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Comment Content */}
        <div>
          <MentionTextarea
            value={content}
            onChange={setContent}
            placeholder={isReply ? `Reply to ${parentAuthor}...` : placeholder}
            rows={isReply ? 3 : 4}
            disabled={isSubmitting}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Anonymous Toggle */}
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                disabled={isSubmitting}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <EyeSlashIcon className="w-4 h-4" />
              <span>Post anonymously</span>
            </label>
          </div>

          <div className="flex items-center space-x-3">
            {/* Cancel Button (for replies) */}
            {isReply && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Posting...' : isReply ? 'Reply' : 'Comment'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-3 text-xs text-gray-500">
        <p>
          Use @company or @contact to mention organizations or people. 
          {isAnonymous && ' Your identity will be hidden when posting anonymously.'}
        </p>
      </div>
    </div>
  );
}
