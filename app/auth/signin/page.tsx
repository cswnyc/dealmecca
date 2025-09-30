'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to LinkedIn OAuth authentication
    console.log('🔀 Redirecting from signin to LinkedIn OAuth signup');
    router.replace('/auth/signup');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Redirecting to sign in...</p>
      </div>
    </div>
  );
}