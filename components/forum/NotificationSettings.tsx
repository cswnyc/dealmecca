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
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {permission === 'granted' ? (
            <BellIcon className="w-5 h-5 text-green-500" />
          ) : (
            <BellSlashIcon className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <h4 className="font-medium text-foreground">Live Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Get instant alerts for urgent opportunities
            </p>
          </div>
        </div>

        {permission !== 'granted' && (
          <button
            onClick={handleEnableNotifications}
            disabled={loading}
            className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Enabling...' : 'Enable'}
          </button>
        )}
      </div>
    </div>
  );
} 