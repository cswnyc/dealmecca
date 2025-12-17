'use client';

import Link from 'next/link';
import { ArrowRight, Mail, ShieldCheck, FileText } from 'lucide-react';

export default function TermsPage() {
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

      {/* Content */}
      <main className="mx-auto w-full max-w-[800px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark sm:p-8 lg:p-10">
          <h1 className="text-flk-h1 font-bold tracking-[-0.02em] text-flk-text-primary">Terms of Service</h1>
          <p className="mt-4 text-flk-body-m text-flk-text-muted">
            <strong>Last Updated:</strong> January 5, 2025
          </p>

          <div className="mt-8 space-y-8">
            <section>
              <p className="text-flk-body-m leading-relaxed text-flk-text-secondary">
                DealMecca Inc. (&quot;DealMecca&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides a B2B media seller intelligence platform and related services, including www.getmecca.com (collectively, the &quot;Service&quot;), for use by our customers. These Terms of Service constitute a legal agreement between DealMecca and the individual, company or other legal entity obtaining a subscription to the Service (&quot;Customer&quot;) as well as each individual accessing and using the Service (&quot;User&quot;). In these Terms of Service, &quot;you&quot; and &quot;your&quot; may refer to Customer and/or User, depending on the applicable context. These Terms of Service include DealMecca&apos;s Privacy Policy. By purchasing a subscription or accessing or using the Service, you represent that you have read, understand and agree to all provisions in these Terms of Service, whether as a Customer or as a User. If you are agreeing to these Terms of Service on behalf of a Customer, you represent to DealMecca that you have the authority to do so.
              </p>
              <p className="mt-4 text-flk-body-m leading-relaxed text-flk-text-secondary">
                If you do not agree to all of the terms and conditions in these Terms of Service, you may not access or use the Service in any way.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">Changes to the Terms of Service</h2>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                We may modify these Terms of Service from time to time. When we do so, we will notify you by making the revised version available on this webpage and will indicate at the top of this webpage the date that revisions were last made. You should revisit these Terms of Service on a regular basis, as revised versions will be binding on you. Any such modification will be effective upon our posting of the revised Terms of Service. You understand and agree that your continued access to or use of the Service after any posted modification to these Terms of Service indicates your acceptance of the modification.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">Using the Service</h2>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">Eligibility</h3>
              <p className="mt-2 text-flk-body-m leading-relaxed text-flk-text-secondary">
                To access or use the Service, you, as a User, must be 18 years or older and have the requisite legal power and authority to enter into a binding contract in your jurisdiction. You may not access or use the Service if you are (or work for) a competitor of ours or if we have previously banned you from the Service or suspended or closed your User account. The Service is intended for legitimate business purposes in the media, advertising, and marketing industries.
              </p>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">Permission to Use the Service</h3>
              <p className="mt-2 text-flk-body-m leading-relaxed text-flk-text-secondary">
                We grant you a personal, nontransferable, nonexclusive, non sublicensable, revocable and limited license to use the Service subject to all of the terms and conditions in these Terms of Service. If you or your organization have a premium subscription (Pro, Team, or Admin), your access to and use of the premium features of the Service is also subject to the payment of all applicable fees and compliance with the payment terms below or in the purchase order between your organization and us. Your use of the Service is at your own risk, including the risk that you might be exposed to Content (defined below) that is offensive, indecent, inaccurate, objectionable, or otherwise inappropriate.
              </p>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">Service Availability</h3>
              <p className="mt-2 text-flk-body-m leading-relaxed text-flk-text-secondary">
                The Service may be modified, updated, interrupted, suspended or discontinued at any time without notice or liability. We strive to maintain 99.5% uptime but do not guarantee uninterrupted service.
              </p>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">User Accounts</h3>
              <p className="mt-2 text-flk-body-m leading-relaxed text-flk-text-secondary">
                To access and use the Service, each User must create a User account, which may require you, as a User, to log in with certain third-party applications (such as LinkedIn, Google, or email authentication), and provide certain information about yourself, including your name, work email address and, in some cases, your employer and job title, in order to use the features that are offered through the Service. All such information must be accurate and complete. You may not provide an email address other than your own, and you may not create multiple User accounts.
              </p>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                Each User account is solely for the personal use of that User. As a User, you agree not to share your login credentials with any other person or allow others to login to your User account. You are responsible for all activities that occur in connection with your User account. You agree to notify us immediately of any unauthorized use of your User account. We reserve the right to suspend or close your User account at any time for any or no reason.
              </p>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                When creating a User account, you may also be required to create a profile with your professional information. Take care to note that others may be able to identify you through your profile information, forum posts, and other activities on the Service. Please read our Privacy Policy for more information.
              </p>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">Communications from Us and other Users</h3>
              <p className="mt-2 text-flk-body-m leading-relaxed text-flk-text-secondary">
                By creating a User account, you agree to receive certain communications in connection with the Service. For example, you might receive forum notifications, saved search alerts, event updates, contact interaction reminders, and product announcements or marketing communications. You may also receive notifications about activity on the Service from other Users. Please see our Privacy Policy for more information about managing communication preferences.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">Content</h2>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                &quot;Content&quot; means Service Content and User Content. &quot;Service Content&quot; means all materials or communication provided on or generated via the Service, including company information, contact data, search results, analytics, and any materials or communication generated using interactive features of the Service (including AI-powered features), but excluding User Content. &quot;User Content&quot; means information and materials submitted, posted or otherwise provided on or through the Service by a User, such as forum posts, comments, questions, answers, ratings, reviews, contact notes, event listings, company mentions, and other information that Users (including you) contribute on the Service.
              </p>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">Responsibility for User Content You Submit on the Service</h3>
              <p className="mt-2 text-flk-body-m leading-relaxed text-flk-text-secondary">
                You alone are responsible for User Content you submit on the Service, and once published, it cannot always be withdrawn, even if your User account is terminated or deleted. You assume all risks associated with User Content you submit on the Service, including responsibility for anyone&apos;s reliance on such User Content, its quality, accuracy, or reliability, or any disclosure by you of information that makes you or anyone else personally identifiable. You represent that you own or have all necessary rights to use and authorize the use of User Content you submit on the Service as described herein. You may not imply that Content you submit on the Service is in any way sponsored or endorsed by us.
              </p>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">Our Right to Use User Content You Submit on the Service</h3>
              <p className="mt-2 text-flk-body-m leading-relaxed text-flk-text-secondary">
                We may use, and allow others to use, User Content you submit on the Service for any purpose in connection with the Service and our business, and by submitting User Content, you grant to us an irrevocable, worldwide, non-exclusive, transferable, sublicensable, fully-paid, royalty free right to use, copy, publicly display, publicly perform, reformat, modify, promote, distribute, translate, and create derivative works from such User Content. You also irrevocably grant the Users of the Service the right to access and use User Content you submit on the Service in connection with their use of the Service.
              </p>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">Ownership</h3>
              <p className="mt-2 text-flk-body-m leading-relaxed text-flk-text-secondary">
                We own the Service, including all visual interfaces, interactive features, graphics, design, compilation, computer code, products, software, algorithms, artificial intelligence models, company and contact databases, search functionality, analytics, and all other elements and components of the Service. We also own the copyrights, trademarks, service marks, trade names, trade secrets, and other intellectual and proprietary rights throughout the world associated with the Service, which are protected by copyright, trade dress, patent, trademark laws and all other applicable intellectual and proprietary rights and laws.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">Prohibited Uses</h2>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                We are under no obligation to enforce these Terms of Service against another User. While we encourage you to let us know if you believe another User has violated the Terms of Service, we reserve the right to investigate and take appropriate action at our sole discretion.
              </p>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                You agree not to, and will not assist or enable others to use the Service to:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-flk-body-m text-flk-text-secondary">
                <li>Violate any third party&apos;s rights, including any breach of confidence, copyright, trademark, patent, trade secret, moral right, privacy right, right of publicity, or any other intellectual property or proprietary right;</li>
                <li>Use the Service for purposes unrelated to legitimate business activities in the media, advertising, and marketing industries;</li>
                <li>Promote a business or other commercial venture or event unrelated to the media industry, or otherwise use the Service for inappropriate commercial purposes;</li>
                <li>Send bulk emails, surveys, or other mass messaging using contact information obtained from the Service;</li>
                <li>Use contact information obtained from the Service in violation of CAN-SPAM Act, TCPA, GDPR, CCPA, or other applicable privacy and marketing laws;</li>
                <li>Resell or make the Service available to any third party or use the Service on behalf of any third party without proper authorization;</li>
                <li>Create, sell, license, or redistribute databases derived from Service Content;</li>
                <li>Violate any applicable federal, state, local or international law or regulation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">Fees and Payment</h2>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                If you have purchased a premium subscription (Pro, Team, or Admin), you will be required to select a subscription plan and provide accurate payment information. You agree to pay us in accordance with the applicable subscription plan. If you are paying by credit card, you authorize us, through our third-party payment service provider (Stripe), to process your payment on a periodic basis in accordance with such plan. We reserve the right to change our prices for paid Services at any time, but we will notify you at least 30 days before the change is to take effect. All payments are non-refundable, except as otherwise agreed in our refund policy (30-day money-back guarantee for first-time Pro subscribers).
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">Indemnity</h2>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                You agree to indemnify, defend and hold us, our subsidiaries, affiliates, suppliers, licensors and partners, and our and their respective officers, directors, employees, agents and representatives harmless, including costs, liabilities and legal fees, from any claim or demand made by any third party due to or arising out of your access to or use of the Service, your violation of these Terms of Service, your use of contact information obtained through the Service in violation of applicable laws, the infringement by you of any intellectual property or other right of any person or entity, or your User Content.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">Disclaimers and Limitations of Liability</h2>
              <div className="mt-3 rounded-flk-lg border border-flk-status-warning/30 bg-flk-status-warning/5 p-4">
                <p className="text-flk-body-m font-semibold text-flk-text-primary">
                  PLEASE READ THIS SECTION CAREFULLY, SINCE IT LIMITS THE LIABILITY OF THE INDEMNIFIED PARTIES.
                </p>
              </div>
              <p className="mt-4 text-flk-body-m leading-relaxed text-flk-text-secondary">
                THE SERVICE IS MADE AVAILABLE TO YOU ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. WITHOUT LIMITING THE FOREGOING, THE INDEMNIFIED PARTIES MAKE NO CLAIMS OR PROMISES THAT THE SERVICE OR ANY CONTENT WILL BE ERROR FREE OR UNINTERRUPTED, OR THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICE OR ANY CONTENT WILL OTHERWISE MEET YOUR NEEDS OR EXPECTATIONS. YOUR USE OF THE SERVICE IS AT YOUR OWN DISCRETION AND RISK.
              </p>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                THE INDEMNIFIED PARTIES&apos; MAXIMUM AGGREGATE LIABILITY TO YOU FOR LOSSES OR DAMAGES THAT YOU SUFFER IN CONNECTION WITH THE SERVICE OR THESE TERMS OF SERVICE IS LIMITED TO THE GREATER OF (I) THE AMOUNT PAID, IF ANY, BY YOU TO US IN CONNECTION WITH THE SERVICE IN THE 12 MONTHS PRIOR TO THE ACTION GIVING RISE TO LIABILITY, OR (II) $100.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">Termination</h2>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                You may terminate these Terms of Service at any time by closing your User account, discontinuing your use of the Service, and providing us with a notice of termination. If you close your User account, we may continue to display certain User Content you submitted on the Service (such as forum posts) but will remove your personal identifying information where feasible.
              </p>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                We may close your User account, suspend your ability to use certain portions of the Service, and/or ban you altogether from the Service for any or no reason, and without notice or liability of any kind.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">General Terms</h2>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                We may provide you with notices, including those regarding changes to the Terms of Service by email, regular mail or communications through the Service. If you wish to contact us, you may do so through your User account or by sending us an email at legal@getmecca.com.
              </p>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                These Terms of Service contain the entire agreement between you and us regarding the use of the Service, and supersede any prior agreement between you and us on such subject matter. Any failure on our part to exercise or enforce any right or provision of these Terms of Service does not constitute a waiver of such right or provision.
              </p>
              <p className="mt-3 text-flk-body-m leading-relaxed text-flk-text-secondary">
                If any provision of these Terms of Service is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms of Service shall otherwise remain in full force and effect and enforceable.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">Contact Information</h2>
              <div className="mt-4 rounded-flk-lg bg-flk-surface-subtle p-5">
                <p className="text-flk-body-m text-flk-text-primary">
                  <strong>Legal inquiries:</strong>{' '}
                  <a href="mailto:legal@getmecca.com" className="text-flk-primary hover:text-flk-primary-hover">
                    legal@getmecca.com
                  </a>
                </p>
                <p className="mt-2 text-flk-body-m text-flk-text-primary">
                  <strong>Customer support:</strong>{' '}
                  <a href="mailto:support@getmecca.com" className="text-flk-primary hover:text-flk-primary-hover">
                    support@getmecca.com
                  </a>
                </p>
                <p className="mt-2 text-flk-body-m text-flk-text-primary">
                  <strong>General inquiries:</strong>{' '}
                  <a href="mailto:hello@getmecca.com" className="text-flk-primary hover:text-flk-primary-hover">
                    hello@getmecca.com
                  </a>
                </p>
              </div>
              <p className="mt-4 text-flk-body-s italic text-flk-text-muted">
                These Terms of Service are designed to protect both DealMecca and our users while enabling productive use of our B2B intelligence platform for legitimate business activities in the media and advertising industry.
              </p>
            </section>
          </div>

          {/* Back to Home */}
          <div className="mt-10 border-t border-flk-border-subtle pt-6">
            <Link
              href="/"
              className="inline-flex items-center text-flk-body-m font-medium text-flk-primary transition-colors hover:text-flk-primary-hover"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

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
