'use client';

import Link from 'next/link';
import { ArrowRight, Star, Trophy, Gem, Crown, Target, Zap, Gift, TrendingUp, Award, Mail, ShieldCheck, FileText } from 'lucide-react';

export default function RewardsPage() {
  return (
    <div className="flk">
      {/* Header - matching landing page */}
      <header className="sticky top-0 z-40 border-b border-flk-border-subtle bg-flk-surface/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] w-full max-w-[1120px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link className="text-flk-h4 font-bold text-flk-primary" href="/">
              DealMecca
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link className="text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/forum">
                Forum
              </Link>
              <Link className="text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/organizations">
                Org Charts
              </Link>
              <Link className="text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/pricing">
                Pricing
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="hidden h-11 items-center rounded-flk-pill border border-flk-border-subtle bg-flk-surface px-[18px] text-flk-body-m font-medium text-flk-text-primary hover:bg-flk-surface-subtle md:inline-flex"
              href="/auth/signup"
            >
              Sign In
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-flk-pill bg-flk-primary px-[18px] text-flk-body-m font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
              href="/auth/signup"
            >
              Get Access Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-[1120px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-flk-lg bg-flk-primary-soft-bg">
            <Star className="h-7 w-7 text-flk-primary" />
          </div>
          <h1 className="mt-6 text-flk-h1 font-bold tracking-[-0.02em] text-flk-text-primary">
            DealMecca Rewards
          </h1>
          <p className="mx-auto mt-4 max-w-[68ch] text-flk-body-l text-flk-text-secondary">
            Earn gems, unlock achievements, and climb the leaderboard by contributing to the community.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 text-center shadow-flk-card dark:shadow-flk-card-dark">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-accent-violet/10">
              <Gem className="h-5 w-5 text-flk-accent-violet" />
            </div>
            <div className="mt-4 text-flk-h2 font-bold text-flk-text-primary">0</div>
            <div className="mt-1 text-flk-body-s text-flk-text-muted">Total Gems Earned</div>
          </div>
          <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 text-center shadow-flk-card dark:shadow-flk-card-dark">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-status-warning/10">
              <Trophy className="h-5 w-5 text-flk-status-warning" />
            </div>
            <div className="mt-4 text-flk-h2 font-bold text-flk-text-primary">Bronze</div>
            <div className="mt-1 text-flk-body-s text-flk-text-muted">Current Tier</div>
          </div>
          <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 text-center shadow-flk-card dark:shadow-flk-card-dark">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-primary-soft-bg">
              <Target className="h-5 w-5 text-flk-primary" />
            </div>
            <div className="mt-4 text-flk-h2 font-bold text-flk-text-primary">#1</div>
            <div className="mt-1 text-flk-body-s text-flk-text-muted">Community Rank</div>
          </div>
        </div>

        {/* How to Earn */}
        <div className="mt-16">
          <h2 className="text-flk-h2 font-bold tracking-[-0.02em] text-flk-text-primary">How to Earn Gems</h2>
          <p className="mt-3 text-flk-body-m text-flk-text-secondary">Contribute to the community and earn rewards.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                icon: Gift,
                title: 'Daily Check-in',
                description: 'Log in daily to earn bonus gems. Streaks multiply your rewards.',
                gems: '+5 gems',
              },
              {
                icon: TrendingUp,
                title: 'Share Intel',
                description: 'Post valuable insights about companies, contacts, or industry trends.',
                gems: '+10 gems',
              },
              {
                icon: Award,
                title: 'Verify Contacts',
                description: 'Help verify and update contact information for the community.',
                gems: '+3 gems',
              },
              {
                icon: Star,
                title: 'Quality Content',
                description: 'Get upvotes on your posts and comments from other members.',
                gems: '+2 gems/vote',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-4 shadow-flk-card dark:shadow-flk-card-dark">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-flk-md bg-flk-surface-subtle">
                  <item.icon className="h-5 w-5 text-flk-text-muted" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-flk-body-m font-semibold text-flk-text-primary">{item.title}</div>
                    <span className="text-flk-body-s font-medium text-flk-primary">{item.gems}</span>
                  </div>
                  <div className="mt-1 text-flk-body-s text-flk-text-muted">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tiers */}
        <div className="mt-16">
          <h2 className="text-flk-h2 font-bold tracking-[-0.02em] text-flk-text-primary">Reward Tiers</h2>
          <p className="mt-3 text-flk-body-m text-flk-text-secondary">Level up to unlock exclusive benefits.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { tier: 'Bronze', gems: '0+', color: 'bg-amber-700/10 text-amber-700', benefits: ['Basic profile badge', 'Forum access'] },
              { tier: 'Silver', gems: '100+', color: 'bg-gray-400/10 text-gray-500', benefits: ['Silver badge', 'Priority support'] },
              { tier: 'Gold', gems: '500+', color: 'bg-yellow-500/10 text-yellow-600', benefits: ['Gold badge', 'Early feature access'] },
              { tier: 'Diamond', gems: '1000+', color: 'bg-brand-primary/10 text-brand-primary', benefits: ['Diamond badge', 'VIP perks', 'Exclusive events'] },
            ].map((item) => (
              <div key={item.tier} className="rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-5 shadow-flk-card dark:shadow-flk-card-dark">
                <div className={`flex h-10 w-10 items-center justify-center rounded-flk-md ${item.color}`}>
                  <Crown className="h-5 w-5" />
                </div>
                <div className="mt-3 text-flk-body-m font-semibold text-flk-text-primary">{item.tier}</div>
                <div className="text-flk-body-s text-flk-text-muted">{item.gems} gems</div>
                <ul className="mt-3 space-y-1">
                  {item.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-flk-body-s text-flk-text-muted">
                      <Zap className="h-3 w-3 text-flk-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-16 rounded-flk-xl border border-flk-primary/20 bg-flk-primary-soft-bg p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-flk-md bg-flk-primary/10">
              <Zap className="h-5 w-5 text-flk-primary" />
            </div>
            <div>
              <div className="text-flk-body-m font-semibold text-flk-text-primary">Rewards System Coming Soon</div>
              <div className="mt-1 text-flk-body-s text-flk-text-secondary">
                We&apos;re putting the finishing touches on our gamification system. Full functionality including
                gem marketplace, achievement badges, and leaderboards will be available soon.
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-8 shadow-flk-floating dark:shadow-flk-floating-dark sm:p-10">
          <div className="mx-auto max-w-[68ch] text-center">
            <h2 className="text-flk-h3 font-bold tracking-[-0.02em] text-flk-text-primary">
              Start Earning Today
            </h2>
            <p className="mt-3 text-flk-body-m text-flk-text-secondary">
              Join the DealMecca community and start contributing to earn rewards.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/forum"
                className="inline-flex h-[52px] items-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
              >
                Visit Community Forum
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/organizations"
                className="inline-flex h-[52px] items-center rounded-flk-pill border border-flk-border-subtle bg-transparent px-[22px] text-flk-body-l font-medium text-flk-text-primary hover:bg-flk-surface-subtle"
              >
                Browse Organizations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - matching landing page */}
      <footer className="border-t border-flk-border-subtle bg-flk-surface py-16 sm:py-20">
        <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="text-flk-h4 font-bold text-flk-primary">DealMecca</div>
              <p className="mt-3 text-flk-body-s text-flk-text-muted">
                Premium intel for media sellers. Org charts. Contacts. Community. No enterprise pricing.
              </p>
            </div>
            <div>
              <div className="text-flk-body-m font-semibold text-flk-text-primary">Product</div>
              <div className="mt-3 space-y-2">
                <Link className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/organizations">Organizations</Link>
                <Link className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/pricing">Pricing</Link>
                <Link className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/events">Events</Link>
                <Link className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/forum">Forum</Link>
              </div>
            </div>
            <div>
              <div className="text-flk-body-m font-semibold text-flk-text-primary">Company</div>
              <div className="mt-3 space-y-2">
                <Link className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/contact">Contact</Link>
                <Link className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/privacy">Privacy</Link>
                <Link className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/terms">Terms</Link>
              </div>
            </div>
            <div>
              <div className="text-flk-body-m font-semibold text-flk-text-primary">Support</div>
              <div className="mt-3 space-y-2">
                <a className="flex items-center gap-2 text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="mailto:support@getmecca.com">
                  <Mail className="h-4 w-4" />
                  Contact Us
                </a>
                <Link className="flex items-center gap-2 text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/privacy">
                  <ShieldCheck className="h-4 w-4" />
                  Privacy Policy
                </Link>
                <Link className="flex items-center gap-2 text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/terms">
                  <FileText className="h-4 w-4" />
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-flk-border-subtle pt-8 text-flk-caption text-flk-text-muted">
            &copy; {new Date().getFullYear()} DealMecca. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
