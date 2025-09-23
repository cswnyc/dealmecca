/**
 * Offline Test for Anonymous User Components
 * Tests components without Firebase authentication
 */

'use client';

import React, { useState } from 'react';
import { UserProfile, UserProfileCard, Avatar, UsernameBadge } from '@/components/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateAnonymousProfile } from '@/lib/user-generator';
import { AnonymousUser } from '@/hooks/useAnonymousAuth';

export default function TestAuthOfflinePage() {
  const [currentUser, setCurrentUser] = useState<AnonymousUser | null>(null);

  const createMockUser = () => {
    const uid = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const profile = generateAnonymousProfile(uid);

    const mockUser: AnonymousUser = {
      id: `mock-${Date.now()}`,
      firebaseUid: uid,
      username: profile.username,
      avatar: profile.avatar,
      isAnonymous: true,
      isAuthenticated: true,
      createdAt: new Date().toISOString()
    };

    setCurrentUser(mockUser);
  };

  const createVerifiedUser = () => {
    const uid = `verified-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const mockUser: AnonymousUser = {
      id: `verified-${Date.now()}`,
      firebaseUid: uid,
      username: 'John Smith',
      avatar: '',
      isAnonymous: false,
      isAuthenticated: true,
      createdAt: new Date().toISOString()
    };

    setCurrentUser(mockUser);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Offline Anonymous User Test</h1>
        <p className="text-muted-foreground">
          Testing user components without Firebase authentication
        </p>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
          <CardDescription>Create different user states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Button onClick={createMockUser}>
              Create Anonymous User
            </Button>
            <Button onClick={createVerifiedUser} variant="outline">
              Create Verified User
            </Button>
            <Button
              onClick={() => setCurrentUser(null)}
              variant="destructive"
            >
              Clear User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current User Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <UserProfile
                  user={currentUser}
                  showUpgradePrompt={true}
                  showStatus={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Username:</span> {currentUser.username}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {currentUser.isAnonymous ? 'Anonymous' : 'Verified'}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Firebase UID:</span>
                  <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                    {currentUser.firebaseUid}
                  </code>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No user created yet</p>
          )}
        </CardContent>
      </Card>

      {/* Component Variants */}
      {currentUser && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Small Profile</h4>
                <div className="p-3 border rounded">
                  <UserProfile user={currentUser} size="small" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Medium with Upgrade</h4>
                <div className="p-3 border rounded">
                  <UserProfile
                    user={currentUser}
                    size="medium"
                    showUpgradePrompt={true}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Username Badge</h4>
                <div className="p-3 border rounded">
                  <UsernameBadge user={currentUser} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avatar Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <Avatar userId={currentUser.firebaseUid} size={24} />
                  <p className="text-xs mt-1">Small</p>
                </div>
                <div>
                  <Avatar userId={currentUser.firebaseUid} size={40} />
                  <p className="text-xs mt-1">Medium</p>
                </div>
                <div>
                  <Avatar userId={currentUser.firebaseUid} size={64} />
                  <p className="text-xs mt-1">Large</p>
                </div>
                <div>
                  <Avatar userId={currentUser.firebaseUid} size={96} />
                  <p className="text-xs mt-1">XLarge</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generated Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Username Generation Examples</CardTitle>
          <CardDescription>
            Examples of generated B2B industry usernames
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 12 }, (_, i) => {
              const profile = generateAnonymousProfile(`example-${i}`);
              return (
                <div key={i} className="flex items-center gap-3 p-3 border rounded">
                  <Avatar userId={`example-${i}`} size={32} />
                  <span className="font-mono text-sm">{profile.username}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}