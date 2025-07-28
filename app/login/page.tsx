'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for success messages from URL params
  const messageParam = searchParams.get('message')
  if (messageParam === 'signup-success' && !message) {
    setMessage('Account created successfully! Please log in.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔄 LOGIN ATTEMPT: Started for email:', email)
    
    if (!email.trim() || !password) {
      console.log('❌ VALIDATION: Missing fields')
      setError('Please fill in all fields')
      return
    }
    
    console.log('✅ VALIDATION: Fields provided')
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      console.log('🔐 Using working auth endpoint instead of broken NextAuth...')
      
      const response = await fetch('/api/auth-login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password 
        }),
        credentials: 'include' // CRITICAL: Ensures session cookies are set
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Login successful:', result.user)
        
        // Get callback URL from search params or use default redirect
        const callbackUrl = searchParams.get('callbackUrl') || result.redirectUrl || '/dashboard'
        
        console.log('🔄 Redirecting to:', callbackUrl)
        router.push(callbackUrl)
        
      } else {
        const errorData = await response.json()
        console.log('❌ Login failed:', errorData)
        setError(errorData.error || 'Invalid email or password')
      }
      
    } catch (error) {
      console.error('❌ Login error:', error)
      setError('Network error - please try again')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your DealMecca account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success Message */}
          {message && (
            <div className="flex items-center p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 mr-2" />
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                  placeholder="pro@dealmecca.pro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-2.5" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Quick Access</span>
            </div>
          </div>

          {/* Test credentials for development */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-600 font-medium mb-2">Test Credentials:</p>
            <div className="space-y-1">
              <button
                type="button"
                className="w-full text-left text-xs text-blue-600 hover:text-blue-800 py-1 px-2 bg-white rounded border border-blue-200 hover:border-blue-300 transition-colors"
                onClick={() => {
                  setEmail('pro@dealmecca.pro')
                  setPassword('test123')
                }}
                disabled={isLoading}
              >
                👤 Pro User: pro@dealmecca.pro / test123
              </button>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-sky-600 hover:text-sky-700 font-medium transition-colors">
              Sign up here
            </Link>
          </div>

          <div className="text-center text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-sky-600 hover:text-sky-700">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-sky-600 hover:text-sky-700">Privacy Policy</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
} 