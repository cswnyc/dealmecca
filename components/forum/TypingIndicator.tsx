'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { pusherClient, PUSHER_EVENTS, PUSHER_CHANNELS } from '@/lib/pusher';
import { debounce } from 'lodash';

interface TypingUser {
  id: string;
  name: string;
  isAnonymous: boolean;
  anonymousHandle?: string;
}

interface TypingIndicatorProps {
  postId: string;
}

export function TypingIndicator({ postId }: TypingIndicatorProps) {
  const { data: session } = useSession();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  // Debounced function to stop typing indicator
  const debouncedStopTyping = useCallback(
    debounce(async () => {
      if (session?.user) {
        await fetch(`/api/forum/posts/${postId}/typing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isTyping: false })
        });
      }
    }, 2000),
    [postId, session]
  );

  useEffect(() => {
    if (!pusherClient) return;

    const channel = pusherClient.subscribe(PUSHER_CHANNELS.FORUM_POST(postId));

    channel.bind(PUSHER_EVENTS.USER_TYPING, (data: any) => {
      if (data.user.id === session?.user?.id) return; // Don't show own typing

      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.id !== data.user.id);
        
        if (data.isTyping) {
          return [...filtered, data.user];
        } else {
          return filtered;
        }
      });

      // Auto-remove typing indicator after 5 seconds
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.id !== data.user.id));
        }, 5000);
      }
    });

    return () => {
      channel.unbind_all();
      if (pusherClient) {
        pusherClient.unsubscribe(PUSHER_CHANNELS.FORUM_POST(postId));
      }
    };
  }, [postId, session]);

  if (typingUsers.length === 0) return null;

  const displayNames = typingUsers.map(user => 
    user.isAnonymous ? user.anonymousHandle : user.name
  ).filter(Boolean);

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
      <span>
        {displayNames.length === 1 
          ? `${displayNames[0]} is typing...`
          : displayNames.length === 2
          ? `${displayNames[0]} and ${displayNames[1]} are typing...`
          : `${displayNames[0]} and ${displayNames.length - 1} others are typing...`
        }
      </span>
    </div>
  );
}

// Export the handleTyping function for use in comment forms
export const useTypingIndicator = (postId: string) => {
  const { data: session } = useSession();
  
  const debouncedStopTyping = useCallback(
    debounce(async () => {
      if (session?.user) {
        await fetch(`/api/forum/posts/${postId}/typing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isTyping: false })
        });
      }
    }, 2000),
    [postId, session]
  );

  const handleTyping = async () => {
    if (session?.user) {
      await fetch(`/api/forum/posts/${postId}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTyping: true })
      });
      
      debouncedStopTyping();
    }
  };

  return { handleTyping };
}; 