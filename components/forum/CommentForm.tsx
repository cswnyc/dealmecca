'use client';

import { useState } from 'react';
import { useFirebaseAuth } from '@/lib/auth/firebase-auth';
import { useUser } from '@/hooks/useUser';
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
  const { user: firebaseUser, loading: authLoading } = useFirebaseAuth();
  const { user: backendUser, loading: backendLoading } = useUser();

  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isAuthenticated = Boolean(firebaseUser || backendUser);
  const isLoading = authLoading || backendLoading;

  if (!isLoading && !isAuthenticated) {
    return (
      <div className={`bg-muted rounded-lg p-6 text-center ${className}`}>
        <UserIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground mb-4">Please sign in to join the discussion</p>
        <button
          onClick={() => window.location.href = '/auth/signin'}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
      // Check if user is signed in (either Firebase or LinkedIn via Firebase custom token)
      if (!firebaseUser && !backendUser) {
        throw new Error('Please sign in to comment');
      }

      // Make authenticated request using authedFetch
      const { authedFetch } = await import('@/lib/authedFetch');
      const response = await authedFetch(`/api/forum/posts/${postSlug}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content: content.trim(),
          parentId,
          isAnonymous,
        }),
      });

      // Parse response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to post comment');
      }

      console.log('✅ Comment posted successfully:', data);

      // Reset form
      setContent('');
      setIsAnonymous(false);
      setError('');

      // Notify parent component
      if (onCommentCreated) {
        onCommentCreated();
      }
    } catch (error: any) {
      console.error('❌ Failed to post comment:', error);

      // User-friendly error messages
      let errorMessage = 'Failed to post comment';

      if (error?.message === 'not_signed_in') {
        errorMessage = 'Please sign in to comment';
      } else if (error?.message?.includes('authentication') || error?.message?.includes('token')) {
        errorMessage = 'Session expired - please sign in again';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReply = Boolean(parentId);

  return (
    <div className={`bg-card rounded-lg border border-border p-4 ${className}`}>
      {/* Reply Context */}
      {isReply && parentAuthor && (
        <div className="mb-3 text-sm text-muted-foreground">
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
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/30">
            {error}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Anonymous Toggle */}
            <label className="flex items-center space-x-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                disabled={isSubmitting}
                className="rounded border-border text-primary focus:ring-ring"
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
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="mt-3 text-xs text-muted-foreground">
        <p>
          Use @company or @contact to mention organizations or people.
          {isAnonymous && ' Your identity will be hidden when posting anonymously.'}
        </p>
      </div>
    </div>
  );
}
