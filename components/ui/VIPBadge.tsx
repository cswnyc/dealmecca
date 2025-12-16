'use client';

import { Crown, Star, Diamond, Gem, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type VIPLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

interface VIPBadgeProps {
  level: VIPLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const VIP_CONFIG = {
  BRONZE: {
    icon: Star,
    label: 'Bronze VIP',
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
    description: 'Active community member'
  },
  SILVER: {
    icon: Gem,
    label: 'Silver VIP',
    color: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    description: 'Valuable contributor'
  },
  GOLD: {
    icon: Crown,
    label: 'Gold VIP',
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    description: 'Trusted advisor'
  },
  PLATINUM: {
    icon: Diamond,
    label: 'Platinum VIP',
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
    description: 'Industry leader'
  },
  DIAMOND: {
    icon: Zap,
    label: 'Diamond VIP',
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    description: 'Elite member'
  }
};

export function VIPBadge({ level, size = 'md', showLabel = true, className }: VIPBadgeProps) {
  const config = VIP_CONFIG[level];
  const Icon = config.icon;

  const sizes = {
    sm: {
      icon: 'w-3 h-3',
      badge: 'text-xs px-2 py-1',
      iconOnly: 'w-4 h-4 p-1'
    },
    md: {
      icon: 'w-4 h-4',
      badge: 'text-sm px-3 py-1',
      iconOnly: 'w-5 h-5 p-1'
    },
    lg: {
      icon: 'w-5 h-5',
      badge: 'text-base px-4 py-2',
      iconOnly: 'w-6 h-6 p-1'
    }
  };

  if (!showLabel) {
    return (
      <div 
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          `bg-gradient-to-r ${config.color}`,
          sizes[size].iconOnly,
          className
        )}
        title={`${config.label} - ${config.description}`}
      >
        <Icon className={cn('text-white', sizes[size].icon)} />
      </div>
    );
  }

  return (
    <Badge 
      className={cn(
        'inline-flex items-center space-x-1 font-medium',
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizes[size].badge,
        className
      )}
      variant="outline"
    >
      <Icon className={sizes[size].icon} />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}

interface VIPIndicatorProps {
  level: VIPLevel;
  contributions?: number;
  tier?: string;
  className?: string;
}

export function VIPIndicator({ level, contributions, tier, className }: VIPIndicatorProps) {
  const config = VIP_CONFIG[level];

  return (
    <div className={cn('flex items-center space-x-3 p-3 rounded-lg border', config.bgColor, config.borderColor, className)}>
      <div className={cn('p-2 rounded-full bg-gradient-to-r', config.color)}>
        <config.icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <span className={cn('font-semibold', config.textColor)}>{config.label}</span>
          {tier && (
            <Badge variant="secondary" className="text-xs">
              {tier}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{config.description}</p>
        {contributions && (
          <p className="text-xs text-muted-foreground mt-1">
            {contributions} contributions
          </p>
        )}
      </div>
    </div>
  );
}

// Utility function to determine VIP level based on activity
export function calculateVIPLevel(data: {
  contributions?: number;
  gems?: number;
  streak?: number;
  helpfulVotes?: number;
  tier?: string;
}): VIPLevel {
  const { contributions = 0, gems = 0, streak = 0, helpfulVotes = 0, tier } = data;
  
  // Calculate score based on various factors
  let score = 0;
  score += contributions * 10;
  score += gems * 1;
  score += streak * 5;
  score += helpfulVotes * 2;
  
  // Tier bonus
  if (tier === 'TEAM') score += 200;
  if (tier === 'PRO') score += 100;
  
  // Determine VIP level based on score
  if (score >= 1000) return 'DIAMOND';
  if (score >= 500) return 'PLATINUM';
  if (score >= 200) return 'GOLD';
  if (score >= 50) return 'SILVER';
  return 'BRONZE';
}