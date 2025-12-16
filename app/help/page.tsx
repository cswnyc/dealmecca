'use client'

import Link from 'next/link'
import { HelpCircle, MessageCircle, BookOpen, Mail, ArrowLeft, Phone, Clock, Search } from 'lucide-react'

export default function HelpPage() {
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
                <HelpCircle className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Help & Support</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/forum" className="bg-card rounded-lg border border-border p-6 text-center hover:shadow-md transition-all">
            <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="font-medium text-foreground">Community Forum</div>
            <div className="text-sm text-muted-foreground">Ask questions & get help</div>
          </Link>
          <div className="bg-card rounded-lg border border-border p-6 text-center">
            <BookOpen className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <div className="font-medium text-foreground">Documentation</div>
            <div className="text-sm text-muted-foreground">Learn how to use features</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-6 text-center">
            <Mail className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="font-medium text-foreground">Contact Support</div>
            <div className="text-sm text-muted-foreground">Get personalized help</div>
          </div>
        </div>

        {/* Support Center */}
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <div className="text-center">
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Support Center
            </h2>
            <p className="text-muted-foreground mb-6">
              Get help with using DealMecca features, troubleshooting, and best practices.
            </p>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-accent-foreground">
              Support features are being enhanced for faster response times and better self-service options.
              Full functionality will be restored within 24-48 hours.
            </p>
          </div>

          {/* Help Topics */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground mb-3">Popular Help Topics:</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">How to search organizations effectively</span>
                </div>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-foreground">Participating in community discussions</span>
                </div>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-foreground">Managing your account settings</span>
                </div>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-foreground">Understanding subscription plans</span>
                </div>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-3">Contact Methods:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Community Forum</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Get help from the community and our team</p>
                <Link href="/forum" className="text-sm text-primary hover:underline">
                  Visit Forum →
                </Link>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Mail className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-foreground">Email Support</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Direct support for complex issues</p>
                <span className="text-sm text-muted-foreground">support@dealmecca.com</span>
              </div>
            </div>
          </div>

          {/* Response Times */}
          <div className="mt-6 bg-muted rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-2">Expected Response Times:</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Community Forum: Usually within 2-4 hours</div>
              <div>• Email Support: Within 24 hours</div>
              <div>• Urgent Issues: Within 4-6 hours</div>
            </div>
          </div>

          <div className="text-center mt-6 space-y-3">
            <Link href="/forum" className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 mr-3">
              Visit Community Forum
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
