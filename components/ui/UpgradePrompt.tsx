'use client';

import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { UserRole, getRoleDefinition, permissionSystem } from '@/lib/permissions';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Alert, AlertDescription } from './alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { 
  Crown, 
  Star, 
  Zap, 
  Check, 
  ArrowRight, 
  CreditCard, 
  Phone, 
  Mail,
  Sparkles,
  Users,
  BarChart3,
  Shield
} from 'lucide-react';

interface UpgradePromptProps {
  trigger?: React.ReactNode;
  currentRole?: UserRole;
  targetRole?: UserRole;
  reason?: string;
  feature?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RoleIcons: Record<UserRole, React.ComponentType<any>> = {
  FREE: Shield,
  PRO: Star,
  TEAM: Users,
  ENTERPRISE: Crown,
  ADMIN: Crown,
  SUPER_ADMIN: Crown
};

const RoleColors: Record<UserRole, string> = {
  FREE: 'from-gray-400 to-gray-600',
  PRO: 'from-blue-500 to-blue-700',
  TEAM: 'from-green-500 to-green-700',
  ENTERPRISE: 'from-purple-500 to-purple-700',
  ADMIN: 'from-orange-500 to-orange-700',
  SUPER_ADMIN: 'from-red-500 to-red-700'
};

const PlanPricing: Record<UserRole, { monthly: number; yearly: number; popular?: boolean }> = {
  FREE: { monthly: 0, yearly: 0 },
  PRO: { monthly: 49, yearly: 490, popular: true },
  TEAM: { monthly: 149, yearly: 1490 },
  ENTERPRISE: { monthly: 499, yearly: 4990 },
  ADMIN: { monthly: 0, yearly: 0 },
  SUPER_ADMIN: { monthly: 0, yearly: 0 }
};

export function UpgradePrompt({
  trigger,
  currentRole,
  targetRole,
  reason,
  feature,
  size = 'md',
  className = ''
}: UpgradePromptProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<UserRole | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const userRole = currentRole || user?.role || 'FREE';
  const suggestedRole = targetRole || getNextRole(userRole);

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Crown className="h-4 w-4 mr-2" />
      Upgrade Plan
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className={`max-w-4xl ${className}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {reason ? 'Upgrade Required' : 'Choose Your Plan'}
          </DialogTitle>
          <DialogDescription>
            {reason || 'Unlock powerful features to grow your business'}
            {feature && ` Access to ${feature} requires a higher plan.`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans">Choose Plan</TabsTrigger>
            <TabsTrigger value="comparison">Compare Features</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            {/* Billing Toggle */}
            <div className="flex items-center justify-center">
              <div className="flex items-center bg-muted p-1 rounded-lg">
                <button
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    billingCycle === 'monthly' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    billingCycle === 'yearly' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setBillingCycle('yearly')}
                >
                  Yearly
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Save 20%
                  </Badge>
                </button>
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['PRO', 'TEAM', 'ENTERPRISE'] as UserRole[]).map((role) => {
                const definition = getRoleDefinition(role);
                const pricing = PlanPricing[role];
                const Icon = RoleIcons[role];
                const isCurrentPlan = userRole === role;
                const isRecommended = role === suggestedRole;
                const isSelected = selectedPlan === role;
                
                if (!definition) return null;

                return (
                  <Card 
                    key={role}
                    className={`relative cursor-pointer transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-purple-500 scale-105' : 'hover:scale-102'
                    } ${isRecommended ? 'border-purple-500' : ''}`}
                    onClick={() => setSelectedPlan(role)}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-600 text-white">
                          Recommended
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center">
                      <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${RoleColors[role]}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{definition.name}</CardTitle>
                      <CardDescription>{definition.description}</CardDescription>
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          ${billingCycle === 'monthly' ? pricing.monthly : pricing.yearly}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          per {billingCycle === 'monthly' ? 'month' : 'year'}
                        </div>
                        {billingCycle === 'yearly' && pricing.monthly > 0 && (
                          <div className="text-xs text-green-600">
                            Save ${(pricing.monthly * 12) - pricing.yearly}/year
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Key Features */}
                      <ul className="space-y-2 text-sm">
                        {getKeyFeatures(role).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {isCurrentPlan ? (
                        <Button disabled className="w-full">
                          Current Plan
                        </Button>
                      ) : (
                        <Button 
                          className="w-full"
                          variant={isRecommended ? 'default' : 'outline'}
                          onClick={() => handleUpgrade(role)}
                        >
                          {getRoleLevel(userRole) < getRoleLevel(role) ? 'Upgrade' : 'Downgrade'} to {definition.name}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Contact Sales for Enterprise */}
            <Card className="border-dashed">
              <CardContent className="text-center py-6">
                <h3 className="font-semibold mb-2">Need something custom?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Contact our sales team for custom enterprise solutions
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Schedule Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <FeatureComparisonTable currentRole={userRole} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );

  function handleUpgrade(targetRole: UserRole) {
    // Redirect to billing page with selected plan
    const params = new URLSearchParams({
      plan: targetRole.toLowerCase(),
      cycle: billingCycle
    });
    
    if (reason) params.set('reason', reason);
    if (feature) params.set('feature', feature);
    
    window.location.href = `/billing/upgrade?${params.toString()}`;
  }
}

function getNextRole(currentRole: UserRole): UserRole {
  const upgradePath: Record<UserRole, UserRole> = {
    FREE: 'PRO',
    PRO: 'TEAM',
    TEAM: 'ENTERPRISE',
    ENTERPRISE: 'ENTERPRISE',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN'
  };
  return upgradePath[currentRole];
}

function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    FREE: 1,
    PRO: 2,
    TEAM: 3,
    ENTERPRISE: 4,
    ADMIN: 5,
    SUPER_ADMIN: 6
  };
  return levels[role] || 0;
}

function getKeyFeatures(role: UserRole): string[] {
  const features: Record<UserRole, string[]> = {
    FREE: [],
    PRO: [
      '1,000 searches/month',
      'Advanced search filters',
      'Email addresses included',
      'Export up to 1,000 records',
      'Search alerts',
      'Basic analytics'
    ],
    TEAM: [
      '5,000 searches/month',
      'Phone numbers included',
      'Team collaboration',
      'Unlimited saved searches',
      'API access',
      '10 team members'
    ],
    ENTERPRISE: [
      'Unlimited searches',
      'Premium data insights',
      'Advanced analytics',
      'White-label options',
      'Dedicated success manager',
      '100+ team members'
    ],
    ADMIN: [],
    SUPER_ADMIN: []
  };
  return features[role] || [];
}

function FeatureComparisonTable({ currentRole }: { currentRole: UserRole }) {
  const roles: UserRole[] = ['FREE', 'PRO', 'TEAM', 'ENTERPRISE'];
  const comparison = permissionSystem.getRoleComparison(roles);

  const features = [
    { key: 'searchesPerMonth', label: 'Monthly Searches' },
    { key: 'savedSearches', label: 'Saved Searches' },
    { key: 'exportRecordsPerMonth', label: 'Monthly Exports' },
    { key: 'teamMembers', label: 'Team Members' },
    { key: 'apiRequestsPerMonth', label: 'API Requests' },
    { key: 'prioritySupport', label: 'Priority Support' },
    { key: 'advancedAnalytics', label: 'Advanced Analytics' },
    { key: 'customIntegrations', label: 'Custom Integrations' }
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-medium">Feature</th>
            {roles.map(role => {
              const Icon = RoleIcons[role];
              const isCurrentRole = role === currentRole;
              return (
                <th key={role} className={`text-center p-4 ${isCurrentRole ? 'bg-muted' : ''}`}>
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="h-4 w-4" />
                    {role}
                    {isCurrentRole && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {features.map(feature => (
            <tr key={feature.key} className="border-b hover:bg-muted/50">
              <td className="p-4 font-medium">{feature.label}</td>
              {roles.map(role => {
                const value = comparison[feature.key]?.[role];
                const isCurrentRole = role === currentRole;
                return (
                  <td key={role} className={`text-center p-4 ${isCurrentRole ? 'bg-muted' : ''}`}>
                    {typeof value === 'boolean' ? (
                      value ? <Check className="h-4 w-4 text-green-600 mx-auto" /> : '—'
                    ) : (
                      <span className={value === 'Unlimited' ? 'text-green-600 font-medium' : ''}>
                        {value?.toLocaleString()}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Inline upgrade prompt for specific features
export function InlineUpgradePrompt({ 
  feature, 
  targetRole, 
  className = '' 
}: { 
  feature: string;
  targetRole: UserRole;
  className?: string;
}) {
  const { user } = useUser();
  
  if (!user) return null;
  
  return (
    <Alert className={className}>
      <Crown className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          <strong>{feature}</strong> requires {targetRole} plan or higher.
        </span>
        <UpgradePrompt
          trigger={
            <Button size="sm" variant="default">
              Upgrade Now
            </Button>
          }
          currentRole={user.role}
          targetRole={targetRole}
          feature={feature}
        />
      </AlertDescription>
    </Alert>
  );
}