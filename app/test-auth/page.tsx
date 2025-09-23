/**
 * Test Page for Anonymous Authentication
 * Tests the actual authentication flow with Firebase
 */

'use client';

import React from 'react';
import { useAnonymousAuth } from '@/hooks/useAnonymousAuth';
import { UserProfileCard, UserProfile } from '@/components/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';

export default function TestAuthPage() {
  const {
    user,
    isLoading,
    error,
    signInAnonymously,
    upgradeToLinkedIn,
    signOut,
    isAnonymous
  } = useAnonymousAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={signInAnonymously}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Anonymous Authentication Test</h1>
        <p className="text-muted-foreground">
          Testing Firebase anonymous authentication with generated profiles
        </p>
      </div>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <Badge variant={user ? 'default' : 'destructive'}>
              {user ? 'Authenticated' : 'Not Authenticated'}
            </Badge>
          </div>

          {user && (
            <>
              <div className="flex items-center gap-2">
                <span className="font-medium">Type:</span>
                <Badge variant={isAnonymous ? 'secondary' : 'default'}>
                  {isAnonymous ? 'Anonymous' : 'Verified'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Firebase UID:</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {user.firebaseUid}
                </code>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* User Profile */}
      {user ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Components */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Components</CardTitle>
              <CardDescription>How the user appears in the UI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Standard Profile</h4>
                <div className="p-3 border rounded">
                  <UserProfile showUpgradePrompt={true} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Compact Profile</h4>
                <div className="p-3 border rounded">
                  <UserProfile size="small" showStatus={false} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Profile Card */}
          <div>
            <UserProfileCard />
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No User Found</CardTitle>
            <CardDescription>
              Anonymous authentication should happen automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={signInAnonymously}>
              Sign In Anonymously
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
          <CardDescription>
            Test different authentication flows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Button
              onClick={signInAnonymously}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Create New Anonymous User
            </Button>

            {user && isAnonymous && (
              <Button
                onClick={upgradeToLinkedIn}
                disabled={isLoading}
                variant="outline"
              >
                Test LinkedIn Upgrade
              </Button>
            )}

            {user && (
              <Button
                onClick={signOut}
                disabled={isLoading}
                variant="destructive"
              >
                Sign Out
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
            {JSON.stringify(
              {
                user: user ? {
                  id: user.id,
                  firebaseUid: user.firebaseUid,
                  username: user.username,
                  isAnonymous: user.isAnonymous,
                  isAuthenticated: user.isAuthenticated,
                  createdAt: user.createdAt
                } : null,
                isLoading,
                error,
                isAnonymous
              },
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}