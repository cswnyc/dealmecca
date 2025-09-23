/**
 * Simple Authentication Test Page
 * Uses simplified auth hook to avoid OAuth conflicts
 */

'use client';

import React from 'react';
import { useSimpleAnonymousAuth } from '@/hooks/useSimpleAnonymousAuth';
import { UserProfile, Avatar } from '@/components/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, User, Shield, Database } from 'lucide-react';

export default function SimpleAuthTestPage() {
  const {
    user,
    isLoading,
    error,
    signInAnonymously,
    signOut,
    isAnonymous
  } = useSimpleAnonymousAuth();

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

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Simple Anonymous Authentication</h1>
        <p className="text-muted-foreground">
          Testing simplified Firebase anonymous authentication
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={signInAnonymously} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Sign In
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Authentication Status
          </CardTitle>
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
                <span className="font-medium">Username:</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {user.username}
                </code>
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

      {/* User Profile Display */}
      {user && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Components */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Display</CardTitle>
              <CardDescription>How the user appears in the UI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Full Profile</h4>
                <div className="p-3 border rounded">
                  <UserProfile user={user} showStatus={true} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Compact Profile</h4>
                <div className="p-3 border rounded">
                  <UserProfile user={user} size="small" showStatus={false} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Avatar Only</h4>
                <div className="p-3 border rounded flex items-center gap-4">
                  <Avatar userId={user.firebaseUid} size={24} />
                  <Avatar userId={user.firebaseUid} size={40} />
                  <Avatar userId={user.firebaseUid} size={64} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                User Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
          <CardDescription>
            Test authentication flows without OAuth conflicts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Button
              onClick={signInAnonymously}
              disabled={isLoading}
              variant={user ? 'outline' : 'default'}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {user ? 'Create Another User' : 'Sign In Anonymously'}
            </Button>

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

          {!user && !error && (
            <p className="text-sm text-muted-foreground">
              Click "Sign In Anonymously" to create an anonymous user with a generated username and avatar.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>What This Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✅ Firebase anonymous authentication without OAuth interference</p>
          <p>✅ Industry-themed username generation (like "RFPjix194850")</p>
          <p>✅ Unique geometric avatar creation</p>
          <p>✅ Database user profile creation and updates</p>
          <p>✅ Session persistence across page reloads</p>
          <p>✅ All user profile components working</p>
        </CardContent>
      </Card>
    </div>
  );
}