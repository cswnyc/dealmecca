'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

function UpgradeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const feature = searchParams.get('feature')
  
  const [currentPlan, setCurrentPlan] = useState('free')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            {feature ? `Unlock ${feature} and more with a premium plan` : 'Get access to advanced features'}
          </p>
        </div>
        
        <div className="text-center">
          <Button onClick={() => router.push('/pricing')}>
            View Pricing Plans
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  )
} 