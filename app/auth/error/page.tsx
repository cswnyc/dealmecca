'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The sign in link is no longer valid. It may have been used already or it may have expired.',
  Default: 'An error occurred during authentication. Please try again.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = (searchParams.get('error') as keyof typeof errorMessages) || 'Default';

  return (
    <div className="w-full max-w-md rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-8 shadow-flk-card dark:shadow-flk-card-dark">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-flk-lg bg-flk-status-error/10">
          <AlertTriangle className="h-7 w-7 text-flk-status-error" />
        </div>
        <h1 className="text-flk-h2 font-bold tracking-[-0.02em] text-flk-text-primary">
          Authentication Error
        </h1>
        <p className="mt-3 text-flk-body-m text-flk-text-secondary">
          {errorMessages[error]}
        </p>
      </div>

      <div className="mt-6 rounded-flk-lg border border-flk-status-error/20 bg-flk-status-error/5 p-4">
        <p className="text-flk-body-s text-flk-text-secondary">
          {error === 'Configuration' && 'Please contact support if this problem persists.'}
          {error === 'AccessDenied' && 'You may not have the necessary permissions to access this application.'}
          {error === 'Verification' && 'Please request a new sign in link.'}
          {error === 'Default' && 'This could be a temporary issue. Please try again.'}
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <Link
          href="/auth/signin"
          className="inline-flex h-[52px] w-full items-center justify-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Try Again
        </Link>

        <Link
          href="/"
          className="inline-flex h-[52px] w-full items-center justify-center rounded-flk-pill border border-flk-border-subtle bg-flk-surface px-[22px] text-flk-body-l font-medium text-flk-text-primary hover:bg-flk-surface-subtle"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flk min-h-screen bg-flk-bg flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-8 shadow-flk-card dark:shadow-flk-card-dark">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-flk-lg bg-flk-status-error/10">
                <AlertTriangle className="h-7 w-7 text-flk-status-error" />
              </div>
              <h1 className="text-flk-h2 font-bold text-flk-text-primary">Loading...</h1>
            </div>
          </div>
        }
      >
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
