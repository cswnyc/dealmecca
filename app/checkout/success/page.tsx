'use client'

import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <div className="h-8 w-8 text-green-700">✓</div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase!
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ Payment processing is temporarily disabled during deployment migration.
            Enhanced checkout functionality will be restored soon.
          </p>
        </div>
        
        <div className="text-center">
          <Link href="/dashboard" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Go to Dashboard
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