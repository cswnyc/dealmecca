'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/firebase-auth'
import { Zap, Crown, ArrowUpRight, Loader2 } from 'lucide-react'

interface UpgradeButtonProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'minimal'
  tier?: 'PRO' | 'TEAM'
  interval?: 'monthly' | 'annual'
  currentTier?: 'FREE' | 'PRO' | 'TEAM'
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
  redirect?: boolean
}

export default function UpgradeButton({
  size = 'md',
  variant = 'primary',
  tier = 'PRO',
  interval = 'monthly',
  currentTier = 'FREE',
  className = '',
  children,
  showIcon = true,
  redirect = false
}: UpgradeButtonProps) {
  const { user, idToken } = useAuth()
  const [loading, setLoading] = useState(false)

  // Don't show upgrade button if user is already on the requested tier or higher
  const shouldShowUpgrade = () => {
    if (currentTier === 'TEAM') return false
    if (currentTier === 'PRO' && tier === 'PRO') return false
    return true
  }

  const createCheckoutSession = async () => {
    if (!idToken || !shouldShowUpgrade()) return

    setLoading(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          tier,
          interval,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: window.location.href
        })
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout process. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (children) return children

    if (tier === 'TEAM') {
      return `Upgrade to Team`
    }
    return `Upgrade to Pro`
  }

  const getIcon = () => {
    if (!showIcon) return null

    if (tier === 'TEAM') {
      return <Crown className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${variant === 'minimal' ? 'mr-1' : 'mr-2'}`} />
    }
    return <Zap className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${variant === 'minimal' ? 'mr-1' : 'mr-2'}`} />
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2 text-sm'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-muted text-foreground hover:bg-muted/80 border border-border'
      case 'minimal':
        return 'bg-transparent text-primary hover:bg-primary/10 border border-primary/20 hover:border-primary/40'
      default:
        if (tier === 'TEAM') {
          return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg'
        }
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'
    }
  }

  if (!shouldShowUpgrade()) {
    return null
  }

  const buttonClasses = `
    inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
    ${className}
  `

  if (redirect) {
    return (
      <Link href="/billing" className={buttonClasses}>
        {getIcon()}
        {getButtonText()}
        <ArrowUpRight className="w-4 h-4 ml-1" />
      </Link>
    )
  }

  return (
    <button
      onClick={createCheckoutSession}
      disabled={loading || !user}
      className={buttonClasses}
      title={!user ? 'Please sign in to upgrade' : ''}
    >
      {loading ? (
        <Loader2 className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} animate-spin mr-2`} />
      ) : (
        getIcon()
      )}
      {loading ? 'Processing...' : getButtonText()}
    </button>
  )
}

// Preset components for common use cases
export function UpgradeToProButton({ className = '', size = 'md' }: { className?: string, size?: 'sm' | 'md' | 'lg' }) {
  return (
    <UpgradeButton
      tier="PRO"
      interval="monthly"
      variant="primary"
      size={size}
      className={className}
    >
      Upgrade to Pro
    </UpgradeButton>
  )
}

export function UpgradeToTeamButton({ className = '', size = 'md' }: { className?: string, size?: 'sm' | 'md' | 'lg' }) {
  return (
    <UpgradeButton
      tier="TEAM"
      interval="monthly"
      variant="primary"
      size={size}
      className={className}
    >
      Upgrade to Team
    </UpgradeButton>
  )
}

export function MinimalUpgradeLink({ currentTier = 'FREE' }: { currentTier?: 'FREE' | 'PRO' | 'TEAM' }) {
  return (
    <UpgradeButton
      variant="minimal"
      size="sm"
      currentTier={currentTier}
      redirect={true}
      className="text-xs"
    >
      Upgrade
    </UpgradeButton>
  )
}