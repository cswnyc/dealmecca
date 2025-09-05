'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronUp,
  ChevronDown,
  Star,
  Download,
  Receipt,
  Settings,
  HelpCircle,
  LogOut,
  Crown,
  User
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  subscriptionTier: string;
  createdAt: string;
}

export function UserProfileCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchProfile();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status]);

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

  const getMemberSince = (createdAt: string) => {
    if (!createdAt) return 'Recent';
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: '2-digit'
    });
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsExpanded(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center space-x-3 p-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !profile) {
    return (
      <div className="p-3">
        <Button
          onClick={() => router.push('/auth/signin')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Sign In
        </Button>
      </div>
    );
  }

  const subscriptionInfo = getSubscriptionInfo(profile.subscriptionTier);
  const SubscriptionIcon = subscriptionInfo.icon;

  return (
    <div className="w-full">
      {/* Expandable Profile Card */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
      >
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-gray-900 truncate">
            {profile.name || 'User'}
          </p>
          <div className="flex items-center space-x-2 mt-0.5">
            <p className="text-xs text-gray-500">
              Member since {getMemberSince(profile.createdAt)}
            </p>
          </div>
        </div>

        {/* Subscription Badge & Expand Arrow */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">0</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          )}
        </div>
      </button>

      {/* Expanded Menu */}
      {isExpanded && (
        <div className="mt-2 py-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Subscription Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-center">
              <Badge className={`${subscriptionInfo.color} font-medium`}>
                {SubscriptionIcon && <SubscriptionIcon className="w-3 h-3 mr-1" />}
                {subscriptionInfo.label}
              </Badge>
            </div>
            {profile.subscriptionTier === 'FREE' && (
              <Button
                onClick={() => handleNavigation('/upgrade')}
                className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm h-8"
              >
                Invite to my paid plan
              </Button>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => handleNavigation('/rewards')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Star className="w-4 h-4 mr-3" />
              My Rewards
            </button>
            
            <button
              onClick={() => handleNavigation('/exports')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-3" />
              My Downloads
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
              Log out
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