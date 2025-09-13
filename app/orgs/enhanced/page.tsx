'use client'

import Link from 'next/link'

export default function EnhancedOrgsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Enhanced Organizations
          </h1>
          <p className="text-gray-600 mb-6">
            Advanced organization browsing features is temporarily optimized during our system enhancement.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            🔧 This feature is being optimized for better performance. 
            Full functionality will be restored within 24-48 hours.
          </p>
        </div>
        
        <div className="text-center">
          <Link href="/forum" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-3 w-full">
            Visit Community Forum
          </Link>
          <Link href="/orgs" className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full">
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