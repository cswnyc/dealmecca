'use client'

import { useState } from 'react'
import { Linkedin, Loader2 } from 'lucide-react'

interface LinkedInSignInButtonProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
  className?: string
  children?: React.ReactNode
}

export default function LinkedInSignInButton({
  size = 'md',
  variant = 'default',
  className = '',
  children
}: LinkedInSignInButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleLinkedInSignIn = async (e: React.MouseEvent) => {
    // Prevent any default behavior that might trigger Firebase auth
    e.preventDefault()
    e.stopPropagation()

    setLoading(true)

    try {
      console.log('LinkedIn sign-in initiated by user')
      // Use the server-side start route which properly sets cookies and redirects
      window.location.href = '/api/linkedin/start'
    } catch (error) {
      console.error('LinkedIn sign-in error:', error)
      alert('Failed to start LinkedIn sign-in. Please try again.')
      setLoading(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'lg':
        return 'px-6 py-4 text-lg'
      default:
        return 'px-4 py-3 text-base'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
      default:
        return 'bg-blue-600 border-2 border-blue-600 text-white hover:bg-blue-700'
    }
  }

  const buttonClasses = `
    inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
    ${className}
  `

  return (
    <button
      onClick={handleLinkedInSignIn}
      disabled={loading}
      className={buttonClasses}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin mr-3" />
      ) : (
        <Linkedin className="w-5 h-5 mr-3" />
      )}
      {loading ? 'Connecting...' : (children || 'Continue with LinkedIn')}
    </button>
  )
}

// Preset components for common use cases
export function LinkedInSignInButtonLarge() {
  return (
    <LinkedInSignInButton size="lg" className="w-full">
      Sign in with LinkedIn
    </LinkedInSignInButton>
  )
}

export function LinkedInSignInButtonOutline() {
  return (
    <LinkedInSignInButton variant="outline" className="w-full">
      Continue with LinkedIn
    </LinkedInSignInButton>
  )
}

export function LinkedInSignInButtonSmall() {
  return (
    <LinkedInSignInButton size="sm">
      LinkedIn
    </LinkedInSignInButton>
  )
}