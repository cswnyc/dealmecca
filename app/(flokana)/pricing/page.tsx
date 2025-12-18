'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Building2, Users, Zap, Mail, ShieldCheck, FileText } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function PricingPage() {
  return (
    <div className="flk">
      {/* Header - matching landing page */}
      <header className="sticky top-0 z-40 border-b border-flk-border-subtle bg-flk-surface/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] w-full max-w-[1120px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link className="text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/forum">
                Forum
              </Link>
              <Link className="text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/organizations">
                Org Charts
              </Link>
              <Link className="text-flk-body-s text-flk-text-muted hover:text-flk-text-primary" href="/events">
                Events
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
      <section className="mx-auto w-full max-w-[1120px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="text-center">
          <h1 className="text-flk-h1 font-bold tracking-[-0.02em] text-flk-text-primary md:text-flk-display-l">
            Premium Intel. <span className="flk-text-gradient">Honest Pricing.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[68ch] text-flk-body-l text-flk-text-secondary">
            You shouldn&apos;t need VP approval to access contacts that help you do your job.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {/* Free */}
          <div className="rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-flk-lg bg-flk-surface-subtle">
                <Users className="h-6 w-6 text-flk-text-muted" />
              </div>
              <div className="mt-4 text-flk-h3 font-bold text-flk-text-primary">Free</div>
              <div className="mt-2 text-flk-display-l font-bold tracking-[-0.03em] text-flk-text-primary">$0</div>
              <div className="mt-1 text-flk-body-m text-flk-text-muted">Perfect for getting started</div>
            </div>
            <div className="mt-6 space-y-3">
              {['Limited org chart access', 'Basic contact search', 'Community forum access', 'Mobile app'].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-[2px] h-5 w-5 text-flk-status-success" />
                  <span className="text-flk-body-m text-flk-text-secondary">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/auth/signup"
                className="inline-flex h-[52px] w-full items-center justify-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Pro - Most Popular */}
          <div className="relative rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-floating dark:shadow-flk-floating-dark">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-flk-pill bg-flk-primary px-4 py-1 text-flk-caption font-semibold text-flk-text-inverse shadow-flk-card dark:shadow-flk-card-dark">
              Most Popular
            </div>
            <div className="pt-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-flk-lg bg-flk-primary-soft-bg">
                <Zap className="h-6 w-6 text-flk-primary" />
              </div>
              <div className="mt-4 text-flk-h3 font-bold text-flk-text-primary">Pro</div>
              <div className="mt-2 text-flk-display-l font-bold tracking-[-0.03em] text-flk-text-primary">
                $29<span className="text-flk-body-m text-flk-text-muted">/mo</span>
              </div>
              <div className="mt-1 text-flk-body-m text-flk-text-muted">For individual sales professionals</div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                'Full org chart access',
                'Unlimited contact search',
                'Community-verified data',
                'Priority support',
                'Export contacts',
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-[2px] h-5 w-5 text-flk-status-success" />
                  <span className="text-flk-body-m text-flk-text-secondary">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/auth/signup"
                className="inline-flex h-[52px] w-full items-center justify-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
              >
                Get Access Now
              </Link>
            </div>
          </div>

          {/* Team */}
          <div className="rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-flk-lg bg-flk-surface-subtle">
                <Building2 className="h-6 w-6 text-flk-text-muted" />
              </div>
              <div className="mt-4 text-flk-h3 font-bold text-flk-text-primary">Team</div>
              <div className="mt-2 text-flk-display-l font-bold tracking-[-0.03em] text-flk-text-primary">
                $20<span className="text-flk-body-m text-flk-text-muted">/user/mo</span>
              </div>
              <div className="mt-1 text-flk-body-m text-flk-text-muted">For sales teams and agencies</div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                'Everything in Pro',
                'Team collaboration',
                'Shared saved searches',
                'Admin dashboard',
                'Dedicated support',
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-[2px] h-5 w-5 text-flk-status-success" />
                  <span className="text-flk-body-m text-flk-text-secondary">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <a
                href="mailto:sales@getmecca.com?subject=Team%20Plan%20Inquiry"
                className="inline-flex h-[52px] w-full items-center justify-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-center text-flk-h2 font-bold tracking-[-0.02em] text-flk-text-primary">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-flk-xl border border-flk-border-subtle bg-flk-surface shadow-flk-card dark:shadow-flk-card-dark">
            {[
              {
                q: 'How is DealMecca different from ZoomInfo or LinkedIn Sales Nav?',
                a: "We're built specifically for media sellers. Better org chart visibility, community-verified contacts, and pricing that doesn't require a committee.",
              },
              {
                q: 'Is the data really community-verified?',
                a: "Yes. Members flag outdated contacts and submit updates. Our team verifies changes before they go live. It's not crowdsourced chaos—it's quality-controlled intel.",
              },
              {
                q: 'What if I just need it for one deal?',
                a: 'Start with the free trial. Full access for 7 days—no credit card required. See if it helps you close.',
              },
              {
                q: 'Can I cancel anytime?',
                a: "Yes. No contracts. No cancellation fees. No guilt trips. Just stop paying and you're done.",
              },
            ].map((faq, idx, arr) => (
              <div key={faq.q} className={idx < arr.length - 1 ? 'border-b border-flk-border-subtle' : ''}>
                <div className="p-6">
                  <div className="text-flk-body-m font-semibold text-flk-text-primary">{faq.q}</div>
                  <div className="mt-2 text-flk-body-s text-flk-text-secondary">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <section className="mt-20 rounded-flk-xl bg-flk-primary py-16 sm:py-20">
          <div className="mx-auto max-w-[68ch] text-center px-4">
            <h2 className="text-flk-h2 font-bold text-flk-text-inverse">
              Ready to close more deals?
            </h2>
            <p className="mx-auto mt-3 max-w-[68ch] text-flk-body-l text-white/90">
              Start your 7-day free trial today. No credit card required.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex h-[52px] items-center rounded-flk-pill bg-white px-[22px] text-flk-body-l font-medium text-flk-brand-ink shadow-flk-floating hover:bg-white/90"
              >
                Get Access Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="mailto:sales@getmecca.com?subject=Demo%20Request"
                className="inline-flex h-[52px] items-center rounded-flk-pill border border-white/30 bg-transparent px-[22px] text-flk-body-l font-medium text-white hover:bg-white/10"
              >
                Schedule Demo
              </a>
            </div>
          </div>
        </section>
      </section>

      {/* Footer - matching landing page */}
      <footer className="border-t border-flk-border-subtle bg-flk-surface py-16 sm:py-20">
        <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <Logo size="md" />
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
