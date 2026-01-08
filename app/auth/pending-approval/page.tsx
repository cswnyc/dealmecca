'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/firebase-auth';
import { AuthShell } from '@/components/auth/AuthShell';
import { Clock, CheckCircle, Mail, HelpCircle, LogOut } from 'lucide-react';

export default function PendingApprovalPage(): JSX.Element {
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkStatus = async (): Promise<void> => {
      // Give Firebase auth a moment to load if still initializing
      if (authLoading) {
        console.log('Waiting for Firebase auth to load...');
        return;
      }

      // Check for auth via cookies even if Firebase user isn't loaded yet
      try {
        const response = await fetch('/api/auth/firebase-sync', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Account status check:', data.user?.accountStatus);
          
          if (data.user) {
            setUserEmail(data.user.email || '');
            
            if (data.user.accountStatus === 'APPROVED') {
              // User has been approved! Redirect to forum
              console.log('User is approved, redirecting to forum');
              router.push('/forum');
              return;
            } else if (data.user.accountStatus === 'REJECTED') {
              // Account was rejected
              console.log('User account is rejected');
              setLoading(false);
              return;
            } else if (data.user.accountStatus === 'PENDING') {
              // User is pending - show the pending page
              console.log('User is pending approval');
              setLoading(false);
              return;
            }
          } else {
            // No user found via cookie auth, check Firebase user
            if (!user) {
              console.log('No authenticated user found, redirecting to sign-in');
              router.push('/auth/signin');
              return;
            }
            setUserEmail(user.email || '');
            setLoading(false);
          }
        } else if (response.status === 401) {
          // Not authenticated at all
          console.log('Not authenticated, redirecting to sign-in');
          router.push('/auth/signin');
          return;
        } else {
          // Other error - show pending page anyway if we have a Firebase user
          if (user) {
            setUserEmail(user.email || '');
            setLoading(false);
          } else {
            router.push('/auth/signin');
          }
        }
      } catch (error) {
        console.error('Error checking account status:', error);
        // On error, check if we at least have a Firebase user
        if (user) {
          setUserEmail(user.email || '');
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    };

    checkStatus();

    // Poll for status changes every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return (): void => {
      clearInterval(interval);
    };
  }, [user, authLoading, router]);

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.push('/');
  };

  if (loading || authLoading) {
    return (
      <div className="flk min-h-screen bg-flk-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flk-primary"></div>
      </div>
    );
  }

  return (
    <AuthShell
      title="Account Pending Approval"
      subtitle="Your account is being reviewed by our team"
      showTrustIndicators={false}
    >
      <div className="space-y-6">
        {/* Status Card */}
        <div className="rounded-flk-lg border border-flk-primary/20 bg-flk-primary-soft-bg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Clock className="w-8 h-8 text-flk-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-flk-heading-s font-semibold text-flk-text-primary mb-2">
                Awaiting Admin Review
              </h3>
              <p className="text-flk-body-s text-flk-text-secondary">
                Thank you for signing up! Your account is currently pending approval from our
                administrators. This helps us maintain a high-quality community of verified media
                sales professionals.
              </p>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="space-y-4">
          <h4 className="text-flk-body-m font-semibold text-flk-text-primary">
            What happens next?
          </h4>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 rounded-full bg-flk-primary/10 flex items-center justify-center">
                  <span className="text-flk-body-xs font-semibold text-flk-primary">1</span>
                </div>
              </div>
              <div>
                <p className="text-flk-body-s text-flk-text-primary">
                  <span className="font-semibold">Review Process:</span> Our team will review your
                  account details and LinkedIn profile to verify you&apos;re a media sales
                  professional.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 rounded-full bg-flk-primary/10 flex items-center justify-center">
                  <span className="text-flk-body-xs font-semibold text-flk-primary">2</span>
                </div>
              </div>
              <div>
                <p className="text-flk-body-s text-flk-text-primary">
                  <span className="font-semibold">Notification:</span> You&apos;ll receive an email
                  at <span className="font-mono text-flk-primary">{userEmail}</span> once your
                  account is approved.
                </p>
                <p className="text-flk-body-xs text-flk-text-muted mt-1.5">
                  💡 Pro tip: Check your spam/junk folder if you don&apos;t see the approval email
                  within 48 hours, and add us to your contacts.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 rounded-full bg-flk-primary/10 flex items-center justify-center">
                  <span className="text-flk-body-xs font-semibold text-flk-primary">3</span>
                </div>
              </div>
              <div>
                <p className="text-flk-body-s text-flk-text-primary">
                  <span className="font-semibold">Full Access:</span> Once approved, you&apos;ll
                  have complete access to the forum, org charts, and all platform features.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-flk-status-success flex-shrink-0" />
            <div>
              <p className="text-flk-body-s text-flk-text-primary">
                <span className="font-semibold">Typical approval time:</span> 24-48 hours
              </p>
              <p className="text-flk-body-xs text-flk-text-muted mt-1">
                Most accounts are reviewed within one business day
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-4">
          <div className="flex items-start space-x-3">
            <HelpCircle className="w-5 h-5 text-flk-text-muted flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-flk-body-s text-flk-text-primary font-semibold mb-1">
                Need help?
              </p>
              <p className="text-flk-body-s text-flk-text-secondary mb-3">
                If you have questions about your account status or believe there&apos;s been an
                error, please contact our support team.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center space-x-2 text-flk-body-s text-flk-primary hover:text-flk-primary-hover transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Support</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="pt-4 border-t border-flk-border-subtle">
          <button
            onClick={handleSignOut}
            className="w-full h-10 flex items-center justify-center space-x-2 text-flk-text-muted hover:text-flk-text-primary transition-colors text-flk-body-s"
            type="button"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

