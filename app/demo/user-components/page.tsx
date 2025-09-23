/**
 * Demo Page for Anonymous User Components
 * Showcases all user profile components and avatar variations
 */

'use client';

import React from 'react';
import {
  Avatar,
  AvatarSmall,
  AvatarMedium,
  AvatarLarge,
  AvatarXLarge,
  UserProfile,
  UserProfileCompact,
  UserProfileCard,
  UsernameBadge
} from '@/components/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateAnonymousProfile } from '@/lib/user-generator';

// Mock user data for demo
const mockUsers = [
  {
    id: 'demo-user-1',
    firebaseUid: 'RFPjix194850-demo',
    username: 'RFPjix194850',
    avatar: '',
    isAnonymous: true,
    isAuthenticated: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-user-2',
    firebaseUid: 'CPMhmso02-demo',
    username: 'CPMhmso02--',
    avatar: '',
    isAnonymous: true,
    isAuthenticated: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-user-3',
    firebaseUid: 'MediaBuyPro-demo',
    username: 'MediaBuyPro',
    avatar: '',
    isAnonymous: false,
    isAuthenticated: true,
    createdAt: new Date().toISOString()
  }
];

export default function UserComponentsDemo() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Anonymous User Components Demo</h1>
        <p className="text-muted-foreground">
          Showcasing industry-themed usernames and geometric avatars
        </p>
      </div>

      {/* Avatar Sizes Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar Components</CardTitle>
          <CardDescription>
            Different avatar sizes with consistent geometric patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <AvatarSmall userId="demo-avatar-small" />
              <p className="text-sm text-muted-foreground">Small (24px)</p>
            </div>
            <div className="text-center space-y-2">
              <AvatarMedium userId="demo-avatar-medium" />
              <p className="text-sm text-muted-foreground">Medium (40px)</p>
            </div>
            <div className="text-center space-y-2">
              <AvatarLarge userId="demo-avatar-large" />
              <p className="text-sm text-muted-foreground">Large (64px)</p>
            </div>
            <div className="text-center space-y-2">
              <AvatarXLarge userId="demo-avatar-xlarge" />
              <p className="text-sm text-muted-foreground">XLarge (96px)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Username Generation Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Usernames</CardTitle>
          <CardDescription>
            Industry-themed anonymous usernames for B2B media professionals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 9 }, (_, i) => {
              const profile = generateAnonymousProfile(`demo-${i}`);
              return (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar userId={`demo-${i}`} size={32} />
                  <span className="font-mono text-sm">{profile.username}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* User Profile Variants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Components</CardTitle>
            <CardDescription>Different profile display formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Compact Profile */}
            <div>
              <h4 className="text-sm font-medium mb-2">Compact Profile</h4>
              <div className="p-3 border rounded-lg">
                <UserProfile
                  user={mockUsers[0]}
                  size="small"
                  showStatus={false}
                />
              </div>
            </div>

            {/* Medium Profile with Status */}
            <div>
              <h4 className="text-sm font-medium mb-2">Medium Profile with Status</h4>
              <div className="p-3 border rounded-lg">
                <UserProfile
                  user={mockUsers[0]}
                  size="medium"
                  showStatus={true}
                />
              </div>
            </div>

            {/* Profile with Upgrade Prompt */}
            <div>
              <h4 className="text-sm font-medium mb-2">Profile with Upgrade Prompt</h4>
              <div className="p-3 border rounded-lg">
                <UserProfile
                  user={mockUsers[0]}
                  size="medium"
                  showStatus={true}
                  showUpgradePrompt={true}
                />
              </div>
            </div>

            {/* Verified User Profile */}
            <div>
              <h4 className="text-sm font-medium mb-2">Verified User Profile</h4>
              <div className="p-3 border rounded-lg">
                <UserProfile
                  user={mockUsers[2]}
                  size="medium"
                  showStatus={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Username Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Username Badges</CardTitle>
            <CardDescription>Simple username displays for comments and posts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">With Avatar</h4>
              <div className="space-y-2">
                {mockUsers.map((user, i) => (
                  <div key={i} className="p-2 border rounded">
                    <UsernameBadge user={user} showAvatar={true} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Username Only</h4>
              <div className="space-y-2">
                {mockUsers.map((user, i) => (
                  <div key={i} className="p-2 border rounded">
                    <UsernameBadge user={user} showAvatar={false} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Full Profile Card</CardTitle>
          <CardDescription>
            Complete profile card for settings and profile pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto">
            {/* Note: UserProfileCard uses the auth hook, so we'll show a placeholder */}
            <div className="p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                UserProfileCard component will appear here when used in the app with authentication
              </p>
              <Badge variant="outline" className="mt-2">
                Requires Auth Hook
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            How to import and use these components in your app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`// Import components
import {
  Avatar,
  UserProfile,
  UserProfileCard,
  UsernameBadge
} from '@/components/user';

// Use in your components
<UserProfile size="medium" showUpgradePrompt={true} />
<UsernameBadge user={user} showAvatar={true} />
<Avatar userId={userId} size={40} />
<UserProfileCard />  // Uses auth hook automatically`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}