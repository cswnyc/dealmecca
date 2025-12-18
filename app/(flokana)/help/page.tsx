'use client';

import Link from 'next/link';
import { ArrowRight, HelpCircle, MessageCircle, Mail, BookOpen, Search, Users, Building2, Calendar, Settings, ShieldCheck, FileText } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function HelpPage() {
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
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-flk-lg bg-flk-primary-soft-bg">
            <HelpCircle className="h-7 w-7 text-flk-primary" />
          </div>
          <h1 className="mt-6 text-flk-h1 font-bold tracking-[-0.02em] text-flk-text-primary">
            Help & Support
          </h1>
          <p className="mx-auto mt-4 max-w-[68ch] text-flk-body-l text-flk-text-secondary">
            Find answers, get support, and learn how to get the most out of DealMecca.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/forum"
            className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card transition-all hover:-translate-y-[2px] hover:shadow-flk-card-hover dark:shadow-flk-card-dark dark:hover:shadow-flk-card-hover-dark"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-primary-soft-bg text-flk-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-flk-text-primary">Community Forum</div>
            <div className="mt-2 text-flk-body-s text-flk-text-muted">
              Ask questions and get answers from other media sellers.
            </div>
          </Link>

          <a
            href="mailto:support@getmecca.com"
            className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card transition-all hover:-translate-y-[2px] hover:shadow-flk-card-hover dark:shadow-flk-card-dark dark:hover:shadow-flk-card-hover-dark"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-status-success/10">
              <Mail className="h-5 w-5 text-flk-status-success" />
            </div>
            <div className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-flk-text-primary">Email Support</div>
            <div className="mt-2 text-flk-body-s text-flk-text-muted">
              Contact our support team directly. Response within 24 hours.
            </div>
          </a>

          <Link
            href="/contact"
            className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card transition-all hover:-translate-y-[2px] hover:shadow-flk-card-hover dark:shadow-flk-card-dark dark:hover:shadow-flk-card-hover-dark"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-flk-md bg-flk-accent-violet/10">
              <BookOpen className="h-5 w-5 text-flk-accent-violet" />
            </div>
            <div className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-flk-text-primary">Contact Us</div>
            <div className="mt-2 text-flk-body-s text-flk-text-muted">
              Have a specific question? Get in touch with our team.
            </div>
          </Link>
        </div>

        {/* Getting Started */}
        <div className="mt-16">
          <h2 className="text-flk-h2 font-bold tracking-[-0.02em] text-flk-text-primary">Getting Started</h2>
          <p className="mt-3 text-flk-body-m text-flk-text-secondary">Learn the basics of using DealMecca.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                icon: Search,
                title: 'Search Organizations',
                description: 'Find companies, agencies, and contacts in the media industry.',
              },
              {
                icon: Building2,
                title: 'Browse Org Charts',
                description: 'Explore company hierarchies from holding companies to teams.',
              },
              {
                icon: Users,
                title: 'Connect with Contacts',
                description: 'Access verified contact information for decision-makers.',
              },
              {
                icon: MessageCircle,
                title: 'Join the Community',
                description: 'Share intel and learn from other media sellers.',
              },
              {
                icon: Calendar,
                title: 'Discover Events',
                description: 'Find industry events and connect with attendees.',
              },
              {
                icon: Settings,
                title: 'Customize Your Experience',
                description: 'Set up your profile, preferences, and notifications.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-4 shadow-flk-card dark:shadow-flk-card-dark">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-flk-md bg-flk-surface-subtle">
                  <item.icon className="h-5 w-5 text-flk-text-muted" />
                </div>
                <div>
                  <div className="text-flk-body-m font-semibold text-flk-text-primary">{item.title}</div>
                  <div className="mt-1 text-flk-body-s text-flk-text-muted">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-flk-h2 font-bold tracking-[-0.02em] text-flk-text-primary">Frequently Asked Questions</h2>
          <p className="mt-3 text-flk-body-m text-flk-text-secondary">Everything you need to know about using DealMecca.</p>
          <div className="mt-6 overflow-hidden rounded-flk-xl border border-flk-border-subtle bg-flk-surface shadow-flk-card dark:shadow-flk-card-dark">
            {[
              {
                q: 'How do I search for companies?',
                a: 'Use the search bar at the top of the Organizations page. You can filter by industry, company type, location, and more.',
              },
              {
                q: 'How is contact data verified?',
                a: 'Our community flags outdated information and submits updates. Our team verifies changes before publishing.',
              },
              {
                q: 'Can I export contacts?',
                a: 'Pro and Team plans include contact export functionality. You can export to CSV from the search results.',
              },
              {
                q: 'How do I upgrade my plan?',
                a: 'Go to Settings > Billing to view and upgrade your subscription plan.',
              },
              {
                q: 'How do I cancel my subscription?',
                a: 'You can cancel anytime from Settings > Billing. No penalties or cancellation fees.',
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

        {/* Still need help? CTA */}
        <div className="mt-16 rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-8 shadow-flk-floating dark:shadow-flk-floating-dark sm:p-10">
          <div className="mx-auto max-w-[68ch] text-center">
            <h2 className="text-flk-h3 font-bold tracking-[-0.02em] text-flk-text-primary">
              Still need help?
            </h2>
            <p className="mt-3 text-flk-body-m text-flk-text-secondary">
              Our support team is here to assist you. Reach out and we&apos;ll get back to you within 24 hours.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="mailto:support@getmecca.com"
                className="inline-flex h-[52px] items-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
              >
                <Mail className="mr-2 h-5 w-5" />
                Email Support
              </a>
              <Link
                href="/forum"
                className="inline-flex h-[52px] items-center rounded-flk-pill border border-flk-border-subtle bg-transparent px-[22px] text-flk-body-l font-medium text-flk-text-primary hover:bg-flk-surface-subtle"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Ask the Community
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
