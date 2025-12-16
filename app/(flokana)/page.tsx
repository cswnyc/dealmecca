'use client';

import React, { useCallback, useMemo, useState } from 'react';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  MessageSquare,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react';

import { useTheme } from '@/lib/theme-context';

type Tab = 'product' | 'security' | 'workflow';

export default function FlokanaLandingPage(): JSX.Element {
  const { theme, toggleTheme } = useTheme();

  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('product');

  const features = useMemo(
    () => [
      {
        title: 'Verified Org Charts',
        body: 'See who reports to who at agencies, brands, DSPs, SSPs, and adtech vendors. Updated by the community, not bots.',
        icon: Building2,
      },
      {
        title: 'Decision-Maker Contacts',
        body: 'Direct contacts for the people who actually sign off on deals. Verified and current.',
        icon: Users,
      },
      {
        title: 'Sellers Only',
        body: 'No buyers lurking. No agencies listening. A community built exclusively for people who carry a quota.',
        icon: ShieldCheck,
      },
      {
        title: 'Full Ecosystem Coverage',
        body: 'Go beyond agencies and brands. We map DSPs, SSPs, ad networks, and adtech vendors—the whole landscape.',
        icon: BarChart3,
      },
      {
        title: 'Anonymous Q&A',
        body: "Ask anything about accounts, contacts, or strategy. Get real answers from sellers who've been there.",
        icon: MessageSquare,
      },
      {
        title: 'Modern UI',
        body: 'Clean. Fast. Built this decade. Not software from 2011 with a fresh coat of paint.',
        icon: Zap,
      },
    ],
    [],
  );

  const caseStudies = useMemo(
    () => [
      {
        name: 'Cobalt Media',
        metric: '+31% pipeline velocity',
        title: 'Forecasting with confidence',
        body: 'Cleaner workflows helped teams prioritize the right accounts and move faster.',
      },
      {
        name: 'Evergreen Group',
        metric: '2.4× faster onboarding',
        title: 'Consistent UI = faster adoption',
        body: 'Standardized components reduced training time and support burden.',
      },
      {
        name: 'Signal Labs',
        metric: '−18% churn risk',
        title: 'Better clarity, fewer mistakes',
        body: 'Sharper hierarchy reduced errors in complex tables and forms.',
      },
    ],
    [],
  );

  const faqs = useMemo(
    () => [
      {
        id: 'different',
        q: 'How is DealMecca different from ZoomInfo or LinkedIn Sales Nav?',
        a: "We're built specifically for media sellers. Better org chart visibility, community-verified contacts, and pricing that doesn't require a committee.",
      },
      {
        id: 'verified',
        q: 'Is the data really community-verified?',
        a: "Yes. Members flag outdated contacts and submit updates. Our team verifies changes before they go live. It's not crowdsourced chaos—it's quality-controlled intel.",
      },
      {
        id: 'trial',
        q: 'What if I just need it for one deal?',
        a: 'Start with the free trial. Full access for 7 days—no credit card required. See if it helps you close.',
      },
      {
        id: 'cancel',
        q: 'Can I cancel anytime?',
        a: 'Yes. No contracts. No cancellation fees. No guilt trips. Just stop paying and you\'re done.',
      },
    ],
    [],
  );

  const onToggleTheme = useCallback((): void => {
    toggleTheme();
  }, [toggleTheme]);

  const onToggleFaq = useCallback((event: React.MouseEvent<HTMLButtonElement>): void => {
    const nextId = event.currentTarget.dataset.faq ?? null;
    setOpenFaqId((cur) => (cur === nextId ? null : nextId));
  }, []);

  const onTabClick = useCallback((event: React.MouseEvent<HTMLButtonElement>): void => {
    const nextTab = event.currentTarget.dataset.tab as Tab | undefined;
    if (nextTab === 'product' || nextTab === 'security' || nextTab === 'workflow') {
      setActiveTab(nextTab);
    }
  }, []);

  return (
    <div>
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-flk-border-subtle bg-flk-surface/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] w-full max-w-[1120px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link className="text-flk-h4 font-bold text-flk-primary" href="/">
              DealMecca
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <a className="text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="#forum">Forum</a>
              <a className="text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="#org-charts">Org Charts</a>
              <a className="text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="#features">Features</a>
              <a className="text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="#pricing">Pricing</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-surface-subtle text-flk-text-primary hover:bg-flk-border-subtle"
              onClick={onToggleTheme}
              type="button"
            >
              <span className="text-[18px] leading-none">{theme === 'dark' ? '☀︎' : '☾'}</span>
            </button>

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
      <section
        className="mx-auto w-full max-w-[1120px] px-4 pt-14 pb-12 sm:px-6 sm:pt-16 sm:pb-16 lg:px-8 min-h-[calc(100vh-72px)] flex flex-col"
        id="top"
      >
        <div className="text-center">
          <div className="inline-flex items-center rounded-flk-pill bg-flk-primary-soft-bg px-[10px] py-[6px] text-flk-caption font-medium uppercase tracking-[0.08em]">
            <span className="flk-text-gradient">Intelligence for Media &amp; Adtech Sellers</span>
          </div>

          <h1 className="mt-6 text-flk-display-l font-bold tracking-[-0.03em]">Premium Intel. <span className="flk-text-gradient">Fair Price.</span></h1>

          <p className="mx-auto mt-4 max-w-[68ch] text-flk-body-l text-flk-text-secondary">
            Community-verified org charts and decision-maker contacts. Built by media sellers. Less than $1/day.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link
              className="inline-flex h-[52px] items-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
              href="/auth/signup"
            >
              Get Access Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              className="inline-flex h-[52px] items-center rounded-flk-pill border border-flk-border-subtle bg-transparent px-[22px] text-flk-body-l font-medium text-flk-text-primary hover:bg-flk-surface-subtle"
              href="mailto:sales@getmecca.com?subject=Demo%20Request"
            >
              Schedule Demo
            </a>
          </div>
        </div>

        <div className="mt-auto pt-10 text-center">
          <p className="text-flk-caption text-flk-text-muted">
            7-day full access. See why media sellers are making the switch.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-flk-caption text-flk-text-muted">
            <div className="inline-flex items-center gap-2 rounded-flk-pill bg-flk-surface px-3 py-1.5 shadow-flk-card dark:shadow-flk-card-dark">
              <Sparkles className="h-4 w-4" />
              7-Day Free Trial
            </div>
            <div className="inline-flex items-center gap-2 rounded-flk-pill bg-flk-surface px-3 py-1.5 shadow-flk-card dark:shadow-flk-card-dark">
              <Building2 className="h-4 w-4" />
              Full Org Chart Access
            </div>
            <div className="inline-flex items-center gap-2 rounded-flk-pill bg-flk-surface px-3 py-1.5 shadow-flk-card dark:shadow-flk-card-dark">
              <BarChart3 className="h-4 w-4" />
              Starting at $29/mo
            </div>
          </div>
        </div>
      </section>

      {/* Logo strip (below hero) */}
      <section className="mx-auto w-full max-w-[1120px] px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-4 shadow-flk-card dark:shadow-flk-card-dark sm:p-5">
          <div className="text-center text-flk-caption font-medium uppercase tracking-[0.08em] text-flk-text-muted">
            Built for media sellers
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {/* Spotify */}
            <img
              src="/logos/spotify.svg"
              alt="Spotify"
              className="h-14 w-auto"
            />
            {/* Snapchat */}
            <img
              src="https://cdn.simpleicons.org/snapchat/FFFC00"
              alt="Snapchat"
              className="h-8 w-auto"
            />
            {/* Roku */}
            <img
              src="/logos/roku.svg"
              alt="Roku"
              className="h-10 w-auto"
            />
            {/* The Trade Desk */}
            <img
              src="/logos/the-trade-desk.png"
              alt="The Trade Desk"
              className="h-14 w-auto dark:brightness-0 dark:invert"
            />
            {/* Quantcast */}
            <span className="text-xl font-bold tracking-tight dark:text-white">Quantcast</span>
            {/* Vizio */}
            <img
              src="/logos/vizio.png"
              alt="Vizio"
              className="h-12 w-auto dark:brightness-0 dark:invert"
            />
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto w-full max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8" id="features">
        <div className="text-center">
          <h2 className="text-flk-h2 font-bold tracking-[-0.02em]">Everything You Need to Close</h2>
          <p className="mx-auto mt-3 max-w-[68ch] text-flk-body-m text-flk-text-secondary">
            The intel that actually moves deals forward. Not scraped. Not stale. Verified by real sellers.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card transition-all hover:-translate-y-[2px] hover:shadow-flk-card-hover dark:shadow-flk-card-dark dark:hover:shadow-flk-card-hover-dark"
              key={f.title}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-primary-soft-bg text-flk-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-flk-text-primary">{f.title}</div>
              <div className="mt-2 text-flk-body-s text-flk-text-muted">{f.body}</div>
            </div>
          ))}
        </div>

        {/* Mission band (copy from original CTA section) */}
        <div className="mt-12 rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-8 shadow-flk-floating dark:shadow-flk-floating-dark sm:p-10">
          <div className="mx-auto max-w-[68ch] text-center">
            <div className="text-flk-h3 font-bold tracking-[-0.02em]">
              Stop Overpaying for <span className="flk-text-gradient">Outdated Data</span>
            </div>
            <div className="mt-3 text-flk-body-m text-flk-text-secondary">
              Other tools charge $400+/month for intel that&apos;s months behind. We fixed that.
            </div>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                className="inline-flex h-[52px] items-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
                href="/auth/signup"
              >
                Get Access Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                className="inline-flex h-[52px] items-center rounded-flk-pill border border-flk-border-subtle bg-transparent px-[22px] text-flk-body-l font-medium text-flk-text-primary hover:bg-flk-surface-subtle"
                href="mailto:sales@getmecca.com?subject=Demo%20Request"
              >
                Schedule Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Forum showcase (copy from original landing) */}
      <section className="mx-auto w-full max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8" id="forum">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-primary-soft-bg text-flk-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="rounded-flk-pill bg-flk-primary-soft-bg px-[10px] py-[6px] text-flk-caption font-medium text-flk-primary-soft-text">Most Active</span>
            </div>

            <h2 className="mt-6 text-flk-h2 font-bold tracking-[-0.02em]">
              The Only Forum Where <span className="flk-text-gradient">Media Sellers Share Real Intel</span>
            </h2>

            <p className="mt-4 text-flk-body-l text-flk-text-secondary">
              Not LinkedIn spam. Not Reddit noise. A private community where media sellers share what&apos;s actually working—and what isn&apos;t.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { title: 'Real Deal Intel', body: "What's closing and why" },
                { title: 'Agency Movement', body: "Who's hiring and firing" },
                { title: 'Pitch Feedback', body: 'Before you send it' },
                { title: 'No Recruiters', body: 'Sellers only' },
              ].map((item) => (
                <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-4 shadow-flk-card dark:shadow-flk-card-dark" key={item.title}>
                  <div className="text-flk-body-m font-semibold">{item.title}</div>
                  <div className="mt-1 text-flk-body-s text-flk-text-muted">{item.body}</div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                className="inline-flex h-[52px] items-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
                href="/auth/signup"
              >
                Join the Community <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-floating dark:shadow-flk-floating-dark">
            <div className="text-flk-body-m font-semibold">DealMecca Forum</div>
            <div className="mt-2 text-flk-body-s text-flk-text-muted">A calm, card-based preview of what your community feed could look like.</div>
            <div className="mt-5 space-y-3">
              {[
                '🔥 Just closed a $2.8M radio package using the org chart strategy from last week’s thread. Game changer!',
                'Anyone have contacts at MediaCorp’s new LA office? Hearing they’re expanding digital ad spend by 40%…',
                '📊 Q4 programmatic rates are up 15% across all verticals. Perfect time to pitch premium inventory…',
              ].map((text) => (
                <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface-subtle p-4" key={text}>
                  <div className="text-flk-body-s text-flk-text-secondary">{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Org Charts showcase (copy from original landing) */}
      <section className="mx-auto w-full max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8" id="org-charts">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="order-2 md:order-1">
            <div className="rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-floating dark:shadow-flk-floating-dark">
              <div className="text-flk-body-m font-semibold">Organization Preview</div>
              <div className="mt-2 text-flk-body-s text-flk-text-muted">A clean, softly elevated frame for org chart visuals.</div>
              <div className="mt-5 rounded-flk-lg border border-flk-border-subtle bg-flk-surface-subtle p-6">
                <div className="text-flk-body-s font-medium text-flk-text-muted">MediaCorp Organization</div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-flk-lg bg-flk-surface p-4 shadow-flk-card dark:shadow-flk-card-dark">
                    <div className="text-flk-body-m font-semibold">VP Sales</div>
                    <div className="mt-1 text-flk-body-s text-flk-text-muted">Premium contact</div>
                  </div>
                  <div className="rounded-flk-lg bg-flk-surface p-4 shadow-flk-card dark:shadow-flk-card-dark">
                    <div className="text-flk-body-m font-semibold">VP Marketing</div>
                    <div className="mt-1 text-flk-body-s text-flk-text-muted">Contact needed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-primary-soft-bg text-flk-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="rounded-flk-pill bg-flk-primary-soft-bg px-[10px] py-[6px] text-flk-caption font-medium text-flk-primary-soft-text">New Feature</span>
            </div>

            <h2 className="mt-6 text-flk-h2 font-bold tracking-[-0.02em]">
              Finally, Org Charts <span className="flk-text-gradient">That Make Sense</span>
            </h2>

            <p className="mt-4 text-flk-body-l text-flk-text-secondary">
              Media is complicated. Holding companies own networks that own agencies that work with brands. We map it all so you don't have to explain your job at Thanksgiving.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  title: 'Holding Company → Agency → Team',
                  body: 'See the full hierarchy. Understand who reports to whom.',
                },
                {
                  title: 'Track Reorgs in Real-Time',
                  body: "When teams move or merge, you'll know. No more outdated LinkedIn stalking.",
                },
                {
                  title: 'Find the Actual Buyer',
                  body: 'VP of what? We show you who actually signs off on media spend.',
                },
              ].map((item) => (
                <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-4 shadow-flk-card dark:shadow-flk-card-dark" key={item.title}>
                  <div className="text-flk-body-m font-semibold">{item.title}</div>
                  <div className="mt-1 text-flk-body-s text-flk-text-muted">{item.body}</div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                className="inline-flex h-[52px] items-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
                href="/auth/signup"
              >
                Explore Org Charts <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (copy from original landing) */}
      <section className="mx-auto w-full max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8" id="testimonials">
        <div className="text-center">
          <h2 className="text-flk-h2 font-bold tracking-[-0.02em]">
            Real Sellers. <span className="flk-text-gradient">Real Results.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[68ch] text-flk-body-m text-flk-text-secondary">
            Don&apos;t take our word for it. Here&apos;s what media sellers are saying.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              quote:
                'DealMecca has completely transformed how I prospect. The mobile app means I can research clients on the go, and the AI recommendations have helped me find prospects I never would have discovered.',
              name: 'Sarah Johnson',
              role: 'Account Executive, Radio Solutions',
              initials: 'SJ',
            },
            {
              quote:
                'Finally, a platform built for how we actually work. The pricing is fair, the data is accurate, and the community insights have given us a real competitive edge in our market.',
              name: 'Mike Chen',
              role: 'Sales Director, Digital Media Group',
              initials: 'MC',
            },
            {
              quote:
                'We switched from other platforms and immediately saved $4,000 per year while getting better features. The team dashboard and CRM integration have streamlined our entire sales process.',
              name: 'Lisa Rodriguez',
              role: 'VP Sales, Podcast Network',
              initials: 'LR',
            },
          ].map((t) => (
            <div
              className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card transition-all hover:-translate-y-[2px] hover:shadow-flk-card-hover dark:shadow-flk-card-dark dark:hover:shadow-flk-card-hover-dark"
              key={t.name}
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star className="h-4 w-4 fill-[rgb(var(--flk-status-warning))] text-[rgb(var(--flk-status-warning))]" key={`${t.name}-star-${idx}`} />
                ))}
              </div>
              <p className="mt-5 text-flk-body-m text-flk-text-secondary">{`"${t.quote}"`}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-flk-primary-soft-bg text-flk-primary">
                  <span className="text-flk-body-m font-bold">{t.initials}</span>
                </div>
                <div>
                  <div className="text-flk-body-m font-semibold">{t.name}</div>
                  <div className="text-flk-body-s text-flk-text-muted">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing (copy from original landing) */}
      <section className="mx-auto w-full max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8" id="pricing">
        <div className="text-center">
          <h2 className="text-flk-h2 font-bold tracking-[-0.02em]">
            Premium Intel. <span className="flk-text-gradient">Honest Pricing.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[68ch] text-flk-body-m text-flk-text-secondary">
            You shouldn't need VP approval to access contacts that help you do your job.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {/* Free */}
          <div className="rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark">
            <div className="text-center">
              <div className="text-flk-h3 font-bold">Free</div>
              <div className="mt-2 text-flk-display-l font-bold tracking-[-0.03em]">$0</div>
              <div className="mt-1 text-flk-body-m text-flk-text-muted">Perfect for getting started</div>
            </div>
            <div className="mt-6 space-y-3">
              {['Limited org chart access', 'Basic contact search', 'Community forum access', 'Mobile app'].map((x) => (
                <div className="flex items-start gap-3" key={x}>
                  <CheckCircle2 className="mt-[2px] h-5 w-5 text-flk-status-success" />
                  <div className="text-flk-body-m text-flk-text-secondary">{x}</div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                className="inline-flex h-[52px] w-full items-center justify-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
                href="/auth/signup"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Pro */}
          <div className="relative rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-floating dark:shadow-flk-floating-dark">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-flk-pill bg-flk-primary px-4 py-1 text-flk-caption font-semibold text-flk-text-inverse shadow-flk-card dark:shadow-flk-card-dark">
              Most Popular
            </div>
            <div className="pt-2 text-center">
              <div className="text-flk-h3 font-bold">Pro</div>
              <div className="mt-2 text-flk-display-l font-bold tracking-[-0.03em]">
                $29<span className="text-flk-body-m text-flk-text-muted">/mo</span>
              </div>
              <div className="mt-1 text-flk-body-m text-flk-text-muted">For individual sales professionals</div>
            </div>
            <div className="mt-6 space-y-3">
              {['Full org chart access', 'Unlimited contact search', 'Community-verified data', 'Priority support', 'Export contacts'].map((x) => (
                <div className="flex items-start gap-3" key={x}>
                  <CheckCircle2 className="mt-[2px] h-5 w-5 text-flk-status-success" />
                  <div className="text-flk-body-m text-flk-text-secondary">{x}</div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                className="inline-flex h-[52px] w-full items-center justify-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
                href="/auth/signup"
              >
                Get Access Now
              </Link>
            </div>
          </div>

          {/* Team */}
          <div className="rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark">
            <div className="text-center">
              <div className="text-flk-h3 font-bold">Team</div>
              <div className="mt-2 text-flk-display-l font-bold tracking-[-0.03em]">
                $20<span className="text-flk-body-m text-flk-text-muted">/user/mo</span>
              </div>
              <div className="mt-1 text-flk-body-m text-flk-text-muted">For sales teams and agencies</div>
            </div>
            <div className="mt-6 space-y-3">
              {['Everything in Pro', 'Team collaboration', 'Shared saved searches', 'Admin dashboard', 'Dedicated support'].map((x) => (
                <div className="flex items-start gap-3" key={x}>
                  <CheckCircle2 className="mt-[2px] h-5 w-5 text-flk-status-success" />
                  <div className="text-flk-body-m text-flk-text-secondary">{x}</div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <a
                className="inline-flex h-[52px] w-full items-center justify-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
                href="mailto:sales@getmecca.com?subject=Team%20Plan%20Inquiry"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs + proof */}
      <section className="mx-auto w-full max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-flk-h3 font-bold tracking-[-0.02em]">A few things we got right</div>
              <div className="mt-2 text-flk-body-m text-flk-text-secondary">We're not trying to be everything. Just the best tool for media sellers.</div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: 'product', label: 'Data' },
                  { key: 'security', label: 'Community' },
                  { key: 'workflow', label: 'Pricing' },
                ] as const
              ).map((t) => (
                <button
                  className={
                    activeTab === t.key
                      ? 'h-10 rounded-flk-pill bg-flk-primary-soft-bg px-4 text-flk-body-s font-medium text-flk-primary-soft-text'
                      : 'h-10 rounded-flk-pill border border-flk-border-subtle bg-flk-surface px-4 text-flk-body-s font-medium text-flk-text-muted hover:bg-flk-surface-subtle'
                  }
                  data-tab={t.key}
                  key={t.key}
                  onClick={onTabClick}
                  type="button"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[{ text: 'Community-verified contacts, not scraped data', tab: 'product' },
              { text: 'Full org chart hierarchy from holding to team', tab: 'product' },
              { text: 'Private forum—sellers only, no recruiters', tab: 'security' },
              { text: 'Real deal intel shared by real media pros', tab: 'security' },
              { text: '$29/month for Pro—no enterprise minimums', tab: 'workflow' },
              { text: 'Cancel anytime—no contracts or guilt trips', tab: 'workflow' }]
              .filter((x) => x.tab === activeTab)
              .map((item) => (
                <div className="flex items-start gap-3 rounded-flk-lg bg-flk-surface-subtle p-4" key={item.text}>
                  <CheckCircle2 className="mt-[2px] h-5 w-5 text-flk-status-success" />
                  <div className="text-flk-body-m text-flk-text-secondary">{item.text}</div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8" id="faq">
        <div className="text-center">
          <h2 className="text-flk-h2 font-bold tracking-[-0.02em]">Common Questions</h2>
          <p className="mx-auto mt-3 max-w-[68ch] text-flk-body-m text-flk-text-secondary">Everything you need to know before signing up.</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-flk-xl border border-flk-border-subtle bg-flk-surface shadow-flk-card dark:shadow-flk-card-dark">
          {faqs.map((f) => {
            const isOpen = openFaqId === f.id;
            return (
              <div className="border-b border-flk-border-subtle last:border-0" key={f.id}>
                <button
                  className="flex h-14 w-full items-center justify-between px-6 text-left hover:bg-flk-surface-subtle"
                  data-faq={f.id}
                  onClick={onToggleFaq}
                  type="button"
                >
                  <span className="text-flk-body-m font-medium">{f.q}</span>
                  {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </button>
                {isOpen ? (
                  <div className="bg-flk-surface-subtle px-6 py-4 text-flk-body-m text-flk-text-secondary">{f.a}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA band */}
      <section className="bg-flk-primary py-20 sm:py-24">
        <div className="mx-auto w-full max-w-[1120px] px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-flk-h2 font-bold text-flk-text-inverse">
            Stop Overpaying. <span className="text-white">Start Closing.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[68ch] text-flk-body-l text-white/90">
            7-day free trial. Full access. See why media sellers are making the switch.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              className="inline-flex h-[52px] items-center rounded-flk-pill bg-white px-[22px] text-flk-body-l font-medium text-flk-brand-ink shadow-flk-floating hover:bg-white/90"
              href="/auth/signup"
            >
              Get Access Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              className="inline-flex h-[52px] items-center rounded-flk-pill border border-white/30 bg-transparent px-[22px] text-flk-body-l font-medium text-white hover:bg-white/10"
              href="mailto:sales@getmecca.com?subject=Demo%20Request"
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
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
              <div className="text-flk-body-m font-semibold">Product</div>
              <div className="mt-3 space-y-2">
                <a className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="#features">
                  Features
                </a>
                <a className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="#pricing">Pricing</a>
                <Link className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/organizations">Organizations</Link>
                <Link className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/events">Events</Link>
                <Link className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/forum">Forum</Link>
              </div>
            </div>
            <div>
              <div className="text-flk-body-m font-semibold">Company</div>
              <div className="mt-3 space-y-2">
                <Link className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/contact">
                  Contact
                </Link>
                <Link className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/privacy">
                  Privacy
                </Link>
                <Link className="block text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/terms">
                  Terms
                </Link>
              </div>
            </div>
            <div>
              <div className="text-flk-body-m font-semibold">Support</div>
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
            © {new Date().getFullYear()} DealMecca. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
