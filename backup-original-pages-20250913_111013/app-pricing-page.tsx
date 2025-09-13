'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/firebase-auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  X, 
  Zap, 
  Star, 
  Users, 
  Building, 
  Shield, 
  BarChart3,
  Download,
  MessageCircle,
  Crown
} from 'lucide-react'

const features = {
  FREE: [
    { name: '10 company searches per month', included: true, note: undefined },
    { name: 'Basic event listings', included: true, note: undefined },
    { name: 'Forum participation (read-only premium)', included: true, note: undefined },
    { name: 'Basic ROI tracking', included: true, note: undefined },
    { name: 'Unlimited searches', included: false, note: undefined },
    { name: 'Advanced ROI tracking with revenue attribution', included: false, note: undefined },
    { name: 'Full event networking & messaging', included: false, note: undefined },
    { name: 'Premium forum access', included: false, note: undefined },
    { name: 'Data export capabilities', included: false, note: undefined },
    { name: 'Priority customer support', included: false, note: undefined },
    { name: 'Team analytics dashboard', included: false, note: undefined },
    { name: 'Custom integrations', included: false, note: undefined },
  ],
  PRO: [
    { name: '10 company searches per month', included: true, note: 'Unlimited' },
    { name: 'Basic event listings', included: true, note: 'Advanced filtering' },
    { name: 'Forum participation', included: true, note: 'Full premium access' },
    { name: 'Basic ROI tracking', included: true, note: 'Advanced with revenue' },
    { name: 'Unlimited searches', included: true, note: undefined },
    { name: 'Advanced ROI tracking with revenue attribution', included: true, note: undefined },
    { name: 'Full event networking & messaging', included: true, note: undefined },
    { name: 'Premium forum access', included: true, note: undefined },
    { name: 'Data export capabilities', included: true, note: undefined },
    { name: 'Priority customer support', included: true, note: undefined },
    { name: 'Team analytics dashboard', included: false, note: undefined },
    { name: 'Custom integrations', included: false, note: undefined },
  ],
  TEAM: [
    { name: 'Everything in Pro for up to 5 users', included: true, note: undefined },
    { name: 'Team analytics dashboard', included: true, note: undefined },
    { name: 'Shared goal tracking and reporting', included: true, note: undefined },
    { name: 'Team event coordination features', included: true, note: undefined },
    { name: 'Admin controls and user management', included: true, note: undefined },
    { name: 'Bulk data operations', included: true, note: undefined },
    { name: 'Custom integrations support', included: true, note: undefined },
    { name: 'Dedicated account manager', included: true, note: undefined },
  ],
}

const plans = [
  {
    name: 'Free',
    tier: 'FREE',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    annualPrice: 0,
    savings: 0,
    icon: Star,
    popular: false,
    cta: 'Get Started Free',
    features: features.FREE,
  },
  {
    name: 'Pro',
    tier: 'PRO',
    description: 'For serious media sales professionals',
    monthlyPrice: 99,
    annualPrice: 990,
    savings: 17,
    icon: Zap,
    popular: true,
    cta: 'Start Pro Trial',
    features: features.PRO,
  },
  {
    name: 'Team',
    tier: 'TEAM',
    description: 'For growing sales teams',
    monthlyPrice: 299,
    annualPrice: 2990,
    savings: 17,
    icon: Users,
    popular: false,
    cta: 'Start Team Trial',
    features: features.TEAM,
  },
]

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Senior Account Executive',
    company: 'GroupM',
    content: 'DealMecca helped me identify 40% more qualified prospects and close $2.3M in new business last quarter.',
    avatar: '👩‍💼',
  },
  {
    name: 'Michael Chen',
    role: 'Sales Director',
    company: 'Independent Agency',
    content: 'The ROI tracking alone pays for itself. I can finally prove the value of conferences to my CFO.',
    avatar: '👨‍💼',
  },
  {
    name: 'Jessica Rodriguez',
    role: 'VP of Sales',
    company: 'Media Startup',
    content: 'Team features transformed how we coordinate events and share leads. Our conversion rate is up 60%.',
    avatar: '👩‍💼',
  },
]

const faqs = [
  {
    question: 'How does the free trial work?',
    answer: 'Start with our free plan immediately. Upgrade anytime to Pro or Team with a 14-day money-back guarantee.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, cancel anytime from your billing dashboard. You\'ll retain access until your current billing period ends.',
  },
  {
    question: 'What counts as a "search"?',
    answer: 'Each company lookup counts as one search. Viewing contacts within a company doesn\'t count as additional searches.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes! Save 17% when you pay annually. That\'s like getting 2 months free.',
  },
  {
    question: 'How does team billing work?',
    answer: 'Team plans include up to 5 users. Need more? Contact us for custom enterprise pricing.',
  },
]

import { SessionDebugComponent } from './debug';

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { user: firebaseUser } = useAuth()
  const router = useRouter()

  const handleUpgrade = async (tier: string) => {
    if (tier === 'FREE') {
      router.push('/auth/signup')
      return
    }

    if (!session) {
      router.push('/auth/signin?callbackUrl=/pricing')
      return
    }

    setIsLoading(tier)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          interval: billingInterval,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      })

      const data = await response.json()

      if (data.error) {
        alert(data.error)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the plan that's right for your media sales goals. 
            Start free, upgrade when you need more power.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <span className={billingInterval === 'monthly' ? 'font-semibold' : 'text-gray-500'}>
              Monthly
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingInterval === 'annual' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingInterval === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={billingInterval === 'annual' ? 'font-semibold' : 'text-gray-500'}>
              Annual
            </span>
            {billingInterval === 'annual' && (
              <Badge variant="secondary" className="ml-2">Save 17%</Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon
            const price = billingInterval === 'monthly' ? plan.monthlyPrice : plan.annualPrice
            const isCurrentlyLoading = isLoading === plan.tier

            return (
              <Card
                key={plan.tier}
                className={`relative ${
                  plan.popular
                    ? 'border-blue-500 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                } transition-all duration-200`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-3">
                    <Icon className={`h-8 w-8 ${plan.popular ? 'text-blue-500' : 'text-gray-600'}`} />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">${price}</span>
                      {price > 0 && (
                        <span className="text-gray-500 ml-1">
                          /{billingInterval === 'monthly' ? 'month' : 'year'}
                        </span>
                      )}
                    </div>
                    {billingInterval === 'annual' && price > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Save ${plan.monthlyPrice * 12 - plan.annualPrice}/year
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Button
                    onClick={() => handleUpgrade(plan.tier)}
                    disabled={isCurrentlyLoading}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    {isCurrentlyLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      plan.cta
                    )}
                  </Button>

                  <ul className="space-y-3">
                    {plan.features.slice(0, 6).map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                          {feature.note || feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {plan.features.length > 6 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      + {plan.features.length - 6} more features
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-16">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Feature Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Features
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Free
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pro
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {features.FREE.map((feature, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {feature.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {features.FREE[idx]?.included ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {features.PRO[idx]?.included ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Trusted by 7,000+ Media Sales Professionals
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">{testimonial.avatar}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h3>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="border-gray-200">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                  <p className="text-gray-700">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Close More Deals?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of media sales professionals who use DealMecca 
            to find better prospects, track ROI, and build stronger relationships.
          </p>
          <Button
            size="lg"
            onClick={() => handleUpgrade('PRO')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>
      <SessionDebugComponent />
    </div>
  )
} 