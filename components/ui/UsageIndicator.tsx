'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { UsageAction } from '@/lib/usage-tracker';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Download, 
  Bookmark,
  Zap,
  Crown
} from 'lucide-react';

interface UsageData {
  current: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
  percentage: number;
}

interface UsageIndicatorProps {
  action: UsageAction;
  showDetails?: boolean;
  showUpgradePrompt?: boolean;
  className?: string;
  variant?: 'compact' | 'detailed' | 'card';
}

const ActionIcons: Record<UsageAction, React.ComponentType<any>> = {
  'search:performed': Search,
  'contact:viewed': Search,
  'contact:exported': Download,
  'company:viewed': Search,
  'company:exported': Download,
  'api:request': Zap,
  'search:saved': Bookmark,
  'team:invite_sent': Search,
  'data:premium_access': Crown,
  'bulk:operation': Download
};

const ActionLabels: Record<UsageAction, string> = {
  'search:performed': 'Searches',
  'contact:viewed': 'Contact Views',
  'contact:exported': 'Contact Exports',
  'company:viewed': 'Company Views',
  'company:exported': 'Company Exports',
  'api:request': 'API Requests',
  'search:saved': 'Saved Searches',
  'team:invite_sent': 'Team Invites',
  'data:premium_access': 'Premium Data Access',
  'bulk:operation': 'Bulk Operations'
};

export function UsageIndicator({
  action,
  showDetails = true,
  showUpgradePrompt = true,
  className = '',
  variant = 'detailed'
}: UsageIndicatorProps) {
  const { user } = useUser();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user, action]);

  const fetchUsage = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/usage/${action}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const data = await response.json();
      
      const usageData: UsageData = {
        current: data.current,
        limit: data.limit,
        remaining: data.remaining,
        unlimited: data.unlimited,
        percentage: data.unlimited ? 0 : Math.round((data.current / data.limit) * 100)
      };

      setUsage(usageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-muted h-4 rounded ${className}`} />
    );
  }

  if (error || !usage) {
    return null;
  }

  if (variant === 'compact') {
    return <CompactUsageIndicator usage={usage} action={action} className={className} />;
  }

  if (variant === 'card') {
    return (
      <CardUsageIndicator 
        usage={usage} 
        action={action} 
        showUpgradePrompt={showUpgradePrompt}
        className={className} 
      />
    );
  }

  return (
    <DetailedUsageIndicator 
      usage={usage} 
      action={action}
      showDetails={showDetails}
      showUpgradePrompt={showUpgradePrompt}
      className={className}
    />
  );
}

function CompactUsageIndicator({ 
  usage, 
  action, 
  className 
}: { 
  usage: UsageData;
  action: UsageAction;
  className: string;
}) {
  const Icon = ActionIcons[action];
  const status = getUsageStatus(usage);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <Progress 
          value={usage.unlimited ? 0 : usage.percentage} 
          className={`h-2 ${status.color}`}
        />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {usage.unlimited 
          ? `${usage.current.toLocaleString()} used`
          : `${usage.current}/${usage.limit}`
        }
      </span>
    </div>
  );
}

function DetailedUsageIndicator({
  usage,
  action,
  showDetails,
  showUpgradePrompt,
  className
}: {
  usage: UsageData;
  action: UsageAction;
  showDetails: boolean;
  showUpgradePrompt: boolean;
  className: string;
}) {
  const Icon = ActionIcons[action];
  const label = ActionLabels[action];
  const status = getUsageStatus(usage);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="font-medium text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {status.icon}
          <span className="text-sm text-muted-foreground">
            {usage.unlimited 
              ? 'Unlimited'
              : `${usage.remaining.toLocaleString()} remaining`
            }
          </span>
        </div>
      </div>

      {!usage.unlimited && (
        <Progress 
          value={usage.percentage} 
          className={`h-2 ${status.color}`}
        />
      )}

      {showDetails && (
        <div className="text-xs text-muted-foreground">
          {usage.unlimited 
            ? `${usage.current.toLocaleString()} ${label.toLowerCase()} this month`
            : `${usage.current.toLocaleString()} of ${usage.limit.toLocaleString()} used (${usage.percentage}%)`
          }
        </div>
      )}

      {showUpgradePrompt && status.showUpgrade && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {status.upgradeMessage}
            <Button variant="link" size="sm" className="h-auto p-0 ml-2">
              Upgrade Plan
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function CardUsageIndicator({
  usage,
  action,
  showUpgradePrompt,
  className
}: {
  usage: UsageData;
  action: UsageAction;
  showUpgradePrompt: boolean;
  className: string;
}) {
  const Icon = ActionIcons[action];
  const label = ActionLabels[action];
  const status = getUsageStatus(usage);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">
              {usage.unlimited ? '∞' : usage.current.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {usage.unlimited 
                ? 'Used this month'
                : `of ${usage.limit.toLocaleString()} limit`
              }
            </div>
          </div>
          <div className="text-right">
            {status.icon}
            <div className="text-xs text-muted-foreground mt-1">
              {usage.unlimited 
                ? 'Unlimited'
                : `${usage.remaining} left`
              }
            </div>
          </div>
        </div>

        {!usage.unlimited && (
          <Progress 
            value={usage.percentage} 
            className={`h-2 ${status.color}`}
          />
        )}

        {showUpgradePrompt && status.showUpgrade && (
          <div className="text-center">
            <Button size="sm" variant="outline" className="w-full">
              Upgrade for More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getUsageStatus(usage: UsageData) {
  if (usage.unlimited) {
    return {
      color: 'bg-green-500',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      showUpgrade: false,
      upgradeMessage: ''
    };
  }

  const percentage = usage.percentage;

  if (percentage >= 100) {
    return {
      color: 'bg-red-500',
      icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
      showUpgrade: true,
      upgradeMessage: 'Limit reached. Upgrade to continue using this feature.'
    };
  }

  if (percentage >= 80) {
    return {
      color: 'bg-yellow-500',
      icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      showUpgrade: true,
      upgradeMessage: 'Approaching limit. Consider upgrading your plan.'
    };
  }

  if (percentage >= 50) {
    return {
      color: 'bg-blue-500',
      icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
      showUpgrade: false,
      upgradeMessage: ''
    };
  }

  return {
    color: 'bg-green-500',
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    showUpgrade: false,
    upgradeMessage: ''
  };
}

// Multi-usage dashboard component
export function UsageDashboard({ className = '' }: { className?: string }) {
  const { user } = useUser();

  if (!user) return null;

  const keyActions: UsageAction[] = [
    'search:performed',
    'contact:exported',
    'search:saved',
    'api:request'
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {keyActions.map(action => (
        <UsageIndicator
          key={action}
          action={action}
          variant="card"
          showUpgradePrompt={true}
        />
      ))}
    </div>
  );
}