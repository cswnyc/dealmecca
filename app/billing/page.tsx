'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/firebase-auth'
import {
  Receipt,
  CreditCard,
  Calendar,
  ArrowLeft,
  DollarSign,
  CheckCircle,
  Clock,
  ExternalLink,
  Star,
  Zap,
  Users,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface SubscriptionData {
  tier: 'FREE' | 'PRO' | 'TEAM'
  status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELLED'
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
  stripeCustomerId?: string
}

export default function BillingPage() {
  const { user, idToken } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgradeLoading, setUpgradeLoading] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        setSubscription({
          tier: 'FREE',
          status: 'ACTIVE',
          cancelAtPeriodEnd: false
        })
        setLoading(false)
      }
    }, 3000)

    fetchSubscriptionData()

    return () => clearTimeout(timeout)
  }, [user, idToken])

  const fetchSubscriptionData = async () => {
    try {
      if (!user || !idToken) {
        // If no user/token, set default free plan and stop loading
        setSubscription({
          tier: 'FREE',
          status: 'ACTIVE',
          cancelAtPeriodEnd: false
        })
        setLoading(false)
        return
      }

      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setSubscription({
          tier: userData.subscriptionTier || 'FREE',
          status: userData.subscriptionStatus || 'ACTIVE',
          currentPeriodEnd: userData.currentPeriodEnd,
          cancelAtPeriodEnd: userData.cancelAtPeriodEnd || false,
          stripeCustomerId: userData.stripeCustomerId
        })
      } else {
        // If API call fails, default to free plan
        setSubscription({
          tier: 'FREE',
          status: 'ACTIVE',
          cancelAtPeriodEnd: false
        })
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error)
      // On error, default to free plan
      setSubscription({
        tier: 'FREE',
        status: 'ACTIVE',
        cancelAtPeriodEnd: false
      })
    } finally {
      setLoading(false)
    }
  }

  const createCheckoutSession = async (tier: 'PRO' | 'TEAM', interval: 'monthly' | 'annual') => {
    // Check if user is authenticated
    if (!user || !idToken) {
      console.log('🔐 User not authenticated, redirecting to sign-in')
      window.location.href = `/auth/signin?returnTo=${encodeURIComponent('/billing')}`
      return
    }

    setUpgradeLoading(`${tier}_${interval}`)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          tier,
          interval,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`
        })
      })

      const data = await response.json()

      console.log('🔥 Frontend Checkout Response:', {
        tier,
        interval,
        responseOk: response.ok,
        data
      })

      if (data.url) {
        console.log('✅ Redirecting to Stripe:', data.url)
        window.location.href = data.url
      } else {
        console.error('❌ No URL in response:', data)
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout process. Please try again.')
    } finally {
      setUpgradeLoading('')
    }
  }

  const openCustomerPortal = async () => {
    if (!idToken || !subscription?.stripeCustomerId) return

    setPortalLoading(true)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          returnUrl: window.location.href
        })
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to open billing portal')
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  const getPlanDetails = (tier: string) => {
    switch (tier) {
      case 'PRO':
        return {
          name: 'Pro',
          description: 'For media professionals',
          monthlyPrice: 29,
          annualPrice: 299, // $299/year
          features: [
            'Unlimited company & contact searches',
            'Advanced filtering & insights',
            'Data export & reporting',
            'Premium forum access',
            'Priority support',
            'CRM integrations'
          ]
        }
      case 'TEAM':
        return {
          name: 'Team',
          description: 'For agencies & teams',
          monthlyPrice: 99,
          annualPrice: 999, // $999/year
          features: [
            'Team performance analytics',
            'User roles & permissions',
            'API access & webhooks',
            'Dedicated success manager',
            'Custom integrations',
            'White-label options'
          ]
        }
      default:
        return {
          name: 'Free',
          description: 'Get started for free',
          monthlyPrice: 0,
          annualPrice: 0,
          features: [
            '5 searches per month',
            'Basic company profiles',
            'Community forum access',
            'Email support (48hr)'
          ]
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  const currentPlan = getPlanDetails(subscription?.tier || 'FREE')
  const proPlan = getPlanDetails('PRO')
  const teamPlan = getPlanDetails('TEAM')
  const freePlan = getPlanDetails('FREE')

  const getPrice = (plan: any) => {
    return billingInterval === 'yearly' ? plan.annualPrice : plan.monthlyPrice
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/forum" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Link>
              <div className="flex items-center space-x-2">
                <Receipt className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900">Billing & Plans</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose the right plan for your media needs
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join 2,500+ media professionals who trust GetMecca
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                billingInterval === 'yearly'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>Yearly billing</span>
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                -18%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{freePlan.name}</h3>
              <p className="text-sm text-gray-600">{freePlan.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">${getPrice(freePlan)}</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
            </div>

            <button
              className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors mb-6"
              disabled={subscription?.tier === 'FREE'}
            >
              {subscription?.tier === 'FREE' ? 'Current Plan' : 'Get Started'}
            </button>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">What's included</p>
              <ul className="space-y-2.5">
                {freePlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2.5 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pro Plan - Popular */}
          <div className="bg-white rounded-xl border-2 border-purple-500 p-6 hover:shadow-xl transition-shadow relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                Popular
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{proPlan.name}</h3>
              <p className="text-sm text-gray-600">{proPlan.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">${getPrice(proPlan)}</span>
                <span className="text-gray-600 ml-2">
                  /{billingInterval === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
            </div>

            <button
              onClick={() => createCheckoutSession('PRO', billingInterval === 'yearly' ? 'annual' : 'monthly')}
              disabled={upgradeLoading === `PRO_${billingInterval}` || subscription?.tier === 'PRO'}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors mb-6"
            >
              {upgradeLoading === `PRO_${billingInterval}` ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : subscription?.tier === 'PRO' ? (
                'Current Plan'
              ) : (
                'Start Free Trial'
              )}
            </button>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">All Free features, plus</p>
              <ul className="space-y-2.5">
                {proPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2.5 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Team Plan */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{teamPlan.name}</h3>
              <p className="text-sm text-gray-600">{teamPlan.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">${getPrice(teamPlan)}</span>
                <span className="text-gray-600 ml-2">
                  /{billingInterval === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
            </div>

            <button
              onClick={() => createCheckoutSession('TEAM', billingInterval === 'yearly' ? 'annual' : 'monthly')}
              disabled={upgradeLoading === `TEAM_${billingInterval}` || subscription?.tier === 'TEAM'}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors mb-6"
            >
              {upgradeLoading === `TEAM_${billingInterval}` ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : subscription?.tier === 'TEAM' ? (
                'Current Plan'
              ) : (
                'Start Free Trial'
              )}
            </button>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">All Pro features, plus</p>
              <ul className="space-y-2.5">
                {teamPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2.5 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Current Plan - Only show for subscribed users */}
        {subscription?.tier !== 'FREE' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Your Current Plan
            </h2>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{currentPlan.name}</h3>
                <p className="text-gray-600 text-sm">{currentPlan.description}</p>
                {subscription?.status === 'PAST_DUE' && (
                  <div className="flex items-center mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Payment past due</span>
                  </div>
                )}
                {subscription?.cancelAtPeriodEnd && (
                  <div className="flex items-center mt-2 text-yellow-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">Cancels at period end</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  ${currentPlan.monthlyPrice}
                </div>
                <div className="text-sm text-gray-600">/month</div>
                {subscription?.currentPeriodEnd && (
                  <div className="text-xs text-gray-500 mt-1">
                    Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {subscription?.stripeCustomerId && (
              <div className="mt-4">
                <button
                  onClick={openCustomerPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Manage Subscription
                </button>
              </div>
            )}
          </div>
        )}

        {/* Social Proof & Testimonials - Simplified */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 mb-12">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Trusted by media professionals</h3>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-semibold text-purple-600 text-lg mr-1">4.9/5</span>
                <div className="flex text-yellow-400 text-lg">★★★★★</div>
              </div>
              <div className="text-gray-400">•</div>
              <div>
                <span className="font-semibold text-gray-900">2,500+</span> active users
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">SM</div>
                <div className="ml-2.5">
                  <div className="font-semibold text-gray-900 text-sm">Sarah M.</div>
                  <div className="text-xs text-gray-600">Media Buyer, Agency</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                "GetMecca saved us hours of research. The contact database is incredibly accurate."
              </p>
              <div className="flex text-yellow-400 text-xs mt-1.5">★★★★★</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">JD</div>
                <div className="ml-2.5">
                  <div className="font-semibold text-gray-900 text-sm">James D.</div>
                  <div className="text-xs text-gray-600">Director, Publisher</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                "Best investment for our media partnerships. The forum alone is worth the subscription."
              </p>
              <div className="flex text-yellow-400 text-xs mt-1.5">★★★★★</div>
            </div>
          </div>
        </div>

        {/* Billing Information - Only for subscribed users */}
        {subscription?.tier !== 'FREE' && subscription?.currentPeriodEnd && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ${currentPlan.monthlyPrice}
                </div>
                <div className="text-sm text-gray-600">Monthly</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Next Billing</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {subscription.status === 'ACTIVE' ? 'Active' : subscription.status}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}