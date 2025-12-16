'use client'

import Link from 'next/link'
import { Mail, MessageCircle, MapPin, Clock, ArrowLeft, Send, Phone } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/forum" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Link>
              <div className="flex items-center space-x-2">
                <Mail className="w-6 h-6 text-muted-foreground" />
                <h1 className="text-xl font-semibold text-foreground">Contact Us</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg border border-border p-6 text-center">
            <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="font-medium text-foreground">Community Forum</div>
            <div className="text-sm text-muted-foreground">Get help from the community</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-6 text-center">
            <Mail className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <div className="font-medium text-foreground">Email Support</div>
            <div className="text-sm text-muted-foreground">Direct communication</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-6 text-center">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="font-medium text-foreground">Response Time</div>
            <div className="text-sm text-muted-foreground">Within 24 hours</div>
          </div>
        </div>

        {/* Main Contact Section */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="text-center mb-6">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Get in Touch
            </h2>
            <p className="text-muted-foreground">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="bg-muted border border-border rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground">
              Contact forms and messaging are being enhanced for better communication.
              Full functionality will be restored within 24-48 hours.
            </p>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Email</div>
                    <div className="text-sm text-muted-foreground">support@dealmecca.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Community</div>
                    <div className="text-sm text-muted-foreground">Join our forum discussions</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Response Time</div>
                    <div className="text-sm text-muted-foreground">Usually within 24 hours</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">What We Can Help With</h3>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">• Account and billing questions</div>
                <div className="text-sm text-muted-foreground">• Technical support and troubleshooting</div>
                <div className="text-sm text-muted-foreground">• Feature requests and feedback</div>
                <div className="text-sm text-muted-foreground">• Partnership and business inquiries</div>
                <div className="text-sm text-muted-foreground">• Data export and privacy concerns</div>
                <div className="text-sm text-muted-foreground">• General questions about DealMecca</div>
              </div>
            </div>
          </div>

          {/* Contact Form Placeholder */}
          <div className="mt-8">
            <h3 className="font-semibold text-foreground mb-4">Send Us a Message</h3>
            <div className="bg-muted rounded-lg p-8 text-center">
              <Send className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">Contact form coming soon</p>
              <p className="text-sm text-muted-foreground">For now, please reach out via our community forum or email</p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8">
            <h3 className="font-semibold text-foreground mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">How do I reset my password?</h4>
                <p className="text-sm text-muted-foreground">You can reset your password through the sign-in page by clicking "Forgot Password".</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">How do I upgrade my account?</h4>
                <p className="text-sm text-muted-foreground">Visit the upgrade page from your user menu to see available plan options.</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-2">Can I export my data?</h4>
                <p className="text-sm text-muted-foreground">Yes, data export features are available in the "My Downloads" section of your account.</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 space-y-3">
            <Link href="/forum" className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 mr-3">
              Visit Community Forum
            </Link>
            <Link href="/help" className="inline-flex items-center justify-center px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90">
              Get Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
