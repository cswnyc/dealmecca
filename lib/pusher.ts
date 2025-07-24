import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
export const pusherServer = process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET && process.env.PUSHER_CLUSTER
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    })
  : null;

// Client-side Pusher instance
export const pusherClient = process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER 
  ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    })
  : null;

// Event types for type safety
export const PUSHER_EVENTS = {
  NEW_POST: 'new-post',
  NEW_COMMENT: 'new-comment',
  POST_UPDATED: 'post-updated',
  VOTE_UPDATED: 'vote-updated',
  USER_TYPING: 'user-typing',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  URGENT_ALERT: 'urgent-alert',
  NEW_NOTIFICATION: 'new-notification',
} as const;

// Channel names
export const PUSHER_CHANNELS = {
  FORUM_GENERAL: 'forum-general',
  FORUM_POST: (postId: string) => `forum-post-${postId}`,
  USER_NOTIFICATIONS: (userId: string) => `user-${userId}`,
  URGENT_ALERTS: 'urgent-alerts',
} as const; 