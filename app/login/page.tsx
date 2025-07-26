'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
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
      console.log('📤 NEXTAUTH: Calling signIn() with credentials...')
      console.log('📤 NEXTAUTH: Email:', email.trim().toLowerCase())
      console.log('📤 NEXTAUTH: Password length:', password.length)
      console.log('📤 NEXTAUTH: Redirect set to false')

      const startTime = Date.now()
      
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password: password,
        redirect: false
      })

      const endTime = Date.now()
      console.log(`⏱️ NEXTAUTH: signIn() completed in ${endTime - startTime}ms`)
      
      console.log('📨 NEXTAUTH: signIn() result received:')
      console.log('📨 NEXTAUTH: Full result object:', JSON.stringify(result, null, 2))
      
      if (result) {
        console.log('📊 NEXTAUTH: Result analysis:')
        console.log('📊 NEXTAUTH: - ok:', result.ok)
        console.log('📊 NEXTAUTH: - status:', result.status)
        console.log('📊 NEXTAUTH: - error:', result.error)
        console.log('📊 NEXTAUTH: - url:', result.url)
      } else {
        console.log('⚠️ NEXTAUTH: signIn() returned null/undefined!')
      }

      if (result?.error) {
        console.log('❌ AUTHENTICATION: Failed with error:', result.error)
        
        // Provide specific error messages
        let errorMessage = 'Authentication failed'
        if (result.error === 'CredentialsSignin') {
          errorMessage = 'Invalid email or password'
        } else if (result.error === 'CallbackRouteError') {
          errorMessage = 'Authentication service error'
        } else {
          errorMessage = `Login failed: ${result.error}`
        }
        
        console.log('❌ AUTHENTICATION: Setting error message:', errorMessage)
        setError(errorMessage)
        
      } else if (result?.ok) {
        console.log('✅ AUTHENTICATION: Success! Starting redirect process...')
        
        // Brief delay to allow NextAuth session to be established
        setTimeout(async () => {
          try {
            console.log('🔍 POST-LOGIN: Checking session after signIn...')
            const sessionCheck = await fetch('/api/auth/session', {
              credentials: 'include',
              cache: 'no-cache'
            })
            
            const sessionData = await sessionCheck.json()
            console.log('🔍 POST-LOGIN: Session data:', sessionData)
            
            if (sessionData?.user) {
              console.log('✅ POST-LOGIN: Session confirmed, redirecting...')
              router.push('/dashboard')
            } else {
              console.log('⚠️ POST-LOGIN: No session yet, force redirecting anyway...')
              router.push('/dashboard')
            }
          } catch (error) {
            console.log('⚠️ POST-LOGIN: Session check failed, redirecting anyway...', error)
            router.push('/dashboard')
          }
        }, 1000)
        
      } else {
        console.log('❌ AUTHENTICATION: Unexpected result structure')
        console.log('❌ AUTHENTICATION: Result was neither error nor success:', result)
        
        // Check for null/undefined result
        if (result === null) {
          console.log('⚠️ AUTHENTICATION: signIn() returned null - potential network issue')
          setError('Login failed - please check your connection and try again.')
        } else if (result === undefined) {
          console.log('⚠️ AUTHENTICATION: signIn() returned undefined - unexpected response')
          setError('Login failed - unexpected response from server.')
        } else {
          console.log('⚠️ AUTHENTICATION: signIn() returned unknown result type:', typeof result)
          setError('Login failed with unexpected response. Please try again.')
        }
      }
      
    } catch (error: any) {
      console.error('❌ CRITICAL: Exception in handleSubmit:', error)
      console.error('❌ CRITICAL: Error message:', error?.message)
      console.error('❌ CRITICAL: Error stack:', error?.stack)
      setError(`Network error: ${error?.message || 'Please try again.'}`)
    } finally {
      console.log('🔄 CLEANUP: Setting loading to false')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your DealMecca account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success Message */}
          {message && (
            <div className="flex items-center text-green-700 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="h-4 w-4 mr-2" />
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="john@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center text-red-700 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              disabled={isLoading}
              onClick={() => console.log('🖱️ BUTTON: Sign In button clicked!')}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Debug Info */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
            <div className="font-semibold mb-1">Debug Status:</div>
            <div>Email: {email || 'empty'}</div>
            <div>Password: {password ? '***' : 'empty'}</div>
            <div>Loading: {isLoading ? 'true' : 'false'}</div>
            <div>Error: {error || 'none'}</div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isLoading}
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-sky-600 hover:text-sky-700 font-medium"
              >
                Sign up
              </Link>
            </p>
            
            {/* Debug Links */}
            <div className="text-xs text-gray-400 space-x-2">
              <Link
                href="/direct-login"
                className="hover:text-gray-600"
              >
                [Bypass Login]
              </Link>
              <span>•</span>
              <Link
                href="/dashboard-bypass"
                className="hover:text-gray-600"
              >
                [Dashboard Bypass]
              </Link>
            </div>
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
} 