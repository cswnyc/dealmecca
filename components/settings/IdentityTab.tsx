'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import AvatarSelector from './AvatarSelector';
import UsernameSelector from './UsernameSelector';
import { useAuth } from '@/lib/auth/firebase-auth';
import { getAvatarById } from '@/lib/avatar-library';

interface IdentityData {
  currentUsername?: string;
  currentAvatarId?: string;
  availableAvatars: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export default function IdentityTab() {
  // Try to get Firebase auth, but handle errors gracefully
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    console.log('Firebase auth not available, using LinkedIn-only authentication');
  }

  const [identityData, setIdentityData] = useState<IdentityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkedinSession, setLinkedinSession] = useState<any>(null);

  // Form state
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  // Check for LinkedIn session on mount
  useEffect(() => {
    try {
      const linkedinSessionData = localStorage.getItem('linkedin-session');
      if (linkedinSessionData) {
        const sessionData = JSON.parse(linkedinSessionData);
        if (sessionData.exp && Date.now() < sessionData.exp) {
          setLinkedinSession(sessionData);
          console.log('IdentityTab: LinkedIn session found:', sessionData);
        }
      }
    } catch (error) {
      console.log('IdentityTab: Invalid LinkedIn session data');
    }
  }, []);

  // Fetch current identity data
  useEffect(() => {
    if (user?.uid || linkedinSession) {
      fetchIdentityData();
    }
  }, [user?.uid, linkedinSession]);

  const fetchIdentityData = async () => {
    setLoading(true);
    setError(null);

    try {
      let apiUrl = '';

      // Determine which authentication method to use
      if (user?.uid) {
        // Firebase user
        apiUrl = `/api/users/identity?firebaseUid=${user.uid}`;
      } else if (linkedinSession?.firebaseUid) {
        // LinkedIn user with Firebase UID equivalent
        apiUrl = `/api/users/identity?firebaseUid=${linkedinSession.firebaseUid}`;
      } else if (linkedinSession?.email) {
        // LinkedIn user with email
        apiUrl = `/api/users/identity?email=${encodeURIComponent(linkedinSession.email)}`;
      } else if (linkedinSession?.userId) {
        // LinkedIn user with LinkedIn ID
        apiUrl = `/api/users/identity?linkedinId=${linkedinSession.userId}`;
      } else {
        setError('No valid authentication found');
        setLoading(false);
        return;
      }

      console.log('IdentityTab: Fetching identity data from:', apiUrl);
      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        setIdentityData(data);
        setSelectedUsername(data.currentUsername || '');
        setSelectedAvatarId(data.currentAvatarId || '');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load identity data');
      }
    } catch (err) {
      console.error('Error fetching identity data:', err);
      setError('Failed to load identity data');
    } finally {
      setLoading(false);
    }
  };

  // Track changes
  useEffect(() => {
    if (identityData) {
      const usernameChanged = selectedUsername !== (identityData.currentUsername || '');
      const avatarChanged = selectedAvatarId !== (identityData.currentAvatarId || '');
      setHasChanges(usernameChanged || avatarChanged);
    }
  }, [selectedUsername, selectedAvatarId, identityData]);

  const handleSave = async () => {
    if ((!user?.uid && !linkedinSession) || !hasChanges) return;

    setSaving(true);
    setError(null);

    try {
      let requestBody: any = {
        anonymousUsername: selectedUsername || undefined,
        avatarId: selectedAvatarId || undefined,
      };

      // Add appropriate user identifier
      if (user?.uid) {
        requestBody.firebaseUid = user.uid;
      } else if (linkedinSession?.firebaseUid) {
        requestBody.firebaseUid = linkedinSession.firebaseUid;
      } else if (linkedinSession?.email) {
        requestBody.email = linkedinSession.email;
      } else if (linkedinSession?.userId) {
        requestBody.linkedinId = linkedinSession.userId;
      }

      console.log('IdentityTab: Saving identity data:', requestBody);

      const response = await fetch('/api/users/identity', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();

        // Update local state with saved data
        setIdentityData(prev => prev ? {
          ...prev,
          currentUsername: result.user.anonymousUsername,
          currentAvatarId: result.user.avatarSeed,
        } : null);

        setHasChanges(false);
        setSaved(true);

        // Clear saved indicator after 3 seconds
        setTimeout(() => setSaved(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Error saving identity changes:', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (identityData) {
      setSelectedUsername(identityData.currentUsername || '');
      setSelectedAvatarId(identityData.currentAvatarId || '');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">Loading identity settings...</span>
      </div>
    );
  }

  if (error && !identityData) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchIdentityData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <User className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Anonymous Identity</h2>
        </div>
        <p className="text-sm text-gray-600">
          Customize how you appear to others when posting anonymously. Your changes will be visible in all your forum posts and comments.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Avatar Selection */}
      <AvatarSelector
        currentAvatarId={identityData?.currentAvatarId}
        onSelect={setSelectedAvatarId}
        disabled={saving}
      />

      {/* Username Selection */}
      {(user?.uid || linkedinSession) && (
        <UsernameSelector
          currentUsername={identityData?.currentUsername}
          firebaseUid={user?.uid || linkedinSession?.firebaseUid}
          linkedinId={linkedinSession?.userId}
          email={linkedinSession?.email}
          onSelect={setSelectedUsername}
          disabled={saving}
        />
      )}

      {/* Save Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          {saved && (
            <span className="text-green-600 text-sm font-medium">
              ✓ Changes saved successfully
            </span>
          )}
          {hasChanges && !saved && (
            <span className="text-amber-600 text-sm">
              You have unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Preview section */}
      {(selectedUsername || selectedAvatarId) && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Preview</h3>
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
              {selectedAvatarId ? (
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{
                    __html: getAvatarById(selectedAvatarId)?.svg.replace(
                      '<svg viewBox="0 0 100 100"',
                      '<svg viewBox="0 0 100 100" class="w-full h-full"'
                    ) || ''
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm">
                  {selectedUsername.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {selectedUsername || 'Anonymous User'}
              </p>
              <p className="text-sm text-gray-500">
                This is how you'll appear in forum discussions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}