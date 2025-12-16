'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/firebase-auth'
import { Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

interface NewsletterSignupProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal' | 'sidebar' | 'footer'
  className?: string
  placeholder?: string
  buttonText?: string
  showIcon?: boolean
  inline?: boolean
}

export default function NewsletterSignup({
  size = 'md',
  variant = 'default',
  className = '',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  showIcon = true,
  inline = false
}: NewsletterSignupProps) {
  const { user, idToken } = useAuth()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }

    setLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`
      }

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          source: 'website_component'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Successfully subscribed!')
        setEmail('')
        setFirstName('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to subscribe')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          input: 'px-3 py-2 text-sm',
          button: 'px-3 py-2 text-sm',
          icon: 'w-4 h-4'
        }
      case 'lg':
        return {
          input: 'px-4 py-4 text-lg',
          button: 'px-6 py-4 text-lg',
          icon: 'w-6 h-6'
        }
      default:
        return {
          input: 'px-4 py-3 text-base',
          button: 'px-4 py-3 text-base',
          icon: 'w-5 h-5'
        }
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return {
          container: 'bg-transparent border border-border rounded-lg p-4',
          input: 'border-border focus:border-primary',
          button: 'bg-primary text-primary-foreground hover:bg-primary/90'
        }
      case 'sidebar':
        return {
          container: 'bg-muted border border-border rounded-lg p-4',
          input: 'border-border focus:border-primary',
          button: 'bg-green-600 text-white hover:bg-green-700'
        }
      case 'footer':
        return {
          container: 'bg-gray-800 text-white rounded-lg p-6',
          input: 'border-gray-600 bg-gray-700 text-white placeholder-gray-300 focus:border-primary',
          button: 'bg-primary text-primary-foreground hover:bg-primary/90'
        }
      default:
        return {
          container: 'bg-card border border-border rounded-lg p-6 shadow-sm',
          input: 'border-border focus:border-primary',
          button: 'bg-primary text-primary-foreground hover:bg-primary/90'
        }
    }
  }

  const sizeClasses = getSizeClasses()
  const variantClasses = getVariantClasses()

  if (status === 'success') {
    return (
      <div className={`${variantClasses.container} text-center ${className}`}>
        <CheckCircle className={`${sizeClasses.icon} text-green-500 mx-auto mb-3`} />
        <h3 className="font-semibold mb-2">Thanks for subscribing!</h3>
        <p className={`text-sm ${variant === 'footer' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
          {message}
        </p>
      </div>
    )
  }

  return (
    <div className={`${variantClasses.container} ${className}`}>
      {variant !== 'minimal' && (
        <div className="text-center mb-4">
          {showIcon && <Mail className={`${sizeClasses.icon} mx-auto mb-3 ${variant === 'footer' ? 'text-blue-400' : 'text-primary'}`} />}
          <h3 className="font-semibold mb-2">
            {variant === 'footer' ? 'Stay Updated' : 'Join Our Newsletter'}
          </h3>
          <p className={`text-sm ${variant === 'footer' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            Get the latest deals, insights, and community updates delivered to your inbox.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={inline ? 'flex space-x-2' : 'space-y-3'}>
        {!inline && variant === 'default' && (
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name (optional)"
            className={`w-full border rounded-md ${sizeClasses.input} ${variantClasses.input} focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50`}
          />
        )}

        <div className={inline ? 'flex-1' : ''}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            required
            className={`w-full border rounded-md ${sizeClasses.input} ${variantClasses.input} focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50`}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`${inline ? '' : 'w-full'} rounded-md font-medium transition-all duration-200 ${sizeClasses.button} ${variantClasses.button} disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95`}
        >
          {loading ? (
            <Loader2 className={`${sizeClasses.icon} animate-spin ${inline ? 'mx-auto' : 'mr-2'}`} />
          ) : (
            showIcon && !inline && <Mail className={`${sizeClasses.icon} mr-2`} />
          )}
          {loading ? 'Subscribing...' : buttonText}
        </button>
      </form>

      {status === 'error' && (
        <div className="mt-3 flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {message}
        </div>
      )}

      {variant !== 'minimal' && (
        <p className={`text-xs mt-3 ${variant === 'footer' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
          No spam, unsubscribe at any time.
        </p>
      )}
    </div>
  )
}

// Preset components for common use cases
export function NewsletterSignupInline({ className = '' }: { className?: string }) {
  return (
    <NewsletterSignup
      variant="minimal"
      size="sm"
      inline={true}
      placeholder="Your email"
      buttonText="Subscribe"
      showIcon={false}
      className={className}
    />
  )
}

export function NewsletterSignupSidebar() {
  return (
    <NewsletterSignup
      variant="sidebar"
      size="sm"
    />
  )
}

export function NewsletterSignupFooter() {
  return (
    <NewsletterSignup
      variant="footer"
      size="md"
    />
  )
}

export function NewsletterSignupLarge() {
  return (
    <NewsletterSignup
      variant="default"
      size="lg"
    />
  )
}