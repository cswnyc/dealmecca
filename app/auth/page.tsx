'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the callback URL from query params
    const callbackUrl = searchParams.get('callbackUrl') || searchParams.get('next') || '/';

    // Redirect to signup with callback
    router.replace(`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
