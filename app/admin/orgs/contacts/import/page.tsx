'use client'

import Link from 'next/link'

export default function ContactImportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-lg border border-border p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Contact Import
          </h1>
          <p className="text-muted-foreground mb-6">
            This admin tool is temporarily disabled during system optimization.
          </p>
        </div>
        
        <div className="bg-muted border border-border rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            🔧 <strong>System Enhancement in Progress</strong><br/>
            admin tools and admin features are being optimized. 
            These will be restored once core user features are fully operational.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link href="/forum" className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Visit Community Forum
          </Link>
          <Link href="/orgs" className="block w-full text-center px-4 py-2 border border-input text-muted-foreground rounded-md hover:bg-muted transition-colors">
            Browse Organizations
          </Link>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}