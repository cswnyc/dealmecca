'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The sign in link is no longer valid. It may have been used already or it may have expired.',
  Default: 'An error occurred during authentication. Please try again.',
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages || 'Default'
  
  return (
    <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
          <div className="h-8 w-8 text-red-700">⚠️</div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Authentication Error
        </h1>
        <p className="text-gray-600 mb-6">
          {errorMessages[error]}
        </p>
      </div>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-red-800">
          {error === 'Configuration' && 
            'Please contact support if this problem persists.'
          }
          {error === 'AccessDenied' && 
            'You may not have the necessary permissions to access this application.'
          }
          {error === 'Verification' && 
            'Please request a new sign in link.'
          }
          {error === 'Default' && 
            'This could be a temporary issue. Please try again.'
          }
        </p>
      </div>
      
      <div className="space-y-2">
        <Link href="/auth/signin" className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Try Again
        </Link>
        
        <Link href="/" className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
          Return to Home
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <div className="h-8 w-8 text-red-700">⚠️</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Loading...
            </h1>
          </div>
        </div>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  )
}