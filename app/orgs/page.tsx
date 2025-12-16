'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrgsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct organizations page
    router.replace('/organizations');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">Taking you to the Organizations page</p>
      </div>
    </div>
  );
}