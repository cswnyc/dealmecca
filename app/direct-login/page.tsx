'use client'

import Link from 'next/link'

export default function DirectLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Direct Login
          </h1>
          <p className="text-gray-600 mb-6">
            Direct login functionality is temporarily disabled during deployment migration.
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ Direct login is temporarily disabled during deployment migration.
            Enhanced login will be restored soon.
          </p>
        </div>
        
        <div className="text-center">
          <Link href="/auth/signin" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Go to Main Login
          </Link>
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}