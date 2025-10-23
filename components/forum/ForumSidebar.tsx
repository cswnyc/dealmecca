'use client';

import { useState, useEffect, useRef } from 'react';
import { useFirebaseAuth } from '@/lib/auth/firebase-auth';
import {
  Trophy,
  Crown,
  Star,
  TrendingUp,
  Gift,
  Target,
  Users,
  MessageSquare,
  Eye,
  Bookmark,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UserStats {
  gems: number;
  rank: number;
  contributions: number;
  streak: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  nextTierGems: number;
}

interface QuickStat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export function ForumSidebar() {
  const { user: firebaseUser, idToken, loading: authLoading } = useFirebaseAuth();

  // Check Firebase session
  const hasFirebaseSession = Boolean(firebaseUser);

  // Check LinkedIn session as fallback
  const hasLinkedInSession = typeof window !== 'undefined' && localStorage.getItem('linkedin-session');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const [syncedUser, setSyncedUser] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [topContributors, setTopContributors] = useState<Array<{
    name: string;
    gems: number;
    rank: number;
    isVIP: boolean;
  }>>([]);
  const [communityStats, setCommunityStats] = useState({
    activeUsers: 0,
    todaysPosts: 0,
    onlineNow: 0
  });

  useEffect(() => {
    console.log('🎯 ForumSidebar: Firebase user state:', { firebaseUser: !!firebaseUser, authLoading, hasFirebaseSession });
    if (authLoading) {
      console.log('🎯 ForumSidebar: Auth still loading, waiting...');
      return;
    }
    
    if (firebaseUser && !syncedUser) {
      console.log('🎯 ForumSidebar: Firebase user found, syncing to database...');
      syncFirebaseUser();
    } else if (firebaseUser && syncedUser) {
      console.log('🎯 ForumSidebar: Firebase user already synced, fetching stats');
      fetchUserStats();
      fetchNotificationCount();
    } else {
      console.log('🎯 ForumSidebar: No firebaseUser, setting loading to false');
      setLoading(false);
    }
  }, [firebaseUser, authLoading, syncedUser]);

  const syncFirebaseUser = async () => {
    if (!firebaseUser) return;
    
    try {
      console.log('🔥 Syncing Firebase user to database...');
      const response = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          providerId: firebaseUser.providerId,
          isNewUser: false // We'll handle new user logic elsewhere
        }),
        credentials: 'include'
      });

      if (response.ok) {
        console.log('🔥 Firebase user synced successfully');
        setSyncedUser(true);
        // Now fetch user stats and notification count
        fetchUserStats();
        fetchNotificationCount();
      } else {
        console.error('🔥 Failed to sync Firebase user:', response.status);
        setLoading(false);
      }
    } catch (error) {
      console.error('🔥 Error syncing Firebase user:', error);
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (isFetchingRef.current) {
      console.log('🎯 ForumSidebar: Already fetching, skipping...');
      return;
    }

    isFetchingRef.current = true;
    try {
      console.log('🎯 ForumSidebar: Fetching user stats...');

      // Build URL with firebaseUid if available
      let url = '/api/rewards/stats';
      if (firebaseUser?.uid) {
        url += `?firebaseUid=${firebaseUser.uid}`;
        console.log('🎯 ForumSidebar: Using firebaseUid:', firebaseUser.uid);
      } else {
        console.log('🎯 ForumSidebar: No firebaseUid, using session fallback');
      }

      const response = await fetch(url, {
        credentials: 'include',  // Include cookies for session fallback
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('🎯 ForumSidebar: Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🎯 ForumSidebar: Received data:', data);
        setUserStats(data);
      } else {
        console.log('🎯 ForumSidebar: Rewards API not available, using default stats');
        // Use default stats when API fails
        setUserStats({
          gems: 0,
          rank: 1,
          contributions: 0,
          streak: 0,
          tier: 'BRONZE',
          nextTierGems: 100
        });
      }
    } catch (error) {
      console.log('🎯 ForumSidebar: Error fetching user stats, using defaults:', error);
      // Use default stats when API fails
      setUserStats({
        gems: 0,
        rank: 1,
        contributions: 0,
        streak: 0,
        tier: 'BRONZE',
        nextTierGems: 100
      });
    } finally {
      console.log('🎯 ForumSidebar: Setting loading to false');
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    if (!firebaseUser || !idToken) return;

    try {
      const response = await fetch('/api/notifications?unread=true&limit=1', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Fetch top contributors
  const fetchTopContributors = async () => {
    try {
      const response = await fetch('/api/forum/top-contributors?limit=3');
      if (response.ok) {
        const data = await response.json();
        setTopContributors(data.contributors || []);
      }
    } catch (error) {
      console.error('Error fetching top contributors:', error);
      // Use fallback data on error
      setTopContributors([
        { name: 'Loading...', gems: 0, rank: 1, isVIP: false },
      ]);
    }
  };

  // Fetch community stats
  const fetchCommunityStats = async () => {
    try {
      const response = await fetch('/api/forum/community-stats');
      if (response.ok) {
        const data = await response.json();
        setCommunityStats({
          activeUsers: data.activeUsers || 0,
          todaysPosts: data.todaysPosts || 0,
          onlineNow: data.onlineNow || 0
        });
      }
    } catch (error) {
      console.error('Error fetching community stats:', error);
      // Keep default values on error
    }
  };

  // Fetch notification count, top contributors, and community stats when component mounts
  useEffect(() => {
    fetchTopContributors();
    fetchCommunityStats();
  }, []);

  // Fetch notification count when user is available
  useEffect(() => {
    if (firebaseUser && syncedUser) {
      fetchNotificationCount();
    }
  }, [firebaseUser, syncedUser]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'DIAMOND': return 'from-blue-500 to-blue-600';
      case 'PLATINUM': return 'from-purple-500 to-purple-600';
      case 'GOLD': return 'from-yellow-500 to-yellow-600';
      case 'SILVER': return 'from-gray-400 to-gray-500';
      case 'BRONZE': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  // Format number with k suffix for thousands
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const quickStats: QuickStat[] = [
    { label: 'Active Users', value: formatNumber(communityStats.activeUsers), icon: <Users className="w-4 h-4" />, color: 'text-blue-600' },
    { label: 'Today\'s Posts', value: communityStats.todaysPosts, icon: <MessageSquare className="w-4 h-4" />, color: 'text-green-600' },
    { label: 'Online Now', value: communityStats.onlineNow, icon: <Eye className="w-4 h-4" />, color: 'text-purple-600' },
  ];

  console.log('🎯 ForumSidebar: Render state check:', { 
    loading, 
    firebaseUser: !!firebaseUser, 
    userStats: !!userStats, 
    authLoading,
    hasFirebaseSession 
  });

  // Show loading skeleton only if we're waiting for user stats after confirming user exists
  if (loading && firebaseUser && !authLoading) {
    console.log('🎯 ForumSidebar: Showing skeleton loading state');
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => window.location.href = '/saved-posts'}
          >
            <Bookmark className="w-3 h-3 mr-2" />
            Saved Posts
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs relative"
            onClick={() => window.location.href = '/notifications'}
          >
            <Bell className="w-3 h-3 mr-2" />
            Notifications
            {notificationCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center">
                {notificationCount > 99 ? '99+' : notificationCount}
              </Badge>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center space-x-2 text-gray-900 dark:text-white">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>Community Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={stat.color}>{stat.icon}</div>
                <span className="text-sm text-gray-600 dark:text-slate-400">{stat.label}</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{stat.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* User Stats Card */}
      {firebaseUser && userStats && (
        <Card className="border-0 shadow-sm bg-gray-100/80 dark:bg-slate-900/60 backdrop-blur-sm opacity-60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between text-gray-700 dark:text-white">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                <span>Your Progress</span>
              </div>
              <span className="text-sm px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg animate-pulse">
                Coming Soon
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tier Badge */}
            <div className="flex items-center justify-between">
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(userStats.tier)} text-white text-xs font-medium opacity-50`}>
                {userStats.tier} TIER
              </div>
              <div className="flex items-center space-x-1 opacity-50">
                <Gift className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                <span className="font-bold text-gray-600 dark:text-white">{userStats.gems}</span>
                <span className="text-xs text-gray-400 dark:text-slate-400">gems</span>
              </div>
            </div>

            {/* Progress to Next Tier */}
            <div className="opacity-50">
              <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
                <span>Progress to next tier</span>
                <span>{userStats.gems}/{userStats.nextTierGems}</span>
              </div>
              <Progress
                value={(userStats.gems / userStats.nextTierGems) * 100}
                className="h-2"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs opacity-50">
              <div className="text-center p-2 bg-gray-200 dark:bg-slate-800 rounded">
                <div className="font-semibold text-gray-600 dark:text-white">#{userStats.rank}</div>
                <div className="text-gray-500 dark:text-slate-400">Rank</div>
              </div>
              <div className="text-center p-2 bg-gray-200 dark:bg-slate-800 rounded">
                <div className="font-semibold text-gray-600 dark:text-white">{userStats.streak}</div>
                <div className="text-gray-500 dark:text-slate-400">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Contributors Mini Leaderboard */}
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center space-x-2 text-gray-900 dark:text-white">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>Top Contributors</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topContributors.length > 0 ? topContributors.map((user, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                'bg-orange-600 text-white'
              }`}>
                {user.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium truncate text-gray-900 dark:text-white">{user.name}</span>
                  {user.isVIP && <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Gift className="w-3 h-3 text-green-600" />
                <span className="text-xs font-semibold text-green-600">{user.gems}</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-slate-400">
              No contributors yet
            </div>
          )}
          <Button variant="ghost" size="sm" className="w-full text-xs text-gray-700 dark:text-slate-200">
            View Leaderboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}