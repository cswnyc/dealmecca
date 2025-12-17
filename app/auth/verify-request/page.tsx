'use client';

import Link from 'next/link';
import { Mail, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function VerifyRequestPage() {
  return (
    <div className="flk min-h-screen bg-flk-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-flk-xl border border-flk-border-subtle bg-flk-surface p-8 shadow-flk-card dark:shadow-flk-card-dark">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-flk-lg bg-flk-status-success/10">
            <Mail className="h-7 w-7 text-flk-status-success" />
          </div>
          <h1 className="text-flk-h2 font-bold tracking-[-0.02em] text-flk-text-primary">
            Check your email
          </h1>
          <p className="mt-3 text-flk-body-m text-flk-text-secondary">
            A sign in link has been sent to your email address.
          </p>
        </div>

        <div className="mt-6 rounded-flk-lg border border-flk-status-warning/30 bg-flk-status-warning/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-flk-status-warning" />
            <p className="text-flk-body-s text-flk-text-secondary">
              Email verification is temporarily disabled during deployment migration.
              Enhanced email functionality will be restored soon.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="inline-flex h-[52px] w-full items-center justify-center rounded-flk-pill bg-flk-primary px-[22px] text-flk-body-l font-medium text-flk-text-inverse shadow-flk-card hover:bg-flk-primary-hover active:bg-flk-primary-active dark:shadow-flk-card-dark"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
