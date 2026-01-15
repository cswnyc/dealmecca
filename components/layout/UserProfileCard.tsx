'use client';

import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/lib/auth/firebase-auth';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/user/Avatar';
import { generateAnonymousProfile } from '@/lib/user-generator';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import {
  ChevronUp,
  ChevronDown,
  Star,
  Receipt,
  Settings,
  HelpCircle,
  LogOut,
  Crown,
  User,
  Gem
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  subscriptionTier: string;
  createdAt: string;
  anonymousUsername?: string;
  avatarSeed?: string;
  isAnonymous?: boolean;
}

interface UserStats {
  gems: number;
  rank: number;
  contributions: number;
  streak: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  nextTierGems: number;
  totalPosts: number;
  totalComments: number;
  totalVotes: number;
  totalBookmarks: number;
}

export function UserProfileCard() {
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center space-x-3 p-3">
          <div className="w-10 h-10 bg-muted rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-24 mb-1"></div>
          </div>
          <div className="w-6 h-4 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return <UserProfileContent />;
}

function UserProfileContent() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMoreExpanded, setIsMoreExpanded] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [anonymousIdentity, setAnonymousIdentity] = useState<{username: string, avatarId: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: firebaseUser, loading: authLoading } = useFirebaseAuth();
  const { user: backendUser, loading: backendLoading } = useUser();

  // Check if we have either Firebase or backend session
  const hasSession = Boolean(firebaseUser || backendUser);
  const anyLoading = authLoading || backendLoading;
  const router = useRouter();

  useEffect(() => {
    // Fetch data if we have either Firebase or backend user
    if (!anyLoading && hasSession && !profile) {
      // Use backend user if available, otherwise use Firebase user
      if (backendUser) {
        setProfile(backendUser as UserProfile);
      }
      if (firebaseUser || backendUser) {
        fetchUserStats();
      }
    } else if (!anyLoading && !hasSession) {
      setLoading(false);
    }
  }, [firebaseUser, backendUser, hasSession, anyLoading, profile]);

  // Separate effect for anonymous identity to properly reset on user change
  useEffect(() => {
    if (firebaseUser?.uid) {
      fetchAnonymousIdentity();
    } else {
      setAnonymousIdentity(null);
    }
  }, [firebaseUser?.uid]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Build URL with firebaseUid if available
      let url = '/api/rewards/stats';
      if (firebaseUser?.uid) {
        url += `?firebaseUid=${firebaseUser.uid}`;
        console.log('[UserProfileCard] Fetching stats with firebaseUid:', firebaseUser.uid);
      } else {
        console.log('[UserProfileCard] Fetching stats without firebaseUid (fallback to session)');
      }

      const response = await fetch(url, {
        credentials: 'include', // Include cookies for session fallback
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[UserProfileCard] Stats API response:', data);
        setUserStats(data);
      } else {
        console.log('Rewards API not available, using default stats. Status:', response.status);
        // Use default stats when API fails
        setUserStats({
          gems: 0,
          rank: 1,
          contributions: 0,
          streak: 0,
          tier: 'BRONZE',
          nextTierGems: 100,
          totalPosts: 0,
          totalComments: 0,
          totalVotes: 0,
          totalBookmarks: 0
        });
      }
    } catch (error) {
      console.log('Error fetching user stats, using defaults:', error);
      // Use default stats when API fails
      setUserStats({
        gems: 0,
        rank: 1,
        contributions: 0,
        streak: 0,
        tier: 'BRONZE',
        nextTierGems: 100,
        totalPosts: 0,
        totalComments: 0,
        totalVotes: 0,
        totalBookmarks: 0
      });
    }
  };

  const fetchAnonymousIdentity = async () => {
    // Reset identity to prevent showing stale avatar from previous user
    setAnonymousIdentity(null);
    
    if (!firebaseUser?.uid) {
      console.log('[UserProfileCard] fetchAnonymousIdentity: No firebaseUser.uid available');
      return;
    }

    console.log('[UserProfileCard] Fetching anonymous identity for uid:', firebaseUser.uid.substring(0, 8) + '...');

    try {
      const response = await fetch(`/api/users/identity?firebaseUid=${firebaseUser.uid}`, {
        credentials: 'include', // Ensure cookies are sent (important for Safari)
      });

      console.log('[UserProfileCard] Identity API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[UserProfileCard] Identity API full response:', data);

        if (data.currentUsername && data.currentAvatarId) {
          console.log('[UserProfileCard] ✅ Setting identity:', data.currentUsername, '→', data.currentAvatarId);
          setAnonymousIdentity({
            username: data.currentUsername,
            avatarId: data.currentAvatarId
          });
        } else {
          // API returned incomplete data - DO NOT use fallback, let it remain null
          // This allows the component to keep showing the generated avatar
          console.warn('[UserProfileCard] ⚠️ API returned incomplete data:', {
            hasUsername: !!data.currentUsername,
            hasAvatarId: !!data.currentAvatarId
          });
          console.warn('[UserProfileCard] Keeping anonymousIdentity null - will use generated avatar');
        }
      } else {
        // API error - keep null to use generated avatar
        console.error('[UserProfileCard] ❌ API error, status:', response.status);
        console.log('[UserProfileCard] Keeping anonymousIdentity null - will use generated avatar');
      }
    } catch (error) {
      console.error('[UserProfileCard] Error fetching anonymous identity:', error);
      // Keep null to use generated avatar - don't set fallback
      console.log('[UserProfileCard] Keeping anonymousIdentity null - will use generated avatar');
    }
  };

  const getDisplayName = (): string => {
    // Priority: Anonymous username (from identity) → Profile anonymous username → Real name → Display name → Email prefix → Default
    if (anonymousIdentity?.username) {
      return anonymousIdentity.username;
    }
    if (profile?.anonymousUsername) {
      return profile.anonymousUsername;
    }
    if (profile?.name && !profile?.isAnonymous) {
      return profile.name;
    }
    if (firebaseUser?.displayName) {
      return firebaseUser.displayName;
    }
    if (firebaseUser?.email) {
      return firebaseUser.email.split('@')[0];
    }
    // Generate temporary anonymous name if none exists
    if (firebaseUser?.uid || profile?.id) {
      const tempProfile = generateAnonymousProfile(firebaseUser?.uid || profile?.id || 'temp');
      return tempProfile.username;
    }
    return 'User';
  };

  const getSubscriptionInfo = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return {
          label: 'Free',
          color: 'bg-muted text-muted-foreground',
          icon: null
        };
      case 'PRO':
        return {
          label: 'Pro',
          color: 'bg-blue-100 text-blue-800',
          icon: Crown
        };
      case 'TEAM':
        return {
          label: 'Team',
          color: 'bg-purple-100 text-purple-800',
          icon: Crown
        };
      case 'ADMIN':
        return {
          label: 'Admin',
          color: 'bg-orange-100 text-orange-800',
          icon: Star
        };
      default:
        return {
          label: 'Free',
          color: 'bg-muted text-muted-foreground',
          icon: null
        };
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return 'text-amber-600';
      case 'SILVER':
        return 'text-gray-500';
      case 'GOLD':
        return 'text-yellow-500';
      case 'PLATINUM':
        return 'text-blue-500';
      case 'DIAMOND':
        return 'text-purple-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const handleSignOut = async () => {
    try {
      // Sign out from Firebase if authenticated
      if (firebaseUser) {
        const { signOut } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebase');
        await signOut(auth);
      }
      // Clear LinkedIn session and cookie
      localStorage.removeItem('linkedin-session');
      localStorage.removeItem('auth-token');
      // Clear linkedin-auth cookie
      document.cookie = 'linkedin-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/auth/signup');
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback: navigate to sign-up page anyway
      router.push('/auth/signup');
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsExpanded(false);
  };

  // Always show profile widget for now - bypass auth checks temporarily for production
  const showProfile = true;
  
  if (!showProfile && loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center space-x-3 p-3">
          <div className="w-10 h-10 bg-muted rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-24 mb-1"></div>
          </div>
          <div className="w-6 h-4 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!showProfile && !anyLoading && !hasSession) {
    return (
      <div className="p-3">
        <Button
          onClick={() => router.push('/auth/signup')}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Sign In
        </Button>
      </div>
    );
  }

  const subscriptionInfo = getSubscriptionInfo(profile?.subscriptionTier || 'FREE');
  const SubscriptionIcon = subscriptionInfo.icon;
  const gems = userStats?.gems || 0;
  const tier = userStats?.tier || 'BRONZE';

  return (
    <div className="w-full">
      {/* SellerCrowd-Style Profile Widget */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-all duration-200 group"
      >
        {/* Avatar */}
        <div className="relative">
          {/* Priority: Custom anonymous avatar → OAuth profile photo → Generated avatar → Initials fallback */}
          {(() => {
            const userId = firebaseUser?.uid || profile?.id || backendUser?.id;
            const displayName = getDisplayName();

            console.log('[UserProfileCard] Avatar render - anonymousIdentity:', !!anonymousIdentity, 'photoURL:', !!firebaseUser?.photoURL, 'userId:', userId);

            // Priority 1: Custom anonymous avatar from identity API
            if (anonymousIdentity?.avatarId) {
              console.log('[UserProfileCard] Rendering AvatarDisplay with:', anonymousIdentity.avatarId);
              return (
                <AvatarDisplay
                  avatarId={anonymousIdentity.avatarId}
                  username={anonymousIdentity.username || 'Anonymous'}
                  size={40}
                />
              );
            }

            // Priority 2: OAuth profile photo (if not blocked by Safari)
            if (firebaseUser?.photoURL) {
              console.log('[UserProfileCard] Rendering OAuth photo');
              return (
                <img
                  src={firebaseUser.photoURL}
                  alt="Profile"
                  className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                  onError={(e) => {
                    console.warn('[UserProfileCard] OAuth photo failed to load (Safari might be blocking)');
                    // Hide the broken image
                    e.currentTarget.style.display = 'none';
                  }}
                />
              );
            }

            // Priority 3: Generated avatar based on userId
            if (userId && userId !== 'default') {
              console.log('[UserProfileCard] Rendering generated Avatar with userId:', userId);
              return (
                <div className="w-10 h-10 flex-shrink-0">
                  <Avatar
                    userId={userId}
                    size={40}
                    className="rounded-full"
                    alt="User avatar"
                  />
                </div>
              );
            }

            // Priority 4: Initials fallback (last resort)
            console.log('[UserProfileCard] Rendering initials fallback for:', displayName);
            return (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {displayName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() || 'U'}
              </div>
            );
          })()}
          {/* Online indicator - small dot */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></div>
        </div>

        {/* User Name and Gems - Stacked layout like screenshot */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {getDisplayName()}
          </p>
          {/* Gems under username - SellerCrowd style */}
          <div className="flex items-center space-x-0.5 mt-0.5">
            <span className="text-xs text-[#5BC4E8]">💎</span>
            <span className="text-xs text-muted-foreground">{gems}</span>
          </div>
        </div>

        {/* Dropdown Arrow */}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>

      {/* Expanded Menu - Compact and Modern */}
      {isExpanded && (
        <div className="mt-2 py-1 bg-card border border-border rounded-lg shadow-lg">
          {/* Compact Stats Header - Single Row */}
          {userStats && (
            <div className="px-3 py-2 border-b border-border">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">#{userStats.rank}</span>
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1">
                  <Gem className={`w-3 h-3 ${getTierColor(tier)}`} />
                  <span className="font-semibold text-foreground">{gems}</span>
                </span>
                <span className="text-border">•</span>
                <span className={`${getTierColor(tier)} font-semibold uppercase`}>
                  {tier}
                </span>
              </div>
            </div>
          )}

          {/* Menu Items - Simplified */}
          <div className="py-1">
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full flex items-center px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="w-4 h-4 mr-2.5 text-muted-foreground" />
              Settings
            </button>

            <button
              onClick={() => handleNavigation('/billing')}
              className="w-full flex items-center px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Receipt className="w-4 h-4 mr-2.5 text-muted-foreground" />
              Billing
            </button>

            {/* More Submenu - Progressive Disclosure */}
            <div>
              <button
                onClick={() => setIsMoreExpanded(!isMoreExpanded)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <span className="flex items-center">
                  <ChevronDown className={`w-4 h-4 mr-2.5 text-muted-foreground transition-transform ${isMoreExpanded ? 'rotate-180' : ''}`} />
                  More
                </span>
              </button>

              {isMoreExpanded && (
                <div className="bg-muted">
                  <button
                    onClick={() => handleNavigation('/help')}
                    className="w-full flex items-center px-3 py-1.5 pl-9 text-sm text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 mr-2.5 text-muted-foreground" />
                    Get Support
                  </button>

                  <button
                    onClick={() => handleNavigation('/terms')}
                    className="w-full flex items-center px-3 py-1.5 pl-9 text-sm text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <span className="text-xs">Terms & Privacy</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sign Out */}
          <div className="border-t border-border pt-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}