'use client';

import { ReactNode } from 'react';
import { UserProvider } from '@/hooks/useUser';

interface Props {
  children: ReactNode;
}

export default function ConditionalUserProvider({ children }: Props) {
  // UserProvider updated to use Firebase-compatible profile endpoint
  console.log('🔥 Using Firebase-compatible UserProvider');
  return <UserProvider>{children}</UserProvider>;
}