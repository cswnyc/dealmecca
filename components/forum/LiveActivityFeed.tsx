'use client';

import { useState, useEffect } from 'react';
import { pusherClient, PUSHER_EVENTS, PUSHER_CHANNELS } from '@/lib/pusher';
import { formatDistanceToNow } from 'date-fns';
import { 
  FireIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftIcon, 
  BellIcon 
} from '@heroicons/react/24/outline';

interface ActivityItem {
  id: string;
  type: 'new_post' | 'new_comment' | 'urgent_alert';
  title: string;
  description: string;
  timestamp: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!pusherClient) return;

    // Subscribe to general forum channel
    const forumChannel = pusherClient.subscribe(PUSHER_CHANNELS.FORUM_GENERAL);
    const urgentChannel = pusherClient.subscribe(PUSHER_CHANNELS.URGENT_ALERTS);

    // Connection status
    pusherClient.connection.bind('connected', () => {
      setIsConnected(true);
    });

    pusherClient.connection.bind('disconnected', () => {
      setIsConnected(false);
    });

    // New post handler
    forumChannel.bind(PUSHER_EVENTS.NEW_POST, (data: any) => {
      const newActivity: ActivityItem = {
        id: data.post.id,
        type: 'new_post',
        title: data.post.title,
        description: `New post in ${data.post.category.name}`,
        timestamp: data.timestamp,
        urgency: data.post.urgency,
        category: data.post.category.name
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10
    });

    // Urgent alerts handler
    urgentChannel.bind(PUSHER_EVENTS.URGENT_ALERT, (data: any) => {
      const urgentActivity: ActivityItem = {
        id: `urgent-${data.post.id}`,
        type: 'urgent_alert',
        title: data.message,
        description: `Urgent opportunity posted`,
        timestamp: data.timestamp,
        urgency: 'URGENT'
      };

      setActivities(prev => [urgentActivity, ...prev.slice(0, 9)]);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('🚨 Urgent Deal Alert', {
          body: data.post.title,
          icon: '/icons/icon-192x192.png'
        });
      }
    });

    return () => {
      forumChannel.unbind_all();
      urgentChannel.unbind_all();
      if (pusherClient) {
        pusherClient.unsubscribe(PUSHER_CHANNELS.FORUM_GENERAL);
        pusherClient.unsubscribe(PUSHER_CHANNELS.URGENT_ALERTS);
      }
    };
  }, []);

  const getActivityIcon = (type: string, urgency?: string) => {
    if (urgency === 'URGENT') return <FireIcon className="w-4 h-4 text-red-700" />;
    
    switch (type) {
      case 'new_post':
        return <DocumentTextIcon className="w-4 h-4 text-blue-500" />;
      case 'new_comment':
        return <ChatBubbleLeftIcon className="w-4 h-4 text-green-500" />;
      case 'urgent_alert':
        return <BellIcon className="w-4 h-4 text-red-700" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Live Activity</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type, activity.urgency)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                  {activity.urgency === 'URGENT' && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      URGENT
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 