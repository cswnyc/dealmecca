'use client'

import Link from 'next/link'

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-foreground">
                DealMecca
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/forum" className="text-muted-foreground hover:text-foreground">
                Forum
              </Link>
              <Link href="/orgs" className="text-muted-foreground hover:text-foreground">
                Organizations
              </Link>
              <Link href="/events" className="text-muted-foreground hover:text-foreground">
                Events
              </Link>
              <Link href="/auth/signin" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Market Intelligence
          </h1>
          <p className="text-muted-foreground mb-6">
            AI-powered market insights and analysis is currently being optimized for better performance.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Feature Temporarily Optimized
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  We're enhancing this feature for better performance and user experience. 
                  Core functionality will be restored within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/forum" className="block bg-white p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Community Forum</h3>
              <p className="text-sm text-muted-foreground">Join discussions with media professionals</p>
            </div>
          </Link>
          
          <Link href="/orgs" className="block bg-white p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1 4h1m4-4h1m-1 4h1" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Organizations</h3>
              <p className="text-sm text-muted-foreground">Browse companies and contacts</p>
            </div>
          </Link>
          
          <Link href="/events" className="block bg-white p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Events</h3>
              <p className="text-sm text-muted-foreground">Discover industry events</p>
            </div>
          </Link>
        </div>
        
        <div className="text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}