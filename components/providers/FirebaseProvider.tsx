'use client';

import { FirebaseAuthProvider } from '@/lib/auth/firebase-auth';

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  return (
    <FirebaseAuthProvider>
      {children}
    </FirebaseAuthProvider>
  );
}