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
    if (!idToken) return

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
          name: 'Pro Plan',
          description: 'For ambitious sales professionals',
          monthlyPrice: 29,
          annualPrice: 290,
          features: [
            { text: 'Unlimited deal intelligence searches', icon: '🔍', highlight: true },
            { text: 'Advanced CRM integration & sync', icon: '🔄', highlight: false },
            { text: 'Real-time prospect scoring', icon: '⭐', highlight: true },
            { text: 'Premium forum & expert network', icon: '👥', highlight: false },
            { text: 'Data export & reporting tools', icon: '📊', highlight: false },
            { text: 'Priority email & chat support', icon: '🎧', highlight: false }
          ]
        }
      case 'TEAM':
        return {
          name: 'Team Plan',
          description: 'For high-performing sales teams',
          monthlyPrice: 99,
          annualPrice: 990,
          features: [
            { text: 'Everything in Pro for unlimited users', icon: '✨', highlight: true },
            { text: 'Team performance analytics & leaderboards', icon: '📈', highlight: true },
            { text: 'Advanced user roles & permissions', icon: '🔐', highlight: false },
            { text: 'Custom API integrations & webhooks', icon: '⚡', highlight: true },
            { text: 'Dedicated customer success manager', icon: '🤝', highlight: false },
            { text: 'White-label options available', icon: '🎨', highlight: false }
          ]
        }
      default:
        return {
          name: 'Free Plan',
          description: 'Basic features to get started',
          monthlyPrice: 0,
          annualPrice: 0,
          features: [
            { text: '10 deal searches per month', icon: '🔍', highlight: false },
            { text: 'Basic prospect insights', icon: '👤', highlight: false },
            { text: 'Community forum access', icon: '💬', highlight: false },
            { text: 'Email support (48hr response)', icon: '📧', highlight: false }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/forum" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Link>
              <div className="flex items-center space-x-2">
                <Receipt className="w-6 h-6 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900">Billing & Subscription</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Current Plan
          </h2>

          <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-lg p-6 border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{currentPlan.name}</h3>
                <p className="text-gray-600">{currentPlan.description}</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className={`flex items-center text-sm ${feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-xs">{feature.icon}</span>
                  </div>
                  <span>{feature.text}</span>
                  {feature.highlight && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Active</span>}
                </div>
              ))}
            </div>

            {subscription?.stripeCustomerId && (
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={openCustomerPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
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
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of sales professionals who close more deals with DealMecca's intelligence platform
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white"></div>
              </div>
              <span className="ml-3 text-sm text-gray-600">2,500+ sales professionals trust DealMecca</span>
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        {subscription?.tier === 'FREE' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Pro Plan */}
            <div className="bg-white rounded-xl border-2 border-blue-200 p-8 relative transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex flex-col h-full">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                  🔥 Most Popular
                </span>
              </div>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Pro Plan</h3>
                <p className="text-gray-600 text-lg">For ambitious sales professionals</p>
              </div>

              <div className="text-center mb-8">
                <div className="relative">
                  <div className="text-5xl font-bold text-gray-900 mb-1">$29</div>
                  <div className="text-gray-600 text-lg">/month</div>
                  <div className="inline-flex items-center mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    <span className="mr-1">💰</span> Save $59/year with annual billing
                  </div>
                </div>
              </div>

              <ul className="space-y-4 flex-grow mb-8">
                {getPlanDetails('PRO').features.map((feature, index) => (
                  <li key={index} className={`flex items-center ${feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-xs">{feature.icon}</span>
                    </div>
                    <span className="text-sm">{feature.text}</span>
                    {feature.highlight && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">Popular</span>}
                  </li>
                ))}
              </ul>

              <div className="space-y-4 mt-auto">
                <button
                  onClick={() => createCheckoutSession('PRO', 'monthly')}
                  disabled={upgradeLoading === 'PRO_monthly'}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {upgradeLoading === 'PRO_monthly' ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>🚀 Start Closing More Deals Today</span>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => createCheckoutSession('PRO', 'annual')}
                  disabled={upgradeLoading === 'PRO_annual'}
                  className="w-full bg-white border-2 border-blue-600 text-blue-600 py-4 rounded-xl hover:bg-blue-50 disabled:opacity-50 font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {upgradeLoading === 'PRO_annual' ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>💰 Save $59 - Go Annual</span>
                    </div>
                  )}
                </button>
                <div className="text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center">
                    <span className="mr-1">🔒</span> 30-day money-back guarantee
                  </p>
                </div>
              </div>
            </div>

            {/* Team Plan */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 relative transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex flex-col h-full">
              <div className="absolute -top-3 right-4">
                <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-1 rounded-full text-xs font-semibold">
                  ⚡ Best Value
                </span>
              </div>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Team Plan</h3>
                <p className="text-gray-600 text-lg">For high-performing sales teams</p>
              </div>

              <div className="text-center mb-8">
                <div className="relative">
                  <div className="text-5xl font-bold text-gray-900 mb-1">$99</div>
                  <div className="text-gray-600 text-lg">/month</div>
                  <div className="inline-flex items-center mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    <span className="mr-1">💰</span> Save $198/year with annual billing
                  </div>
                  <div className="text-xs text-gray-500 mt-1">$33/month per team member (3+ users)</div>
                </div>
              </div>

              <ul className="space-y-4 flex-grow mb-8">
                {getPlanDetails('TEAM').features.map((feature, index) => (
                  <li key={index} className={`flex items-center ${feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-xs">{feature.icon}</span>
                    </div>
                    <span className="text-sm">{feature.text}</span>
                    {feature.highlight && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Premium</span>}
                  </li>
                ))}
              </ul>

              <div className="space-y-4 mt-auto">
                <button
                  onClick={() => createCheckoutSession('TEAM', 'monthly')}
                  disabled={upgradeLoading === 'TEAM_monthly'}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {upgradeLoading === 'TEAM_monthly' ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>🏆 Scale Your Team's Success</span>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => createCheckoutSession('TEAM', 'annual')}
                  disabled={upgradeLoading === 'TEAM_annual'}
                  className="w-full bg-white border-2 border-green-600 text-green-600 py-4 rounded-xl hover:bg-green-50 disabled:opacity-50 font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {upgradeLoading === 'TEAM_annual' ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>💎 Save $198 - Go Annual</span>
                    </div>
                  )}
                </button>
                <div className="text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center">
                    <span className="mr-1">📞</span> Free onboarding call included
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Social Proof & Testimonials */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted by 2,500+ Sales Professionals</h3>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-semibold text-green-600 text-lg mr-1">4.9/5</span>
                <div className="flex text-yellow-400">
                  ★★★★★
                </div>
              </div>
              <div className="text-gray-400">•</div>
              <div>
                <span className="font-semibold text-blue-600">89%</span> close rate improvement
              </div>
              <div className="text-gray-400">•</div>
              <div>
                <span className="font-semibold text-purple-600">3.2x</span> faster deal cycles
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">SM</div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">Sarah M.</div>
                  <div className="text-sm text-gray-600">Enterprise Sales, SaaS</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                "DealMecca helped me identify $2.3M in opportunities I would have missed. The intelligence is incredible."
              </p>
              <div className="flex text-yellow-400 text-xs mt-2">★★★★★</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">JD</div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">James D.</div>
                  <div className="text-sm text-gray-600">Sales Director, Tech</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                "Our team's quota attainment went from 67% to 94% in just 6 months. DealMecca is a game-changer."
              </p>
              <div className="flex text-yellow-400 text-xs mt-2">★★★★★</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">LK</div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">Lisa K.</div>
                  <div className="text-sm text-gray-600">VP Sales, FinTech</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                "The data insights are phenomenal. We now know exactly which prospects to prioritize. ROI was immediate."
              </p>
              <div className="flex text-yellow-400 text-xs mt-2">★★★★★</div>
            </div>
          </div>

          <div className="text-center mt-6">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
              🔥 <span className="ml-1">47 professionals upgraded in the last 24 hours</span>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <DollarSign className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${subscription?.tier === 'FREE' ? '0' : currentPlan.monthlyPrice}
              </div>
              <div className="text-sm text-gray-600 font-medium">Monthly Investment</div>
              {subscription?.tier !== 'FREE' && (
                <div className="text-xs text-green-600 mt-1 font-semibold">
                  💰 ROI: ~$2,500/month avg
                </div>
              )}
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <Calendar className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : 'N/A'
                }
              </div>
              <div className="text-sm text-gray-600 font-medium">Next Billing Date</div>
              {subscription?.tier !== 'FREE' && (
                <div className="text-xs text-blue-600 mt-1 font-semibold">
                  ⚡ Auto-renewal active
                </div>
              )}
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <TrendingUp className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {subscription?.status === 'ACTIVE' ? '🚀 Active' : subscription?.status || 'Active'}
              </div>
              <div className="text-sm text-gray-600 font-medium">Account Status</div>
              {subscription?.tier !== 'FREE' && (
                <div className="text-xs text-purple-600 mt-1 font-semibold">
                  ✨ Premium features enabled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}