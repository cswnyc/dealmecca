/**
 * User Profile Components
 * Displays anonymous user profiles with generated usernames and avatars
 */

import React from 'react';
import { Avatar, AvatarSmall, AvatarMedium, AvatarLarge } from './Avatar';
import { useAnonymousAuth, AnonymousUser } from '@/hooks/useAnonymousAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Linkedin, Crown, Shield } from 'lucide-react';

interface UserProfileProps {
  user?: AnonymousUser;
  size?: 'small' | 'medium' | 'large';
  showUpgradePrompt?: boolean;
  showStatus?: boolean;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  size = 'medium',
  showUpgradePrompt = false,
  showStatus = true,
  className = ''
}) => {
  const { user: currentUser, upgradeToLinkedIn } = useAnonymousAuth();

  const displayUser = user || currentUser;

  if (!displayUser) {
    return null;
  }

  const AvatarComponent = {
    small: AvatarSmall,
    medium: AvatarMedium,
    large: AvatarLarge
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AvatarComponent userId={displayUser.firebaseUid} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">
            {displayUser.username}
          </p>

          {showStatus && (
            <Badge variant={displayUser.isAnonymous ? 'secondary' : 'default'} className="text-xs">
              {displayUser.isAnonymous ? (
                <>
                  <Shield className="w-3 h-3 mr-1" />
                  Anonymous
                </>
              ) : (
                <>
                  <Crown className="w-3 h-3 mr-1" />
                  Verified
                </>
              )}
            </Badge>
          )}
        </div>

        {showUpgradePrompt && displayUser.isAnonymous && (
          <p className="text-xs text-muted-foreground">
            Upgrade to keep your content
          </p>
        )}
      </div>

      {showUpgradePrompt && displayUser.isAnonymous && (
        <Button
          size="sm"
          variant="outline"
          onClick={upgradeToLinkedIn}
          className="text-xs"
        >
          <Linkedin className="w-3 h-3 mr-1" />
          Upgrade
        </Button>
      )}
    </div>
  );
};

// Compact profile for headers and navigation
export const UserProfileCompact: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <UserProfile
      size="small"
      showStatus={false}
      className={className}
    />
  );
};

// Full profile card for settings or profile pages
export const UserProfileCard: React.FC<{ className?: string }> = ({ className }) => {
  const { user, upgradeToLinkedIn, signOut } = useAnonymousAuth();

  if (!user) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <AvatarLarge userId={user.firebaseUid} />
          <div>
            <CardTitle className="text-lg">{user.username}</CardTitle>
            <CardDescription>
              {user.isAnonymous ? 'Anonymous User' : 'Verified User'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Account Status</p>
            <p className="text-sm text-muted-foreground">
              {user.isAnonymous
                ? 'Anonymous - Your data will be deleted if you don\'t upgrade'
                : 'Verified - Your data is permanently saved'
              }
            </p>
          </div>

          <Badge variant={user.isAnonymous ? 'secondary' : 'default'}>
            {user.isAnonymous ? (
              <>
                <Shield className="w-3 h-3 mr-1" />
                Anonymous
              </>
            ) : (
              <>
                <Crown className="w-3 h-3 mr-1" />
                Verified
              </>
            )}
          </Badge>
        </div>

        {user.isAnonymous && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Upgrade Your Account</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Connect with LinkedIn to save your content permanently and access additional features.
            </p>
            <Button onClick={upgradeToLinkedIn} className="w-full">
              <Linkedin className="w-4 h-4 mr-2" />
              Connect LinkedIn
            </Button>
          </div>
        )}

        <div className="pt-2 border-t">
          <Button variant="outline" onClick={signOut} className="w-full">
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Simple username display for comments, posts, etc.
export const UsernameBadge: React.FC<{
  user?: AnonymousUser;
  showAvatar?: boolean;
  className?: string;
}> = ({ user, showAvatar = true, className = '' }) => {
  const { user: currentUser } = useAnonymousAuth();
  const displayUser = user || currentUser;

  if (!displayUser) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showAvatar && <AvatarSmall userId={displayUser.firebaseUid} />}
      <span className="font-medium text-sm">{displayUser.username}</span>
      {displayUser.isAnonymous && (
        <Shield className="w-3 h-3 text-muted-foreground" />
      )}
    </div>
  );
};

export default UserProfile;