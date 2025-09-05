'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Trophy, 
  Crown, 
  Star, 
  TrendingUp, 
  Gift, 
  Target,
  Award,
  Zap,
  Users,
  MessageSquare,
  Eye,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UserStats {
  id: string;
  name: string;
  avatarUrl?: string;
  gems: number;
  rank: number;
  contributions: number;
  helpfulVotes: number;
  streak: number;
  totalViews: number;
  badges: Badge[];
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  nextTierGems: number;
  isVIP: boolean;
}

interface ContributionBonus {
  action: string;
  gems: number;
  description: string;
  icon: React.ReactNode;
  multiplier?: number;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  avatarUrl?: string;
  gems: number;
  contributions: number;
  tier: string;
  isVIP: boolean;
  streak: number;
}

const CONTRIBUTION_BONUSES: ContributionBonus[] = [
  {
    action: 'Quality Post',
    gems: 20,
    description: 'Create a well-received forum post',
    icon: <MessageSquare className="w-4 h-4" />
  },
  {
    action: 'Intelligence Share',
    gems: 50,
    description: 'Share verified contact or deal intelligence',
    icon: <Target className="w-4 h-4" />,
    multiplier: 2
  },
  {
    action: 'Helpful Comment',
    gems: 10,
    description: 'Receive upvotes on your comment',
    icon: <Heart className="w-4 h-4" />
  },
  {
    action: 'First Response',
    gems: 15,
    description: 'Be the first to help in a discussion',
    icon: <Zap className="w-4 h-4" />
  },
  {
    action: 'Popular Content',
    gems: 30,
    description: 'Create content with 100+ views',
    icon: <Eye className="w-4 h-4" />
  },
  {
    action: 'Streak Bonus',
    gems: 5,
    description: 'Daily contribution streak (per day)',
    icon: <TrendingUp className="w-4 h-4" />
  }
];

const TIER_REQUIREMENTS = {
  BRONZE: { gems: 0, color: 'bg-orange-600', nextTier: 'SILVER' },
  SILVER: { gems: 100, color: 'bg-gray-400', nextTier: 'GOLD' },
  GOLD: { gems: 500, color: 'bg-yellow-500', nextTier: 'PLATINUM' },
  PLATINUM: { gems: 2000, color: 'bg-purple-600', nextTier: 'DIAMOND' },
  DIAMOND: { gems: 5000, color: 'bg-blue-600', nextTier: null }
};

export function RewardsSystem() {
  const { data: session } = useSession();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBonuses, setShowBonuses] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchUserStats();
      fetchLeaderboard();
    }
  }, [session]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/rewards/stats');
      const data = await response.json();
      setUserStats(data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/rewards/leaderboard');
      const data = await response.json();
      setLeaderboard(data.slice(0, 10)); // Top 10
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'DIAMOND': return <Crown className="w-4 h-4 text-blue-600" />;
      case 'PLATINUM': return <Trophy className="w-4 h-4 text-purple-600" />;
      case 'GOLD': return <Award className="w-4 h-4 text-yellow-500" />;
      case 'SILVER': return <Star className="w-4 h-4 text-gray-400" />;
      default: return <Badge className="w-4 h-4 text-orange-600" />;
    }
  };

  const getProgressToNextTier = (currentGems: number, tier: string) => {
    const nextTier = TIER_REQUIREMENTS[tier as keyof typeof TIER_REQUIREMENTS]?.nextTier;
    if (!nextTier) return 100; // Max tier reached
    
    const nextTierGems = TIER_REQUIREMENTS[nextTier as keyof typeof TIER_REQUIREMENTS].gems;
    const currentTierGems = TIER_REQUIREMENTS[tier as keyof typeof TIER_REQUIREMENTS].gems;
    
    return ((currentGems - currentTierGems) / (nextTierGems - currentTierGems)) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 animate-pulse">
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white rounded-lg p-4 animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Progress Card */}
      {userStats && (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  {getTierIcon(userStats.tier)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center space-x-2">
                    <span>{userStats.name}</span>
                    {userStats.isVIP && <Crown className="w-4 h-4 text-yellow-300" />}
                  </h3>
                  <p className="opacity-90">#{userStats.rank} • {userStats.tier} Tier</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-2xl font-bold">
                  <Gift className="w-6 h-6 text-green-300" />
                  <span>{userStats.gems}</span>
                </div>
                <p className="text-sm opacity-90">Gems earned</p>
              </div>
            </div>

            {/* Progress to next tier */}
            {TIER_REQUIREMENTS[userStats.tier]?.nextTier && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress to {TIER_REQUIREMENTS[userStats.tier].nextTier}</span>
                  <span>{userStats.nextTierGems - userStats.gems} gems to go</span>
                </div>
                <Progress 
                  value={getProgressToNextTier(userStats.gems, userStats.tier)} 
                  className="h-2"
                />
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="font-semibold">{userStats.contributions}</div>
                <div className="text-xs opacity-75">Contributions</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{userStats.helpfulVotes}</div>
                <div className="text-xs opacity-75">Helpful Votes</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{userStats.streak}</div>
                <div className="text-xs opacity-75">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earning Opportunities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Earn Gems</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBonuses(!showBonuses)}
              >
                {showBonuses ? 'Hide' : 'Show All'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {CONTRIBUTION_BONUSES.slice(0, showBonuses ? undefined : 4).map((bonus, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">
                    {bonus.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{bonus.action}</div>
                    <div className="text-xs text-gray-600">{bonus.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Gift className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {bonus.gems}
                    {bonus.multiplier && <span className="text-xs">×{bonus.multiplier}</span>}
                  </span>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-3 border-t">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Contributing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Top Contributors</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboard.map((user, index) => (
              <div key={user.rank} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {user.rank}
                  </div>
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <Users className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm flex items-center space-x-1">
                      <span>{user.name}</span>
                      {user.isVIP && <Crown className="w-3 h-3 text-yellow-500" />}
                      {getTierIcon(user.tier)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {user.contributions} contributions • {user.streak} day streak
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Gift className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-600">{user.gems}</span>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-3 border-t">
              <Button variant="outline" size="sm">
                View Full Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Notifications */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-green-900">Achievement Unlocked!</h4>
              <p className="text-sm text-green-700">
                You've earned the "Helpful Contributor" badge for receiving 50+ helpful votes
              </p>
            </div>
            <Button variant="outline" size="sm">
              View Badge
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}