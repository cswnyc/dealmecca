import { Metadata } from 'next'
import Link from 'next/link'
import { LogoWithIcon } from '@/components/brand/Logo'

export const metadata: Metadata = {
  title: 'Terms of Service | DealMecca',
  description: 'DealMecca terms of service and user agreement.',
}

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">DealMecca Terms of Service</h1>

          <p className="text-slate-600 dark:text-slate-300 mb-6">
            <strong>Last Updated:</strong> January 5, 2025
          </p>

          <section className="mb-8">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              DealMecca Inc. ("DealMecca", "we", "us", "our") provides a B2B media seller intelligence platform and related services, including www.getmecca.com (collectively, the "Service"), for use by our customers. These Terms of Service constitute a legal agreement between DealMecca and the individual, company or other legal entity obtaining a subscription to the Service ("Customer") as well as each individual accessing and using the Service ("User"). In these Terms of Service, "you" and "your" may refer to Customer and/or User, depending on the applicable context. These Terms of Service include DealMecca's Privacy Policy. By purchasing a subscription or accessing or using the Service, you represent that you have read, understand and agree to all provisions in these Terms of Service, whether as a Customer or as a User. If you are agreeing to these Terms of Service on behalf of a Customer, you represent to DealMecca that you have the authority to do so.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
              If you do not agree to all of the terms and conditions in these Terms of Service, you may not access or use the Service in any way.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">CHANGES TO THE TERMS OF SERVICE</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We may modify these Terms of Service from time to time. When we do so, we will notify you by making the revised version available on this webpage and will indicate at the top of this webpage the date that revisions were last made. You should revisit these Terms of Service on a regular basis, as revised versions will be binding on you. Any such modification will be effective upon our posting of the revised Terms of Service. You understand and agree that your continued access to or use of the Service after any posted modification to these Terms of Service indicates your acceptance of the modification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">USING THE SERVICE</h2>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">Eligibility</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              To access or use the Service, you, as a User, must be 18 years or older and have the requisite legal power and authority to enter into a binding contract in your jurisdiction. You may not access or use the Service if you are (or work for) a competitor of ours or if we have previously banned you from the Service or suspended or closed your User account. The Service is intended for legitimate business purposes in the media, advertising, and marketing industries.
            </p>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">Permission to Use the Service</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              We grant you a personal, nontransferable, nonexclusive, non sublicensable, revocable and limited license to use the Service subject to all of the terms and conditions in these Terms of Service. If you or your organization have a premium subscription (Pro, Team, or Admin), your access to and use of the premium features of the Service is also subject to the payment of all applicable fees and compliance with the payment terms below or in the purchase order between your organization and us. Your use of the Service is at your own risk, including the risk that you might be exposed to Content (defined below) that is offensive, indecent, inaccurate, objectionable, or otherwise inappropriate.
            </p>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">Service Availability</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              The Service may be modified, updated, interrupted, suspended or discontinued at any time without notice or liability. We strive to maintain 99.5% uptime but do not guarantee uninterrupted service.
            </p>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">User Accounts</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              To access and use the Service, each User must create a User account, which may require you, as a User, to log in with certain third-party applications (such as LinkedIn, Google, or email authentication), and provide certain information about yourself, including your name, work email address and, in some cases, your employer and job title, in order to use the features that are offered through the Service. All such information must be accurate and complete. You may not provide an email address other than your own, and you may not create multiple User accounts.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              Each User account is solely for the personal use of that User. As a User, you agree not to share your login credentials with any other person or allow others to login to your User account. You are responsible for all activities that occur in connection with your User account. You agree to notify us immediately of any unauthorized use of your User account. We reserve the right to suspend or close your User account at any time for any or no reason.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              When creating a User account, you may also be required to create a profile with your professional information. Take care to note that others may be able to identify you through your profile information, forum posts, and other activities on the Service. Please read our Privacy Policy for more information.
            </p>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">Communications from Us and other Users</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              By creating a User account, you agree to receive certain communications in connection with the Service. For example, you might receive forum notifications, saved search alerts, event updates, contact interaction reminders, and product announcements or marketing communications. You may also receive notifications about activity on the Service from other Users. Please see our Privacy Policy for more information about managing communication preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">CONTENT</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              "Content" means Service Content and User Content. "Service Content" means all materials or communication provided on or generated via the Service, including company information, contact data, search results, analytics, and any materials or communication generated using interactive features of the Service (including AI-powered features), but excluding User Content. "User Content" means information and materials submitted, posted or otherwise provided on or through the Service by a User, such as forum posts, comments, questions, answers, ratings, reviews, contact notes, event listings, company mentions, and other information that Users (including you) contribute on the Service.
            </p>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">Responsibility for User Content You Submit on the Service</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              You alone are responsible for User Content you submit on the Service, and once published, it cannot always be withdrawn, even if your User account is terminated or deleted. You assume all risks associated with User Content you submit on the Service, including responsibility for anyone's reliance on such User Content, its quality, accuracy, or reliability, or any disclosure by you of information that makes you or anyone else personally identifiable. You represent that you own or have all necessary rights to use and authorize the use of User Content you submit on the Service as described herein. You may not imply that Content you submit on the Service is in any way sponsored or endorsed by us.
            </p>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">Our Right to Use User Content You Submit on the Service</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              We may use, and allow others to use, User Content you submit on the Service for any purpose in connection with the Service and our business, and by submitting User Content, you grant to us an irrevocable, worldwide, non-exclusive, transferable, sublicensable, fully-paid, royalty free right to use, copy, publicly display, publicly perform, reformat, modify, promote, distribute, translate, and create derivative works from such User Content. You also irrevocably grant the Users of the Service the right to access and use User Content you submit on the Service in connection with their use of the Service.
            </p>

            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-3">Ownership</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              We own the Service, including all visual interfaces, interactive features, graphics, design, compilation, computer code, products, software, algorithms, artificial intelligence models, company and contact databases, search functionality, analytics, and all other elements and components of the Service. We also own the copyrights, trademarks, service marks, trade names, trade secrets, and other intellectual and proprietary rights throughout the world associated with the Service, which are protected by copyright, trade dress, patent, trademark laws and all other applicable intellectual and proprietary rights and laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">PROHIBITED USES</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              We are under no obligation to enforce these Terms of Service against another User. While we encourage you to let us know if you believe another User has violated the Terms of Service, we reserve the right to investigate and take appropriate action at our sole discretion.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              You agree not to, and will not assist or enable others to use the Service to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300">
              <li>Violate any third party's rights, including any breach of confidence, copyright, trademark, patent, trade secret, moral right, privacy right, right of publicity, or any other intellectual property or proprietary right;</li>
              <li>Use the Service for purposes unrelated to legitimate business activities in the media, advertising, and marketing industries;</li>
              <li>Promote a business or other commercial venture or event unrelated to the media industry, or otherwise use the Service for inappropriate commercial purposes;</li>
              <li>Send bulk emails, surveys, or other mass messaging using contact information obtained from the Service;</li>
              <li>Use contact information obtained from the Service in violation of CAN-SPAM Act, TCPA, GDPR, CCPA, or other applicable privacy and marketing laws;</li>
              <li>Resell or make the Service available to any third party or use the Service on behalf of any third party without proper authorization;</li>
              <li>Create, sell, license, or redistribute databases derived from Service Content;</li>
              <li>Violate any applicable federal, state, local or international law or regulation.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">FEES AND PAYMENT</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              If you have purchased a premium subscription (Pro, Team, or Admin), you will be required to select a subscription plan and provide accurate payment information. You agree to pay us in accordance with the applicable subscription plan. If you are paying by credit card, you authorize us, through our third-party payment service provider (Stripe), to process your payment on a periodic basis in accordance with such plan. We reserve the right to change our prices for paid Services at any time, but we will notify you at least 30 days before the change is to take effect. All payments are non-refundable, except as otherwise agreed in our refund policy (30-day money-back guarantee for first-time Pro subscribers).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">INDEMNITY</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              You agree to indemnify, defend and hold us, our subsidiaries, affiliates, suppliers, licensors and partners, and our and their respective officers, directors, employees, agents and representatives harmless, including costs, liabilities and legal fees, from any claim or demand made by any third party due to or arising out of your access to or use of the Service, your violation of these Terms of Service, your use of contact information obtained through the Service in violation of applicable laws, the infringement by you of any intellectual property or other right of any person or entity, or your User Content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">DISCLAIMERS AND LIMITATIONS OF LIABILITY</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4 font-semibold">
              PLEASE READ THIS SECTION CAREFULLY, SINCE IT LIMITS THE LIABILITY OF THE INDEMNIFIED PARTIES.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              THE SERVICE IS MADE AVAILABLE TO YOU ON AN "AS IS" AND "AS AVAILABLE" BASIS. WITHOUT LIMITING THE FOREGOING, THE INDEMNIFIED PARTIES MAKE NO CLAIMS OR PROMISES THAT THE SERVICE OR ANY CONTENT WILL BE ERROR FREE OR UNINTERRUPTED, OR THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICE OR ANY CONTENT WILL OTHERWISE MEET YOUR NEEDS OR EXPECTATIONS. YOUR USE OF THE SERVICE IS AT YOUR OWN DISCRETION AND RISK.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              THE INDEMNIFIED PARTIES' MAXIMUM AGGREGATE LIABILITY TO YOU FOR LOSSES OR DAMAGES THAT YOU SUFFER IN CONNECTION WITH THE SERVICE OR THESE TERMS OF SERVICE IS LIMITED TO THE GREATER OF (I) THE AMOUNT PAID, IF ANY, BY YOU TO US IN CONNECTION WITH THE SERVICE IN THE 12 MONTHS PRIOR TO THE ACTION GIVING RISE TO LIABILITY, OR (II) $100.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">TERMINATION</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              You may terminate these Terms of Service at any time by closing your User account, discontinuing your use of the Service, and providing us with a notice of termination. If you close your User account, we may continue to display certain User Content you submitted on the Service (such as forum posts) but will remove your personal identifying information where feasible.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              We may close your User account, suspend your ability to use certain portions of the Service, and/or ban you altogether from the Service for any or no reason, and without notice or liability of any kind.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">GENERAL TERMS</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              We may provide you with notices, including those regarding changes to the Terms of Service by email, regular mail or communications through the Service. If you wish to contact us, you may do so through your User account or by sending us an email at legal@getmecca.com.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              These Terms of Service contain the entire agreement between you and us regarding the use of the Service, and supersede any prior agreement between you and us on such subject matter. Any failure on our part to exercise or enforce any right or provision of these Terms of Service does not constitute a waiver of such right or provision.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              If any provision of these Terms of Service is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms of Service shall otherwise remain in full force and effect and enforceable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h2>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Legal inquiries:</strong> <a href="mailto:legal@getmecca.com" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">legal@getmecca.com</a>
              </p>
              <p className="text-slate-700 dark:text-slate-300 mb-2">
                <strong>Customer support:</strong> <a href="mailto:support@getmecca.com" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">support@getmecca.com</a>
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>General inquiries:</strong> <a href="mailto:hello@getmecca.com" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">hello@getmecca.com</a>
              </p>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-4 italic">
              These Terms of Service are designed to protect both DealMecca and our users while enabling productive use of our B2B intelligence platform for legitimate business activities in the media and advertising industry.
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