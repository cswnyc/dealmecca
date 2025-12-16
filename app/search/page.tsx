'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect component - Search functionality is now integrated into Organizations
export default function SearchPage() {
  const router = useRouter()

  // Redirect to organizations page immediately
  useEffect(() => {
    router.replace('/orgs')
  }, [router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground text-lg">Redirecting to Organizations...</p>
        <p className="text-muted-foreground text-sm mt-2">Search functionality is now part of the Organizations section</p>
      </div>
    </div>
  )
}