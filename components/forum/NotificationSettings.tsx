'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';

export function NotificationSettings() {
  const { permission, requestPermission, isSupported } = useNotifications();
  const [loading, setLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setLoading(true);
    await requestPermission();
    setLoading(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {permission === 'granted' ? (
            <BellIcon className="w-5 h-5 text-green-500" />
          ) : (
            <BellSlashIcon className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <h4 className="font-medium text-gray-900">Live Notifications</h4>
            <p className="text-sm text-gray-500">
              Get instant alerts for urgent opportunities
            </p>
          </div>
        </div>
        
        {permission !== 'granted' && (
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Enabling...' : 'Enable'}
          </button>
        )}
      </div>
    </div>
  );
} 