'use client';

import Link from 'next/link';
import { ArrowRight, Mail, ShieldCheck, FileText } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function PrivacyPage() {
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

      {/* Content */}
      <main className="mx-auto w-full max-w-[800px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-card dark:shadow-flk-card-dark sm:p-8 lg:p-10">
          <h1 className="text-flk-h1 font-bold tracking-[-0.02em] text-flk-text-primary">Privacy Policy</h1>
          <p className="mt-4 text-flk-body-m text-flk-text-muted">
            <strong>Effective Date:</strong> September 21, 2025
          </p>

          <div className="mt-8 space-y-8">
            <section>
              <p className="text-flk-body-m leading-relaxed text-flk-text-secondary">
                At DealMecca (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile applications, and services (collectively, the &quot;Services&quot;).
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">1. Information We Collect</h2>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">1.1 Personal Information</h3>
              <p className="mt-2 text-flk-body-m text-flk-text-secondary">We may collect the following types of personal information:</p>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-flk-body-m text-flk-text-secondary">
                <li>Contact information (name, email address, phone number, business address)</li>
                <li>Professional information (job title, company name, industry)</li>
                <li>Account credentials (username, password)</li>
                <li>Profile information and preferences</li>
                <li>Communication data (messages, support tickets)</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">1.2 Usage Information</h3>
              <p className="mt-2 text-flk-body-m text-flk-text-secondary">We automatically collect information about how you use our Services:</p>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-flk-body-m text-flk-text-secondary">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage patterns and preferences</li>
                <li>Log data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">2. How We Use Your Information</h2>
              <p className="mt-3 text-flk-body-m text-flk-text-secondary">We use your information for the following purposes:</p>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-flk-body-m text-flk-text-secondary">
                <li>Providing and maintaining our Services</li>
                <li>Processing transactions and payments</li>
                <li>Communicating with you about our Services</li>
                <li>Personalizing your experience</li>
                <li>Improving our Services and developing new features</li>
                <li>Ensuring security and preventing fraud</li>
                <li>Complying with legal obligations</li>
                <li>Marketing and promotional communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">3. Information Sharing and Disclosure</h2>
              <p className="mt-3 text-flk-body-m text-flk-text-secondary">We may share your information in the following circumstances:</p>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">3.1 Service Providers</h3>
              <p className="mt-2 text-flk-body-m text-flk-text-secondary">We may share information with trusted third-party service providers who assist us in operating our Services, such as:</p>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-flk-body-m text-flk-text-secondary">
                <li>Cloud hosting and infrastructure providers</li>
                <li>Payment processors</li>
                <li>Analytics and marketing platforms</li>
                <li>Customer support tools</li>
              </ul>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">3.2 Legal Requirements</h3>
              <p className="mt-2 text-flk-body-m text-flk-text-secondary">We may disclose information when required by law or to protect our rights, property, or safety.</p>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">3.3 Business Transfers</h3>
              <p className="mt-2 text-flk-body-m text-flk-text-secondary">In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">4. Data Security</h2>
              <p className="mt-3 text-flk-body-m text-flk-text-secondary">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-flk-body-m text-flk-text-secondary">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">5. Your Rights and Choices</h2>
              <p className="mt-3 text-flk-body-m text-flk-text-secondary">Depending on your location, you may have certain rights regarding your personal information:</p>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">5.1 General Rights</h3>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-flk-body-m text-flk-text-secondary">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your personal information</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
              </ul>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">5.2 GDPR Rights (EU Residents)</h3>
              <p className="mt-2 text-flk-body-m text-flk-text-secondary">
                If you are located in the European Union, you have additional rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with a supervisory authority.
              </p>

              <h3 className="mt-5 text-flk-body-l font-semibold text-flk-text-primary">5.3 CCPA Rights (California Residents)</h3>
              <p className="mt-2 text-flk-body-m text-flk-text-secondary">
                If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect and the right to request deletion of your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">6. Cookies and Tracking Technologies</h2>
              <p className="mt-3 text-flk-body-m text-flk-text-secondary">
                We use cookies and similar tracking technologies to enhance your experience on our Services. You can control cookie settings through your browser preferences. For more information about our use of cookies, please refer to our Cookie Policy.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">7. Data Retention</h2>
              <p className="mt-3 text-flk-body-m text-flk-text-secondary">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">8. International Data Transfers</h2>
              <p className="mt-3 text-flk-body-m text-flk-text-secondary">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure that such transfers are conducted in accordance with applicable data protection laws and with appropriate safeguards in place.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">9. Children&apos;s Privacy</h2>
              <p className="mt-3 text-flk-body-m text-flk-text-secondary">
                Our Services are not intended for children under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16, we will take steps to delete such information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">10. Changes to This Privacy Policy</h2>
              <p className="mt-3 text-flk-body-m text-flk-text-secondary">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Effective Date&quot; at the top. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">11. Contact Us</h2>
              <p className="mt-3 text-flk-body-m text-flk-text-secondary">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="mt-4 rounded-flk-lg bg-flk-surface-subtle p-5">
                <p className="text-flk-body-m text-flk-text-primary">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@getmecca.com" className="text-flk-primary hover:text-flk-primary-hover">
                    privacy@getmecca.com
                  </a>
                </p>
                <p className="mt-2 text-flk-body-m text-flk-text-primary">
                  <strong>Support:</strong>{' '}
                  <a href="mailto:support@getmecca.com" className="text-flk-primary hover:text-flk-primary-hover">
                    support@getmecca.com
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-flk-h3 font-bold tracking-[-0.01em] text-flk-text-primary">12. Consent</h2>
              <p className="mt-3 text-flk-body-m text-flk-text-secondary">
                By using our Services, you consent to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree with this Privacy Policy, please do not use our Services.
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
