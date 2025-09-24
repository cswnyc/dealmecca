'use client'

import Link from 'next/link'
import { Mail, MessageCircle, MapPin, Clock, ArrowLeft, Send, Phone } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/forum" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Link>
              <div className="flex items-center space-x-2">
                <Mail className="w-6 h-6 text-slate-600" />
                <h1 className="text-xl font-semibold text-gray-900">Contact Us</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="font-medium text-gray-900">Community Forum</div>
            <div className="text-sm text-gray-600">Get help from the community</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Mail className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="font-medium text-gray-900">Email Support</div>
            <div className="text-sm text-gray-600">Direct communication</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="font-medium text-gray-900">Response Time</div>
            <div className="text-sm text-gray-600">Within 24 hours</div>
          </div>
        </div>

        {/* Main Contact Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="text-center mb-6">
            <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Get in Touch
            </h2>
            <p className="text-gray-600">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-800">
              📧 Contact forms and messaging are being enhanced for better communication.
              Full functionality will be restored within 24-48 hours.
            </p>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Email</div>
                    <div className="text-sm text-gray-600">support@dealmecca.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Community</div>
                    <div className="text-sm text-gray-600">Join our forum discussions</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Response Time</div>
                    <div className="text-sm text-gray-600">Usually within 24 hours</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">What We Can Help With</h3>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">• Account and billing questions</div>
                <div className="text-sm text-gray-600">• Technical support and troubleshooting</div>
                <div className="text-sm text-gray-600">• Feature requests and feedback</div>
                <div className="text-sm text-gray-600">• Partnership and business inquiries</div>
                <div className="text-sm text-gray-600">• Data export and privacy concerns</div>
                <div className="text-sm text-gray-600">• General questions about DealMecca</div>
              </div>
            </div>
          </div>

          {/* Contact Form Placeholder */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Send Us a Message</h3>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Send className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Contact form coming soon</p>
              <p className="text-sm text-gray-500">For now, please reach out via our community forum or email</p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">How do I reset my password?</h4>
                <p className="text-sm text-gray-600">You can reset your password through the sign-in page by clicking "Forgot Password".</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">How do I upgrade my account?</h4>
                <p className="text-sm text-gray-600">Visit the upgrade page from your user menu to see available plan options.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Can I export my data?</h4>
                <p className="text-sm text-gray-600">Yes, data export features are available in the "My Downloads" section of your account.</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 space-y-3">
            <Link href="/forum" className="inline-flex items-center justify-center px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 mr-3">
              Visit Community Forum
            </Link>
            <Link href="/help" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Get Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}