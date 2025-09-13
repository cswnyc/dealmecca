'use client'

import { ReactNode } from 'react'
import { FirebaseAuthProvider } from '@/lib/auth/firebase-auth'

interface Props {
  children: ReactNode
}

export default function AuthProvider({ children }: Props) {
  // Use only Firebase authentication - NextAuth.js is completely removed
  console.log('🔥 Using Firebase authentication provider only')
  
  return (
    <FirebaseAuthProvider>
      {children}
    </FirebaseAuthProvider>
  )
} 