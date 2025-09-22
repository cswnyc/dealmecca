import { Metadata } from 'next'
import Link from 'next/link'
import { LogoWithIcon } from '@/components/brand/Logo'

export const metadata: Metadata = {
  title: 'Privacy Policy | DealMecca',
  description: 'DealMecca privacy policy and data protection information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="inline-block">
            <LogoWithIcon size="sm" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Privacy Policy</h1>

          <p className="text-slate-600 dark:text-slate-300 mb-6">
            <strong>Effective Date:</strong> September 21, 2025
          </p>

          <section className="mb-8">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              At DealMecca ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile applications, and services (collectively, the "Services").
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">1. Information We Collect</h2>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">1.1 Personal Information</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">We may collect the following types of personal information:</p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300">
              <li>Contact information (name, email address, phone number, business address)</li>
              <li>Professional information (job title, company name, industry)</li>
              <li>Account credentials (username, password)</li>
              <li>Profile information and preferences</li>
              <li>Communication data (messages, support tickets)</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">1.2 Usage Information</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">We automatically collect information about how you use our Services:</p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage patterns and preferences</li>
              <li>Log data and analytics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300">
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

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">3. Information Sharing and Disclosure</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">We may share your information in the following circumstances:</p>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">3.1 Service Providers</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">We may share information with trusted third-party service providers who assist us in operating our Services, such as:</p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300">
              <li>Cloud hosting and infrastructure providers</li>
              <li>Payment processors</li>
              <li>Analytics and marketing platforms</li>
              <li>Customer support tools</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">3.2 Legal Requirements</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">We may disclose information when required by law or to protect our rights, property, or safety.</p>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">3.3 Business Transfers</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">4. Data Security</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection practices</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">5. Your Rights and Choices</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">Depending on your location, you may have certain rights regarding your personal information:</p>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">5.1 General Rights</h3>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate information</li>
              <li>Deletion of your personal information</li>
              <li>Restriction of processing</li>
              <li>Data portability</li>
              <li>Objection to processing</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">5.2 GDPR Rights (EU Residents)</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              If you are located in the European Union, you have additional rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with a supervisory authority.
            </p>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">5.3 CCPA Rights (California Residents)</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect and the right to request deletion of your personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">6. Cookies and Tracking Technologies</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our Services. You can control cookie settings through your browser preferences. For more information about our use of cookies, please refer to our Cookie Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">7. Data Retention</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">8. International Data Transfers</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure that such transfers are conducted in accordance with applicable data protection laws and with appropriate safeguards in place.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">9. Children's Privacy</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Our Services are not intended for children under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16, we will take steps to delete such information promptly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">11. Contact Us</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Email:</strong> <a href="mailto:privacy@getmecca.com" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">privacy@getmecca.com</a>
              </p>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Support:</strong> <a href="mailto:support@getmecca.com" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">support@getmecca.com</a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">12. Consent</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              By using our Services, you consent to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree with this Privacy Policy, please do not use our Services.
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <Link
            href="/"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <LogoWithIcon size="sm" className="mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              © 2024 DealMecca. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}