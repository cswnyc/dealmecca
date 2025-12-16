'use client'

import Link from 'next/link'
import { Star, Trophy, Gem, ArrowLeft, Crown, Target, Zap } from 'lucide-react'

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/forum" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Link>
              <div className="flex items-center space-x-2">
                <Star className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-semibold text-foreground">My Rewards</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-border p-6 text-center">
            <Gem className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">0</div>
            <div className="text-sm text-muted-foreground">Total Gems</div>
          </div>
          <div className="bg-white rounded-lg border border-border p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">Bronze</div>
            <div className="text-sm text-muted-foreground">Current Tier</div>
          </div>
          <div className="bg-white rounded-lg border border-border p-6 text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">#1</div>
            <div className="text-sm text-muted-foreground">Community Rank</div>
          </div>
        </div>

        {/* Optimization Notice */}
        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <div className="text-center">
            <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Rewards System
            </h2>
            <p className="text-muted-foreground mb-6">
              Our gamification and rewards system is being enhanced for a better experience.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-800">
              🎯 Rewards, achievements, and leaderboards are being optimized for improved performance.
              Full functionality will be restored within 24-48 hours.
            </p>
          </div>

          {/* Coming Soon Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground mb-3">Coming Soon:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Daily Check-in Rewards</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Achievement Badges</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Gem className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Gem Marketplace</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <Crown className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Tier Progression</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 space-y-3">
            <Link href="/forum" className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 mr-3">
              Visit Community Forum
            </Link>
            <Link href="/organizations" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Browse Organizations
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}