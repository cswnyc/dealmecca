'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/firebase-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogoWithIcon } from '@/components/brand/Logo';
import { brandConfig } from '@/lib/brand-config';
import {
  AlertCircle,
  CheckCircle,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Users,
  Zap,
  Star
} from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const router = useRouter();

  // Handle cases where Firebase provider might not be available
  let user = null;
  let authLoading = false;
  let signInWithGoogle = null;
  let signInWithLinkedIn = null;
  let signInWithEmail = null;

  try {
    const authContext = useAuth();
    user = authContext.user;
    authLoading = authContext.loading;
    signInWithGoogle = authContext.signInWithGoogle;
    signInWithLinkedIn = authContext.signInWithLinkedIn;
    signInWithEmail = authContext.signInWithEmail;
  } catch (error) {
    console.log('Auth context not available during build');
  }

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/forum');
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    if (!signInWithGoogle) return;

    setLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      if (result) {
        setSuccess('Logged in successfully! Redirecting...');
        setTimeout(() => router.push('/forum'), 1500);
      }
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      // Use the LinkedIn start endpoint which handles environment variables properly
      window.location.href = '/api/linkedin/start';
    } catch (err) {
      setError('Failed to initiate LinkedIn authentication. Please try again.');
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInWithEmail) return;

    setLoading(true);
    setError('');

    try {
      const result = await signInWithEmail(email, password);
      if (result) {
        setSuccess('Logged in successfully! Redirecting...');
        setTimeout(() => router.push('/forum'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Panel - Brand Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>

        {/* Logo */}
        <div className="relative z-10">
          <LogoWithIcon size="lg" className="text-white" />
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-6">
            Welcome back to {brandConfig.name}
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-lg">
            Continue your journey in media sales intelligence
          </p>

          {/* Key Benefits */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-slate-300">Access your saved contacts</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-slate-300">Secure encrypted connection</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-slate-300">Join the community discussion</span>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="relative z-10">
          <div className="flex items-center space-x-1 text-yellow-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
            <span className="text-slate-300 ml-2">Trusted by media professionals</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <LogoWithIcon size="md" />
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Sign in to your account
                </h2>
                <p className="text-slate-600">
                  Welcome back! Please enter your details
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              {!showEmailForm ? (
                <div className="space-y-4">
                  {/* OAuth Buttons */}
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    variant="outline"
                    className="w-full h-12 text-slate-700 border-slate-300 hover:bg-slate-50"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>

                  <Button
                    onClick={handleLinkedInSignIn}
                    disabled={loading}
                    variant="outline"
                    className="w-full h-12 text-slate-700 border-slate-300 hover:bg-slate-50"
                  >
                    <svg className="w-5 h-5 mr-3 fill-current text-blue-600" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Continue with LinkedIn
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500">or</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowEmailForm(true)}
                    variant="outline"
                    className="w-full h-12 text-slate-700 border-slate-300 hover:bg-slate-50"
                  >
                    <Mail className="w-5 h-5 mr-3" />
                    Continue with Email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleEmailSignIn} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-3 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-slate-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                      <label htmlFor="remember" className="ml-2 block text-sm text-slate-600">
                        Remember me
                      </label>
                    </div>
                    <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    variant="ghost"
                    className="w-full"
                  >
                    ← Back to other options
                  </Button>
                </form>
              )}

              <div className="mt-8 text-center">
                <p className="text-sm text-slate-600">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500 font-medium underline">
                    Sign up
                  </Link>
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>500+ Teams</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>Always Secure</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
