'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UpgradePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/billing')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-border p-6 text-center">
        <h1 className="text-xl font-semibold text-foreground mb-2">Redirecting...</h1>
        <p className="text-muted-foreground">Taking you to billing & pricing...</p>
      </div>
    </div>
  )
}