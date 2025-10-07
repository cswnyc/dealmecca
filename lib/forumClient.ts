'use client';

import { authedFetch } from '@/lib/authedFetch';

/**
 * Client-side helper functions for forum API operations.
 * All functions use authedFetch to automatically attach Firebase ID tokens.
 */

// ──────────────────────────────────────────────────────────────────
// Posts
// ──────────────────────────────────────────────────────────────────

export interface CreatePostPayload {
  content: string;
  categoryId?: string;
  tags?: string;
  isAnonymous?: boolean;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dealSize?: string;
  location?: string;
  mediaType?: 'text' | 'image' | 'video' | 'link';
}

export interface UpdatePostPayload {
  content?: string;
  categoryId?: string;
  tags?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dealSize?: string;
  location?: string;
}

/**
 * Create a new forum post
 */
export async function createPost(payload: CreatePostPayload) {
  const response = await authedFetch('/api/forum/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

/**
 * Update an existing post
 */
export async function updatePost(postId: string, payload: UpdatePostPayload) {
  const response = await authedFetch(`/api/forum/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

/**
 * Delete a post
 */
export async function deletePost(postId: string) {
  const response = await authedFetch(`/api/forum/posts/${postId}`, {
    method: 'DELETE',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

// ──────────────────────────────────────────────────────────────────
// Comments
// ──────────────────────────────────────────────────────────────────

export interface CreateCommentPayload {
  content: string;
  parentId?: string | null;
  isAnonymous?: boolean;
}

/**
 * Add a comment to a post
 */
export async function addComment(postId: string, payload: CreateCommentPayload) {
  const response = await authedFetch(`/api/forum/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
  const response = await authedFetch(`/api/forum/comments/${commentId}`, {
    method: 'DELETE',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

// ──────────────────────────────────────────────────────────────────
// Voting
// ──────────────────────────────────────────────────────────────────

/**
 * Vote on a post (UPVOTE or DOWNVOTE)
 * Clicking the same vote type again will remove the vote
 */
export async function votePost(postId: string, type: 'UPVOTE' | 'DOWNVOTE') {
  const response = await authedFetch(`/api/forum/posts/${postId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ type }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

// ──────────────────────────────────────────────────────────────────
// Following
// ──────────────────────────────────────────────────────────────────

/**
 * Follow a post
 */
export async function followPost(postId: string) {
  const response = await authedFetch(`/api/forum/posts/${postId}/follow`, {
    method: 'POST',
    body: JSON.stringify({ follow: true }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

/**
 * Unfollow a post
 */
export async function unfollowPost(postId: string) {
  const response = await authedFetch(`/api/forum/posts/${postId}/follow`, {
    method: 'DELETE',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

// ──────────────────────────────────────────────────────────────────
// Bookmarking
// ──────────────────────────────────────────────────────────────────

/**
 * Bookmark a post
 */
export async function bookmarkPost(postId: string) {
  const response = await authedFetch(`/api/forum/posts/${postId}/bookmark`, {
    method: 'POST',
    body: JSON.stringify({ bookmark: true }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

/**
 * Remove bookmark from a post
 */
export async function unbookmarkPost(postId: string) {
  const response = await authedFetch(`/api/forum/posts/${postId}/bookmark`, {
    method: 'DELETE',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}
