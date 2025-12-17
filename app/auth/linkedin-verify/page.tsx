'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { AlertCircle, CheckCircle, Linkedin, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth/firebase-auth';

export default function LinkedInVerifyPage(): JSX.Element {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const validateLinkedInUrl = (url: string): boolean => {
    const regex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
    return regex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!linkedinUrl.trim()) {
      setError('Please enter your LinkedIn profile URL');
      return;
    }

    if (!validateLinkedInUrl(linkedinUrl)) {
      setError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourname)');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save LinkedIn URL');
        setLoading(false);
        return;
      }

      setSuccess('LinkedIn profile verified! Redirecting...');
      setTimeout(() => {
        router.push('/forum');
      }, 1500);

    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleSkip = (): void => {
    router.push('/forum');
  };

  if (authLoading) {
    return (
      <div className="flk min-h-screen bg-flk-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flk-primary"></div>
      </div>
    );
  }

  return (
    <AuthShell
      title="Verify Your LinkedIn Profile"
      subtitle="Required for seller verification"
      leftPanelTitle="Why LinkedIn Verification?"
      leftPanelSubtitle="We verify all members are real media sales professionals to maintain community quality and trust."
      showTrustIndicators={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-flk-lg border border-flk-status-error/20 bg-flk-status-error/5 p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-flk-status-error flex-shrink-0" />
            <p className="text-flk-body-s text-flk-text-primary">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-flk-lg border border-flk-status-success/20 bg-flk-status-success/5 p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-flk-status-success flex-shrink-0" />
            <p className="text-flk-body-s text-flk-text-primary">{success}</p>
          </div>
        )}

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
            Enter your LinkedIn profile URL to verify you&apos;re a media sales professional.
          </p>
        </div>

        {/* Info Box */}
        <div className="rounded-flk-lg border border-flk-primary/20 bg-flk-primary-soft-bg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-flk-primary flex-shrink-0 mt-0.5" />
            <div className="text-flk-body-s text-flk-text-secondary">
              <span className="font-semibold text-flk-text-primary">Privacy Notice:</span> Your LinkedIn profile 
              is used for verification only. We never post on your behalf or share your profile publicly.
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-flk-primary hover:bg-flk-primary-hover active:bg-flk-primary-active text-white font-medium rounded-flk-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-flk-card hover:shadow-flk-card-hover dark:shadow-flk-card-dark"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              Verify & Continue
              <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </button>

        {/* Skip Button */}
        <button
          type="button"
          onClick={handleSkip}
          className="w-full h-10 text-flk-text-muted hover:text-flk-text-primary transition-colors text-flk-body-s"
        >
          Skip for now (verification required later)
        </button>
      </form>
    </AuthShell>
  );
}
