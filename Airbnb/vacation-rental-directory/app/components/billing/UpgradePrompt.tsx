'use client';

import { Tier } from '@prisma/client';
import { getTierDisplayName, getTierFeatures } from '../../lib/subscriptions';

interface UpgradePromptProps {
  currentTier: Tier | null;
  requiredTier: Tier;
  feature: string;
  onUpgrade?: () => void;
  compact?: boolean;
}

export function UpgradePrompt({ 
  currentTier, 
  requiredTier, 
  feature, 
  onUpgrade,
  compact = false
}: UpgradePromptProps) {
  const needsUpgrade = !currentTier || 
    (currentTier === 'BRONZE' && ['SILVER', 'GOLD', 'PLATINUM'].includes(requiredTier)) ||
    (currentTier === 'SILVER' && ['GOLD', 'PLATINUM'].includes(requiredTier)) ||
    (currentTier === 'GOLD' && requiredTier === 'PLATINUM');

  if (!needsUpgrade) {
    return null;
  }

  const tierGradients = {
    BRONZE: 'from-orange-500 to-amber-600',
    SILVER: 'from-gray-500 to-slate-600', 
    GOLD: 'from-yellow-500 to-orange-600',
    PLATINUM: 'from-purple-500 to-pink-600'
  };

  const tierIcons = {
    BRONZE: '🥉',
    SILVER: '🥈',
    GOLD: '🥇', 
    PLATINUM: '💎'
  };

  if (compact) {
    return (
      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-full px-4 py-2 border border-purple-200/50">
        <div className={`w-6 h-6 bg-gradient-to-r ${tierGradients[requiredTier]} rounded-full flex items-center justify-center`}>
          <span className="text-xs">{tierIcons[requiredTier]}</span>
        </div>
        <span className="text-sm text-purple-700 font-medium">
          {getTierDisplayName(requiredTier)} required
        </span>
        <button
          onClick={onUpgrade}
          className="text-xs bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full hover:from-purple-600 hover:to-indigo-600 transition-all"
        >
          Upgrade
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-6 border border-purple-200/50 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10"></div>
      
      <div className="relative flex items-center space-x-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${tierGradients[requiredTier]} rounded-full flex items-center justify-center shadow-lg flex-shrink-0`}>
          <span className="text-xl text-white">{tierIcons[requiredTier]}</span>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-black text-gray-900 mb-1">
            🚀 Upgrade to {getTierDisplayName(requiredTier)}
          </h3>
          <p className="text-gray-700 text-sm">
            {feature} requires {getTierDisplayName(requiredTier)}. 
            {currentTier && ` You're currently on ${getTierDisplayName(currentTier)}.`}
          </p>
        </div>
        
        <button
          onClick={onUpgrade}
          className={`px-6 py-3 bg-gradient-to-r ${tierGradients[requiredTier]} text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex-shrink-0`}
        >
          ✨ Upgrade Now
        </button>
      </div>
      
      {/* Features Preview */}
      <div className="mt-4 pt-4 border-t border-purple-200/50">
        <p className="text-xs text-gray-600 mb-2 font-medium">What you'll unlock:</p>
        <div className="flex flex-wrap gap-2">
          {getTierFeatures(requiredTier).slice(0, 3).map((feature, index) => (
            <span 
              key={index}
              className="text-xs bg-white/60 backdrop-blur-sm rounded-full px-3 py-1 text-purple-700 border border-white/50"
            >
              {feature}
            </span>
          ))}
          {getTierFeatures(requiredTier).length > 3 && (
            <span className="text-xs text-purple-600 font-medium">
              +{getTierFeatures(requiredTier).length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for easy usage in components
export function useUpgradePrompt() {
  const showUpgradePrompt = (currentTier: Tier | null, requiredTier: Tier, feature: string) => {
    // In a real app, this would show a modal or navigate to billing
    console.log(`Upgrade needed: ${feature} requires ${requiredTier}, current: ${currentTier}`);
    window.location.href = '/owner/billing';
  };

  return { showUpgradePrompt };
}