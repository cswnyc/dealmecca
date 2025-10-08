'use client';

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/lib/auth/firebase-auth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ForumLayout } from '@/components/layout/ForumLayout';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: string | any;
}

export default function NotificationsPage() {
  const { user: firebaseUser, idToken, loading: authLoading } = useFirebaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (firebaseUser && idToken && !authLoading) {
      fetchNotifications();
    }
  }, [firebaseUser, idToken, authLoading]);

  const fetchNotifications = async () => {
    if (!firebaseUser || !idToken) return;

    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        setError('Failed to load notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!firebaseUser || !idToken) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true })
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!firebaseUser || !idToken) return;

    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />;
      case 'like':
        return <HeartIcon className="w-5 h-5 text-red-500" />;
      case 'bookmark':
        return <BookmarkIcon className="w-5 h-5 text-green-500" />;
      case 'follow':
        return <CheckCircleIcon className="w-5 h-5 text-purple-500" />;
      case 'mention':
        return <ExclamationCircleIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <ForumLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ForumLayout>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthGuard>
      <ForumLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <BellIcon className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-600 mb-6">
                You'll see notifications here when people interact with your posts or mention you.
              </p>
              <button
                onClick={() => window.location.href = '/forum'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Forum
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    notification.isRead
                      ? 'bg-white border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                    // Navigate to related post if available
                    try {
                      const metadata = typeof notification.metadata === 'string'
                        ? JSON.parse(notification.metadata)
                        : notification.metadata;

                      if (metadata?.postId) {
                        window.location.href = `/forum/posts/${metadata.postId}`;
                      }
                    } catch (e) {
                      console.error('Error parsing notification metadata:', e);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          notification.isRead ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      <p className={`text-sm mt-1 ${
                        notification.isRead ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ForumLayout>
    </AuthGuard>
  );
}