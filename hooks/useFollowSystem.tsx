'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';
// Using simple alerts for now - can be upgraded to toast later
const toast = {
  success: (message: string) => alert(`✅ ${message}`),
  error: (message: string) => alert(`❌ ${message}`)
};

interface UseFollowSystemProps {
  targetId: string;
  targetType: 'company' | 'contact';
  initialIsFollowing?: boolean;
  initialIsFavorite?: boolean;
  initialFollowerCount?: number;
}

export function useFollowSystem({
  targetId,
  targetType,
  initialIsFollowing = false,
  initialIsFavorite = false,
  initialFollowerCount = 0
}: UseFollowSystemProps) {
  const { user: firebaseUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFollow = useCallback(async () => {
    if (!session) {
      toast.error('Please sign in to follow');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/orgs/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId,
          targetType,
          action: isFollowing ? 'unfollow' : 'follow'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
        toast.success(
          data.action === 'follow' 
            ? `Following ${targetType}!`
            : `Unfollowed ${targetType}`
        );
      } else {
        throw new Error(data.error || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Follow error:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  }, [session, targetId, targetType, isFollowing]);

  const toggleFavorite = useCallback(async () => {
    if (!session) {
      toast.error('Please sign in to favorite');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/orgs/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId,
          targetType,
          action: isFavorite ? 'unfavorite' : 'favorite'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsFavorite(data.isFavorite);
        toast.success(
          data.action === 'favorite' 
            ? `Added to favorites!`
            : `Removed from favorites`
        );
      } else {
        throw new Error(data.error || 'Failed to update favorite status');
      }
    } catch (error) {
      console.error('Favorite error:', error);
      toast.error('Failed to update favorite status');
    } finally {
      setIsLoading(false);
    }
  }, [session, targetId, targetType, isFavorite]);

  const fetchFollowStatus = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/orgs/follow?targetId=${targetId}&targetType=${targetType}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
      }
    } catch (error) {
      console.error('Failed to fetch follow status:', error);
    }
  }, [targetId, targetType]);

  const fetchFavoriteStatus = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/orgs/favorites?targetId=${targetId}&targetType=${targetType}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Failed to fetch favorite status:', error);
    }
  }, [targetId, targetType]);

  return {
    isFollowing,
    isFavorite,
    followerCount,
    isLoading,
    toggleFollow,
    toggleFavorite,
    fetchFollowStatus,
    fetchFavoriteStatus
  };
}