'use client'

import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 mb-6">
            Join DealMecca and start connecting with media professionals
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ Sign up functionality is temporarily disabled during deployment migration.
            Enhanced registration will be restored soon.
          </p>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-sky-600 hover:text-sky-700 font-medium">
            Sign in here
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