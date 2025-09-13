'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/firebase-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  Download,
  Users,
  Zap
} from 'lucide-react'

interface SubscriptionData {
  tier: 'FREE' | 'PRO' | 'TEAM'
  status: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  usage: {
    searches: {
      used: number
      limit: number | null
      unlimited: boolean
      resetDate: string
    }
    features: {
      canExportData: boolean
      canAccessPremiumForum: boolean
      canDirectMessage: boolean
      prioritySupport: boolean
    }
  }
}

const tierInfo = {
  FREE: {
    name: 'Free',
    price: '$0',
    icon: CheckCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  PRO: {
    name: 'Pro',
    price: '$99/month',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  TEAM: {
    name: 'Team',
    price: '$299/month',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
}

export default function SubscriptionManager() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { user: firebaseUser } = useAuth()

  useEffect(() => {
    if (session?.user?.email) {
      fetchSubscriptionData()
    }
  }, [session])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/usage')
      const data = await response.json()
      setSubscriptionData(data)
    } catch (error) {
      console.error('Failed to fetch subscription data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setActionLoading('upgrade')
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'PRO',
          interval: 'monthly',
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/dashboard`,
        }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleManageBilling = async () => {
    setActionLoading('billing')
    // In a real implementation, you'd create a Stripe customer portal session
    alert('Billing management would redirect to Stripe customer portal')
    setActionLoading(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscriptionData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Unable to load subscription data</p>
        </CardContent>
      </Card>
    )
  }

  const currentTier = tierInfo[subscriptionData.tier]
  const TierIcon = currentTier.icon
  const searchUsage = subscriptionData.usage.searches
  const searchPercentage = searchUsage.unlimited 
    ? 0 
    : Math.min(100, (searchUsage.used / (searchUsage.limit || 1)) * 100)

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${currentTier.bgColor}`}>
                <TierIcon className={`h-6 w-6 ${currentTier.color}`} />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{currentTier.name} Plan</span>
                  {subscriptionData.tier !== 'FREE' && (
                    <Badge variant="default">{subscriptionData.status}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {currentTier.price}
                  {subscriptionData.currentPeriodEnd && (
                    <span className="ml-2">
                      • Renews {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {subscriptionData.tier === 'FREE' ? (
                <Button 
                  onClick={handleUpgrade}
                  disabled={actionLoading === 'upgrade'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {actionLoading === 'upgrade' ? 'Processing...' : 'Upgrade to Pro'}
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleManageBilling}
                  disabled={actionLoading === 'billing'}
                >
                  {actionLoading === 'billing' ? 'Loading...' : 'Manage Billing'}
                  <Settings className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {subscriptionData.cancelAtPeriodEnd && (
          <CardContent className="pt-0">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Subscription will cancel at period end
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your subscription will end on {new Date(subscriptionData.currentPeriodEnd!).toLocaleDateString()}.
                    You'll still have access to Pro features until then.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Usage This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Company Searches</span>
              <span className="text-sm text-gray-500">
                {searchUsage.unlimited 
                  ? `${searchUsage.used} searches (unlimited)` 
                  : `${searchUsage.used} / ${searchUsage.limit} searches`
                }
              </span>
            </div>
            {!searchUsage.unlimited && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${searchPercentage}%` }}
                  ></div>
                </div>
                {searchPercentage > 80 && (
                  <p className="text-sm text-orange-600 mt-2">
                    You're approaching your search limit. Consider upgrading for unlimited searches.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Reset Date */}
          <div className="text-sm text-gray-500">
            {searchUsage.unlimited 
              ? 'No search limits on your current plan'
              : `Search limit resets on ${new Date(searchUsage.resetDate).toLocaleDateString()}`
            }
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Available Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              {subscriptionData.usage.features.canExportData ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
              )}
              <span className={`text-sm ${subscriptionData.usage.features.canExportData ? 'text-gray-900' : 'text-gray-400'}`}>
                Data Export
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {subscriptionData.usage.features.canAccessPremiumForum ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
              )}
              <span className={`text-sm ${subscriptionData.usage.features.canAccessPremiumForum ? 'text-gray-900' : 'text-gray-400'}`}>
                Premium Forums
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {subscriptionData.usage.features.canDirectMessage ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
              )}
              <span className={`text-sm ${subscriptionData.usage.features.canDirectMessage ? 'text-gray-900' : 'text-gray-400'}`}>
                Direct Messaging
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {subscriptionData.usage.features.prioritySupport ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
              )}
              <span className={`text-sm ${subscriptionData.usage.features.prioritySupport ? 'text-gray-900' : 'text-gray-400'}`}>
                Priority Support
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Prompt for Free Users */}
      {subscriptionData.tier === 'FREE' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 rounded-lg p-2">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Unlock the Full Power of DealMecca
                </h3>
                <p className="text-gray-600 mb-4">
                  Get unlimited searches, advanced ROI tracking, premium forum access, 
                  and priority support for just $99/month.
                </p>
                <Button 
                  onClick={handleUpgrade}
                  disabled={actionLoading === 'upgrade'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {actionLoading === 'upgrade' ? 'Processing...' : 'Upgrade Now'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 