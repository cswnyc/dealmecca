'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/firebase-auth';
import {
  CreditCard,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  Minus,
  Plus,
} from 'lucide-react';
import { BillingToggle } from '@/components/billing/BillingToggle';
import { PricingCard } from '@/components/billing/PricingCard';
import { PRICING, TEAM_MIN_SEATS, getTeamMonthlyTotal, getTeamAnnualTotal, BillingPeriod } from '@/lib/pricing';

interface SubscriptionData {
  tier: 'FREE' | 'PRO' | 'TEAM';
  status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELLED';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
}

export default function BillingPage(): JSX.Element {
  const { user, idToken } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [teamSeats, setTeamSeats] = useState(TEAM_MIN_SEATS);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setSubscription({
          tier: 'FREE',
          status: 'ACTIVE',
          cancelAtPeriodEnd: false,
        });
        setLoading(false);
      }
    }, 3000);

    fetchSubscriptionData();

    return () => clearTimeout(timeout);
  }, [user, idToken]);

  const fetchSubscriptionData = async (): Promise<void> => {
    try {
      if (!user || !idToken) {
        setSubscription({
          tier: 'FREE',
          status: 'ACTIVE',
          cancelAtPeriodEnd: false,
        });
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setSubscription({
          tier: userData.subscriptionTier || 'FREE',
          status: userData.subscriptionStatus || 'ACTIVE',
          currentPeriodEnd: userData.currentPeriodEnd,
          cancelAtPeriodEnd: userData.cancelAtPeriodEnd || false,
          stripeCustomerId: userData.stripeCustomerId,
        });
      } else {
        setSubscription({
          tier: 'FREE',
          status: 'ACTIVE',
          cancelAtPeriodEnd: false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
      setSubscription({
        tier: 'FREE',
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (
    tier: 'PRO' | 'TEAM',
    interval: 'monthly' | 'annual'
  ): Promise<void> => {
    if (!user || !idToken) {
      window.location.href = `/auth/signin?returnTo=${encodeURIComponent('/billing')}`;
      return;
    }

    const quantity = tier === 'TEAM' ? teamSeats : 1;
    setUpgradeLoading(`${tier}_${interval}`);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          tier,
          interval,
          quantity,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No URL in response:', data);
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setUpgradeLoading('');
    }
  };

  const openCustomerPortal = async (): Promise<void> => {
    if (!idToken || !subscription?.stripeCustomerId) {
      return;
    }

    setPortalLoading(true);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to open billing portal');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleTeamSeatsChange = (delta: number): void => {
    setTeamSeats((prev) => Math.max(TEAM_MIN_SEATS, prev + delta));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B1220] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2575FC]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B1220]">
      {/* Header */}
      <div className="bg-white/80 dark:bg-[#0F1824]/80 backdrop-blur-sm shadow-sm border-b border-[#E6EAF2] dark:border-[#1E3A5F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/forum"
                className="flex items-center text-[#64748B] dark:text-[#9AA7C2] hover:text-[#162B54] dark:hover:text-[#EAF0FF] transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(37, 117, 252, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
                  <CreditCard className="w-6 h-6 text-[#2575FC] dark:text-[#5B8DFF]" />
                </div>
                <span className="text-[#64748B] dark:text-[#9AA7C2]">
                  Billing & Plans
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-[#162B54] dark:text-[#EAF0FF] mb-4">
            Choose the right plan for your media needs
          </h1>
          <p className="text-xl text-[#64748B] dark:text-[#9AA7C2] max-w-2xl mx-auto mb-8">
            Join thousands of media professionals who trust DealMecca
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <BillingToggle billingPeriod={billingPeriod} onChange={setBillingPeriod} />
          </div>
        </div>

        {/* Pricing Cards - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <PricingCard
            planKey="free"
            billingPeriod={billingPeriod}
            currentTier={subscription?.tier}
          />

          <PricingCard
            planKey="pro"
            billingPeriod={billingPeriod}
            currentTier={subscription?.tier}
            loading={upgradeLoading === `PRO_${billingPeriod}`}
            onUpgrade={() =>
              createCheckoutSession('PRO', billingPeriod === 'yearly' ? 'annual' : 'monthly')
            }
          />

          <div className="space-y-4">
            <PricingCard
              planKey="team"
              billingPeriod={billingPeriod}
              currentTier={subscription?.tier}
              loading={upgradeLoading === `TEAM_${billingPeriod}`}
              onUpgrade={() =>
                createCheckoutSession('TEAM', billingPeriod === 'yearly' ? 'annual' : 'monthly')
              }
              teamSeats={teamSeats}
            />

            {/* Team Seats Selector */}
            <div className="bg-white dark:bg-[#0F1824] border border-[#E6EAF2] dark:border-[#1E3A5F] rounded-xl p-4">
              <label className="block text-sm font-medium text-[#162B54] dark:text-[#EAF0FF] mb-2">
                Number of team members
              </label>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleTeamSeatsChange(-1)}
                  disabled={teamSeats <= TEAM_MIN_SEATS}
                  className="p-2 rounded-lg bg-[#F3F6FB] dark:bg-[#101E38] text-[#162B54] dark:text-[#EAF0FF] hover:bg-[#E6EAF2] dark:hover:bg-[#1E3A5F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#162B54] dark:text-[#EAF0FF]">
                    {teamSeats}
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-[#9AA7C2]">
                    {billingPeriod === 'monthly'
                      ? `$${getTeamMonthlyTotal(teamSeats)}/month`
                      : `$${getTeamAnnualTotal(teamSeats)}/year`}
                  </div>
                </div>
                <button
                  onClick={() => handleTeamSeatsChange(1)}
                  className="p-2 rounded-lg bg-[#F3F6FB] dark:bg-[#101E38] text-[#162B54] dark:text-[#EAF0FF] hover:bg-[#E6EAF2] dark:hover:bg-[#1E3A5F] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#9AA7C2] mt-2 text-center">
                Minimum {TEAM_MIN_SEATS} team members required
              </p>
            </div>
          </div>
        </div>

        {/* Current Plan - Only show for subscribed users */}
        {subscription?.tier !== 'FREE' && (
          <div className="bg-white dark:bg-[#0F1824] rounded-lg border border-[#E6EAF2] dark:border-[#1E3A5F] p-6 mb-12">
            <h2 className="text-lg font-semibold text-[#162B54] dark:text-[#EAF0FF] mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Your Current Plan
            </h2>

            <div
              className="flex items-center justify-between p-4 rounded-lg"
              style={{
                background:
                  'linear-gradient(90deg, rgba(37, 117, 252, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              }}
            >
              <div>
                <h3 className="text-xl font-bold text-[#162B54] dark:text-[#EAF0FF]">
                  {PRICING[subscription.tier.toLowerCase() as 'free' | 'pro' | 'team'].name}
                </h3>
                <p className="text-[#64748B] dark:text-[#9AA7C2] text-sm">
                  {PRICING[subscription.tier.toLowerCase() as 'free' | 'pro' | 'team'].tagline}
                </p>
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
                {subscription?.currentPeriodEnd && (
                  <div className="text-xs text-[#64748B] dark:text-[#9AA7C2] mt-1">
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
                  className="inline-flex items-center px-4 py-2 bg-[#162B54] dark:bg-[#EAF0FF] text-white dark:text-[#162B54] rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
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

        {/* Social Proof & Testimonials */}
        <div
          className="rounded-xl p-8 mb-12"
          style={{
            background:
              'linear-gradient(90deg, rgba(37, 117, 252, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          }}
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-[#162B54] dark:text-[#EAF0FF] mb-2">
              Trusted by media professionals
            </h3>
            <div className="flex items-center justify-center space-x-6 text-sm text-[#64748B] dark:text-[#9AA7C2]">
              <div className="flex items-center">
                <span className="font-semibold text-[#2575FC] dark:text-[#5B8DFF] text-lg mr-1">
                  4.9/5
                </span>
                <div className="flex text-yellow-400 text-lg">★★★★★</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-[#0F1A2E]/80 backdrop-blur-sm p-5 rounded-lg border border-[#E6EAF2] dark:border-[#1E3A5F]">
              <div className="flex items-center mb-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}
                >
                  SM
                </div>
                <div className="ml-2.5">
                  <div className="font-semibold text-[#162B54] dark:text-[#EAF0FF] text-sm">
                    Sarah M.
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-[#9AA7C2]">
                    Media Buyer, Agency
                  </div>
                </div>
              </div>
              <p className="text-[#64748B] dark:text-[#9AA7C2] text-sm leading-relaxed">
                "DealMecca saved us hours of research. The contact database is incredibly accurate."
              </p>
              <div className="flex text-yellow-400 text-xs mt-1.5">★★★★★</div>
            </div>

            <div className="bg-white/80 dark:bg-[#0F1A2E]/80 backdrop-blur-sm p-5 rounded-lg border border-[#E6EAF2] dark:border-[#1E3A5F]">
              <div className="flex items-center mb-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}
                >
                  JD
                </div>
                <div className="ml-2.5">
                  <div className="font-semibold text-[#162B54] dark:text-[#EAF0FF] text-sm">
                    James D.
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-[#9AA7C2]">
                    Director, Publisher
                  </div>
                </div>
              </div>
              <p className="text-[#64748B] dark:text-[#9AA7C2] text-sm leading-relaxed">
                "Best investment for our media partnerships. The forum alone is worth the
                subscription."
              </p>
              <div className="flex text-yellow-400 text-xs mt-1.5">★★★★★</div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center py-12">
          <p className="text-lg text-[#64748B] dark:text-[#9AA7C2]">
            Have questions?{' '}
            <Link href="/faq" className="text-[#2575FC] dark:text-[#5B8DFF] font-semibold hover:underline">
              View our FAQ
            </Link>
            {' '}or{' '}
            <Link href="/contact" className="text-[#2575FC] dark:text-[#5B8DFF] font-semibold hover:underline">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
