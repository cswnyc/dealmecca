'use client';

import Link from 'next/link';
import { ArrowRight, Mail, MessageCircle, Clock, Building2, Users, ShieldCheck, FileText } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function ContactPage() {
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
          <h1 className="text-flk-h1 font-bold tracking-[-0.02em] text-flk-text-primary">
            Get in Touch
          </h1>
          <p className="mx-auto mt-4 max-w-[68ch] text-flk-body-l text-flk-text-secondary">
            Have questions about DealMecca? We&apos;re here to help. Reach out and we&apos;ll respond within 24 hours.
          </p>
        </div>

        {/* Contact Options */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="mailto:support@getmecca.com"
            className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 text-center shadow-flk-card transition-all hover:-translate-y-[2px] hover:shadow-flk-card-hover dark:shadow-flk-card-dark dark:hover:shadow-flk-card-hover-dark"
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-primary-soft-bg text-flk-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-flk-text-primary">General Support</div>
            <div className="mt-2 text-flk-body-s text-flk-text-secondary">support@getmecca.com</div>
            <div className="mt-1 text-flk-caption text-flk-text-muted">Response within 24 hours</div>
          </a>

          <a
            href="mailto:sales@getmecca.com?subject=Sales%20Inquiry"
            className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 text-center shadow-flk-card transition-all hover:-translate-y-[2px] hover:shadow-flk-card-hover dark:shadow-flk-card-dark dark:hover:shadow-flk-card-hover-dark"
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-status-success/10">
              <Building2 className="h-5 w-5 text-flk-status-success" />
            </div>
            <div className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-flk-text-primary">Sales & Teams</div>
            <div className="mt-2 text-flk-body-s text-flk-text-secondary">sales@getmecca.com</div>
            <div className="mt-1 text-flk-caption text-flk-text-muted">Enterprise & team plans</div>
          </a>

          <Link
            href="/forum"
            className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 text-center shadow-flk-card transition-all hover:-translate-y-[2px] hover:shadow-flk-card-hover dark:shadow-flk-card-dark dark:hover:shadow-flk-card-hover-dark"
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-accent-violet/10">
              <MessageCircle className="h-5 w-5 text-flk-accent-violet" />
            </div>
            <div className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-flk-text-primary">Community Forum</div>
            <div className="mt-2 text-flk-body-s text-flk-text-secondary">Join the discussion</div>
            <div className="mt-1 text-flk-caption text-flk-text-muted">Get help from other sellers</div>
          </Link>
        </div>

        {/* Main Content */}
        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <div>
            <h2 className="text-flk-h2 font-bold tracking-[-0.02em] text-flk-text-primary">We&apos;d Love to Hear From You</h2>
            <p className="mt-4 text-flk-body-m text-flk-text-secondary">
              Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex gap-4 rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-4 shadow-flk-card dark:shadow-flk-card-dark">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-flk-md bg-flk-surface-subtle">
                  <Mail className="h-5 w-5 text-flk-text-muted" />
                </div>
                <div>
                  <div className="text-flk-body-m font-semibold text-flk-text-primary">Email</div>
                  <div className="mt-1 text-flk-body-s text-flk-text-muted">support@getmecca.com</div>
                </div>
              </div>

              <div className="flex gap-4 rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-4 shadow-flk-card dark:shadow-flk-card-dark">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-flk-md bg-flk-surface-subtle">
                  <Clock className="h-5 w-5 text-flk-text-muted" />
                </div>
                <div>
                  <div className="text-flk-body-m font-semibold text-flk-text-primary">Response Time</div>
                  <div className="mt-1 text-flk-body-s text-flk-text-muted">Usually within 24 hours, often faster</div>
                </div>
              </div>

              <div className="flex gap-4 rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-4 shadow-flk-card dark:shadow-flk-card-dark">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-flk-md bg-flk-surface-subtle">
                  <Users className="h-5 w-5 text-flk-text-muted" />
                </div>
                <div>
                  <div className="text-flk-body-m font-semibold text-flk-text-primary">Community</div>
                  <div className="mt-1 text-flk-body-s text-flk-text-muted">Join 500+ media sellers in our forum</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-flk-h2 font-bold tracking-[-0.02em] text-flk-text-primary">Common Questions</h2>
            <div className="mt-6 overflow-hidden rounded-flk-xl border border-flk-border-subtle bg-flk-surface shadow-flk-card dark:shadow-flk-card-dark">
              {[
                {
                  q: 'How do I reset my password?',
                  a: 'Click "Forgot Password" on the sign-in page and follow the email instructions.',
                },
                {
                  q: 'Can I upgrade my plan anytime?',
                  a: 'Yes, you can upgrade from Free to Pro or Team at any time from your settings.',
                },
                {
                  q: 'How do I cancel my subscription?',
                  a: "Go to Settings > Billing and click 'Cancel Subscription'. No penalties or fees.",
                },
                {
                  q: 'Is my data secure?',
                  a: 'Yes. We use industry-standard encryption and never sell your data to third parties.',
                },
              ].map((faq, idx, arr) => (
                <div key={faq.q} className={idx < arr.length - 1 ? 'border-b border-flk-border-subtle' : ''}>
                  <div className="p-5">
                    <div className="text-flk-body-m font-semibold text-flk-text-primary">{faq.q}</div>
                    <div className="mt-2 text-flk-body-s text-flk-text-secondary">{faq.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-8 shadow-flk-floating dark:shadow-flk-floating-dark sm:p-10">
          <div className="mx-auto max-w-[68ch] text-center">
            <h2 className="text-flk-h3 font-bold tracking-[-0.02em] text-flk-text-primary">
              Ready to get started?
            </h2>
            <p className="mt-3 text-flk-body-m text-flk-text-secondary">
              Join thousands of media sellers using DealMecca to close more deals.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="inline-flex h-[52px] items-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-[52px] items-center rounded-flk-pill border border-flk-border-subtle bg-transparent px-[22px] text-flk-body-l font-medium text-flk-text-primary hover:bg-flk-surface-subtle"
              >
                View Pricing
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
