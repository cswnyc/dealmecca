'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle, AlertCircle, Linkedin } from 'lucide-react'

export default function LinkedInSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')
  const [redirectAttempts, setRedirectAttempts] = useState(0)

  useEffect(() => {
    const processLinkedInAuth = async () => {
      try {
        console.log('🔗 LinkedIn success page processing auth...')

        // Parse URL parameters using window.location.search (no React dependencies)
        const urlParams = new URLSearchParams(window.location.search)
        const sessionToken = urlParams.get('session')
        const userDataString = urlParams.get('user')
        const redirectTo = urlParams.get('redirect') || '/forum'

        console.log('🔗 URL Parameters:', {
          hasSession: !!sessionToken,
          hasUser: !!userDataString,
          redirectTo,
          fullURL: window.location.href
        })

        if (!sessionToken) {
          console.error('❌ No session token found in URL params')
          throw new Error('No session token received')
        }

        // Parse and validate the session token
        const sessionData = JSON.parse(atob(sessionToken))
        console.log('🔗 Session data parsed:', {
          userId: sessionData.userId,
          email: sessionData.email,
          expiresAt: new Date(sessionData.exp).toLocaleString()
        })

        if (!sessionData.userId || !sessionData.email) {
          throw new Error('Invalid session data')
        }

        // Check token expiration
        if (Date.now() > sessionData.exp) {
          throw new Error('Session token expired')
        }

        // Store session data in localStorage for the app to use
        localStorage.setItem('linkedin-session', JSON.stringify(sessionData))
        console.log('✅ LinkedIn session stored in localStorage')

        // Note: Authentication cookie is set server-side in the OAuth callback
        // No need to set it client-side with document.cookie

        // Parse user data if available
        let userData = null
        if (userDataString) {
          try {
            userData = JSON.parse(userDataString)
            console.log('👤 User data parsed:', userData)
          } catch (e) {
            console.warn('⚠️ Failed to parse user data:', e)
          }
        }

        setStatus('success')
        console.log('✅ LinkedIn authentication processing complete')

        // Multiple redirect strategies with enhanced error handling
        const attemptRedirect = (attempt: number) => {
          console.log(`🔄 Redirect attempt ${attempt} to: ${redirectTo}`)

          try {
            // Clear any cached authentication state
            window.dispatchEvent(new Event('storage'))

            // Strategy 1: Direct window.location navigation
            if (attempt === 1) {
              console.log('🔄 Using window.location.href')
              window.location.href = redirectTo
              return
            }

            // Strategy 2: window.location.assign
            if (attempt === 2) {
              console.log('🔄 Using window.location.assign')
              window.location.assign(redirectTo)
              return
            }

            // Strategy 3: window.location.replace
            if (attempt === 3) {
              console.log('🔄 Using window.location.replace')
              window.location.replace(redirectTo)
              return
            }

          } catch (redirectError) {
            console.error(`❌ Redirect attempt ${attempt} failed:`, redirectError)

            // Try next strategy after delay
            if (attempt < 3) {
              setTimeout(() => attemptRedirect(attempt + 1), 1000)
            } else {
              console.error('❌ All redirect attempts failed')
              setError('Redirect failed. Please click the button below.')
            }
          }
        }

        // Start redirect sequence after a short delay
        setTimeout(() => attemptRedirect(1), 1500)

      } catch (error) {
        console.error('❌ LinkedIn auth processing error:', error)
        setError(error instanceof Error ? error.message : 'Authentication failed')
        setStatus('error')

        // Redirect to signup page after delay
        setTimeout(() => {
          console.log('🔄 Redirecting to signup page due to error')
          window.location.href = '/auth/signup?error=linkedin_auth_failed'
        }, 3000)
      }
    }

    // Process auth immediately on mount
    processLinkedInAuth()
  }, []) // No dependencies to avoid hydration issues

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Linkedin className="w-12 h-12 text-blue-600" />
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Completing LinkedIn Sign-In
          </h1>
          <p className="text-gray-600 mb-4">
            Please wait while we set up your account...
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Authenticating with LinkedIn</span>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <Linkedin className="w-6 h-6 text-blue-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to DealMecca!
          </h1>
          <p className="text-gray-600 mb-6">
            Your LinkedIn account has been successfully connected. Redirecting you to the community...
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              ✨ You now have access to all community features and can start networking with other professionals.
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <button
                onClick={() => {
                  const urlParams = new URLSearchParams(window.location.search)
                  const redirectTo = urlParams.get('redirect') || '/forum'
                  console.log('🔄 Manual redirect to:', redirectTo)
                  window.location.href = redirectTo
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Continue to Forum →
              </button>
              <p className="text-sm text-gray-500 mt-2">{error}</p>
            </div>
          )}

          <div className="text-xs text-gray-400">
            If you're not redirected automatically, <a
              href="/forum"
              className="text-blue-600 hover:text-blue-700 underline"
              onClick={(e) => {
                e.preventDefault()
                console.log('🔄 Manual link click to forum')
                window.location.href = '/forum'
              }}
            >
              click here
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Failed
          </h1>
          <p className="text-gray-600 mb-4">
            We couldn't complete your LinkedIn sign-in.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Redirecting you back to the sign-in page...
          </p>
        </div>
      </div>
    )
  }

  return null
}