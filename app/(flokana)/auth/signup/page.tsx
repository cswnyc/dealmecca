'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/firebase-auth';
import { AuthShell } from '@/components/auth/AuthShell';
import {
  AlertCircle,
  CheckCircle,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Linkedin,
} from 'lucide-react';

export default function SignUpPage(): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const router = useRouter();

  // Handle cases where Firebase provider might not be available
  let user = null;
  let authLoading = false;
  let signInWithGoogle = null;
  let signInWithLinkedIn = null;
  let signUpWithEmail = null;

  try {
    const authContext = useAuth();
    user = authContext.user;
    authLoading = authContext.loading;
    signInWithGoogle = authContext.signInWithGoogle;
    signInWithLinkedIn = authContext.signInWithLinkedIn;
    signUpWithEmail = authContext.signUpWithEmail;
  } catch (error) {
    console.log('Auth context not available during build');
  }

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/forum');
    }
  }, [user, authLoading, router]);

  const handleGoogleSignUp = async (): Promise<void> => {
    if (!signInWithGoogle) return;

    setLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      if (result) {
        if (result.isNewUser) {
          // New user - check approval status
          setSuccess('Account created! Checking approval status...');
          setTimeout(() => router.push('/auth/pending-approval'), 1500);
        } else {
          // Existing user
          setSuccess('Welcome back! Redirecting...');
          setTimeout(() => router.push('/forum'), 1500);
        }
      }
    } catch (err) {
      setError('Failed to create account with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInSignUp = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      // LinkedIn OAuth handles verification automatically
      window.location.href = '/api/linkedin/start';
    } catch (err) {
      setError('Failed to initiate LinkedIn authentication. Please try again.');
      setLoading(false);
    }
  };

  const validateLinkedInUrl = (url: string): boolean => {
    const regex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
    return regex.test(url);
  };

  const handleEmailSignUp = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!signUpWithEmail) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!linkedinUrl.trim()) {
      setError('LinkedIn profile URL is required for seller verification');
      return;
    }

    if (!validateLinkedInUrl(linkedinUrl)) {
      setError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourname)');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create account first
      const result = await signUpWithEmail(email, password);
      if (result) {
        // Save LinkedIn URL
        const linkedinResponse = await fetch('/api/users/linkedin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkedinUrl }),
        });

        if (!linkedinResponse.ok) {
          console.warn('Failed to save LinkedIn URL, but account was created');
        }

        setSuccess('Account created successfully! Checking approval status...');
        setTimeout(() => router.push('/auth/pending-approval'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 'weak', color: 'text-flk-status-error', text: 'Too short' };
    if (password.length < 8) return { strength: 'fair', color: 'text-flk-status-warning', text: 'Fair' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 'good', color: 'text-flk-primary', text: 'Good' };
    return { strength: 'strong', color: 'text-flk-status-success', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(password);

  if (authLoading) {
    return (
      <div className="flk min-h-screen bg-flk-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flk-primary"></div>
      </div>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join thousands of media sales professionals"
      altPageText="Already have an account?"
      altPageHref="/auth/login"
      altPageLinkText="Sign in"
    >
      {error && (
        <div className="rounded-flk-lg border border-flk-status-error/20 bg-flk-status-error/5 p-4 mb-6 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-flk-status-error flex-shrink-0" />
          <p className="text-flk-body-s text-flk-text-primary">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-flk-lg border border-flk-status-success/20 bg-flk-status-success/5 p-4 mb-6 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-flk-status-success flex-shrink-0" />
          <p className="text-flk-body-s text-flk-text-primary">{success}</p>
        </div>
      )}

      {!showEmailForm ? (
        <div className="space-y-3">
          {/* OAuth Buttons */}
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-3 border border-flk-border-subtle rounded-flk-lg bg-flk-surface hover:bg-flk-surface-subtle text-flk-text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>

          <button
            onClick={handleLinkedInSignUp}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-3 border border-flk-border-subtle rounded-flk-lg bg-flk-surface hover:bg-flk-surface-subtle text-flk-text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <svg className="w-5 h-5 flex-shrink-0 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="font-medium">Continue with LinkedIn</span>
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-flk-border-subtle"></div>
            </div>
            <div className="relative flex justify-center text-flk-body-s">
              <span className="px-3 bg-flk-surface text-flk-text-muted">or</span>
            </div>
          </div>

          <button
            onClick={(): void => setShowEmailForm(true)}
            className="w-full h-12 flex items-center justify-center gap-3 border border-flk-border-subtle rounded-flk-lg bg-flk-surface hover:bg-flk-surface-subtle text-flk-text-primary transition-all"
            type="button"
          >
            <Mail className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Continue with Email</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleEmailSignUp} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-flk-body-s font-medium text-flk-text-primary mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e): void => setEmail(e.target.value)}
              required
              className="w-full px-3 py-3 border border-flk-border-subtle rounded-flk-lg bg-flk-surface-subtle text-flk-text-primary focus:outline-none focus:ring-2 focus:ring-flk-primary focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-flk-body-s font-medium text-flk-text-primary mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e): void => setPassword(e.target.value)}
                required
                className="w-full px-3 py-3 pr-10 border border-flk-border-subtle rounded-flk-lg bg-flk-surface-subtle text-flk-text-primary focus:outline-none focus:ring-2 focus:ring-flk-primary focus:border-transparent"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={(): void => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-flk-text-muted" />
                ) : (
                  <Eye className="h-5 w-5 text-flk-text-muted" />
                )}
              </button>
            </div>
            {password && (
              <p className={`text-flk-body-s mt-1 ${passwordStrength.color}`}>
                Password strength: {passwordStrength.text}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-flk-body-s font-medium text-flk-text-primary mb-2">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e): void => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-3 pr-10 border border-flk-border-subtle rounded-flk-lg bg-flk-surface-subtle text-flk-text-primary focus:outline-none focus:ring-2 focus:ring-flk-primary focus:border-transparent"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={(): void => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-flk-text-muted" />
                ) : (
                  <Eye className="h-5 w-5 text-flk-text-muted" />
                )}
              </button>
            </div>
          </div>

          {/* LinkedIn URL Field */}
          <div>
            <label htmlFor="linkedinUrl" className="block text-flk-body-s font-medium text-flk-text-primary mb-2">
              LinkedIn Profile URL <span className="text-flk-status-error">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Linkedin className="h-5 w-5 text-[#0A66C2]" />
              </div>
              <input
                id="linkedinUrl"
                type="url"
                value={linkedinUrl}
                onChange={(e): void => setLinkedinUrl(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-3 border border-flk-border-subtle rounded-flk-lg bg-flk-surface-subtle text-flk-text-primary focus:outline-none focus:ring-2 focus:ring-flk-primary focus:border-transparent"
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>
            <p className="mt-2 text-flk-body-s text-flk-text-muted">
              Required for seller verification. We never post on your behalf.
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <input
              id="terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e): void => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-flk-primary focus:ring-flk-primary border-flk-border-subtle rounded"
            />
            <label htmlFor="terms" className="text-flk-body-s text-flk-text-secondary">
              I agree to the{' '}
              <Link href="/terms" className="text-flk-primary hover:text-flk-primary-hover">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-flk-primary hover:text-flk-primary-hover">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreedToTerms}
            className="w-full h-12 bg-flk-primary hover:bg-flk-primary-hover active:bg-flk-primary-active text-white font-medium rounded-flk-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-flk-card hover:shadow-flk-card-hover dark:shadow-flk-card-dark"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(): void => setShowEmailForm(false)}
            className="w-full h-10 text-flk-text-muted hover:text-flk-text-primary transition-colors text-flk-body-s"
          >
            ← Back to other options
          </button>
        </form>
      )}
    </AuthShell>
  );
}
