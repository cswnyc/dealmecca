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
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
          </div>
          <div className="w-6 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return <UserProfileContent />;
}

function UserProfileContent() {
  const [isExpanded, setIsExpanded] = useState(false);
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
      if (firebaseUser && !anonymousIdentity) {
        fetchAnonymousIdentity();
      }
    } else if (!anyLoading && !hasSession) {
      setLoading(false);
    }
  }, [firebaseUser, backendUser, hasSession, anyLoading, anonymousIdentity, profile]);

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
      const response = await fetch('/api/rewards/stats');
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      } else {
        console.log('Rewards API not available, using default stats');
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
    if (!firebaseUser?.uid) {
      return;
    }

    try {
      const response = await fetch(`/api/users/identity?firebaseUid=${firebaseUser.uid}`);

      if (response.ok) {
        const data = await response.json();

        if (data.currentUsername && data.currentAvatarId) {
          setAnonymousIdentity({
            username: data.currentUsername,
            avatarId: data.currentAvatarId
          });
        } else {
          // API returned incomplete data, use fallback
          setAnonymousIdentity({
            username: 'Cloud Hawk',
            avatarId: 'avatar_2'
          });
        }
      } else {
        // API error, use fallback
        setAnonymousIdentity({
          username: 'Cloud Hawk',
          avatarId: 'avatar_2'
        });
      }
    } catch (error) {
      console.error('Error fetching anonymous identity:', error);
      // Use fallback data if API fails
      setAnonymousIdentity({
        username: 'Cloud Hawk',
        avatarId: 'avatar_2'
      });
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
          color: 'bg-gray-100 text-gray-800',
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
          color: 'bg-gray-100 text-gray-800',
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
        return 'text-gray-400';
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
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
          </div>
          <div className="w-6 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!showProfile && !anyLoading && !hasSession) {
    return (
      <div className="p-3">
        <Button
          onClick={() => router.push('/auth/signup')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
      >
        {/* Avatar */}
        <div className="relative">
          {/* Priority: Custom anonymous avatar → OAuth profile photo → Generated avatar */}
          {anonymousIdentity?.avatarId ? (
            <AvatarDisplay
              avatarId={anonymousIdentity.avatarId}
              username={anonymousIdentity.username || 'Anonymous'}
              size={40}
            />
          ) : firebaseUser?.photoURL ? (
            <img
              src={firebaseUser.photoURL}
              alt="Profile"
              className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
            />
          ) : (
            <div className="w-10 h-10 flex-shrink-0">
              <Avatar
                userId={firebaseUser?.uid || profile?.id || 'default'}
                size={40}
                className="rounded-full"
                alt="User avatar"
              />
            </div>
          )}
          {/* Online indicator - small dot */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        
        {/* User Name - Clean and prominent */}
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-gray-900 truncate">
            {getDisplayName()}
          </p>
        </div>

        {/* Gems with Icon - SellerCrowd style */}
        <div className="flex items-center space-x-1">
          <Gem className={`w-4 h-4 ${getTierColor(tier)}`} />
          <span className="text-sm font-medium text-gray-700">{gems}</span>
        </div>

        {/* Dropdown Arrow */}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        )}
      </button>

      {/* Expanded Menu - Improved styling */}
      {isExpanded && (
        <div className="mt-2 py-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* User Stats Summary */}
          {userStats && (
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{userStats.rank}</p>
                  <p className="text-xs text-gray-500">Rank</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{userStats.contributions}</p>
                  <p className="text-xs text-gray-500">Contributions</p>
                </div>
              </div>
              <div className="mt-2 text-center">
                <Badge className={`${getTierColor(tier)} bg-transparent border-current font-medium`}>
                  {tier} Tier
                </Badge>
              </div>
            </div>
          )}

          {/* Subscription Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-center">
              <Badge className={`${subscriptionInfo.color} font-medium`}>
                {SubscriptionIcon && <SubscriptionIcon className="w-3 h-3 mr-1" />}
                {subscriptionInfo.label}
              </Badge>
            </div>
            {(profile?.subscriptionTier || 'FREE') === 'FREE' && (
              <Button
                onClick={() => handleNavigation('/upgrade')}
                className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm h-8"
              >
                Upgrade Plan
              </Button>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => handleNavigation('/rewards')}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-3" />
                My Rewards
              </div>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                Coming Soon
              </span>
            </button>

            <button
              onClick={() => handleNavigation('/billing')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Receipt className="w-4 h-4 mr-3" />
              Billing
            </button>
            
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </button>
            
            <button
              onClick={() => handleNavigation('/help')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <HelpCircle className="w-4 h-4 mr-3" />
              Get Support
            </button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>

          {/* Footer Links */}
          <div className="border-t border-gray-100 pt-2 pb-1">
            <div className="flex justify-center space-x-4 text-xs text-gray-400">
              <button 
                onClick={() => handleNavigation('/contact')}
                className="hover:text-gray-600 transition-colors"
              >
                Contact
              </button>
              <span>•</span>
              <button 
                onClick={() => handleNavigation('/privacy')}
                className="hover:text-gray-600 transition-colors"
              >
                Privacy
              </button>
              <span>•</span>
              <button 
                onClick={() => handleNavigation('/terms')}
                className="hover:text-gray-600 transition-colors"
              >
                Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}