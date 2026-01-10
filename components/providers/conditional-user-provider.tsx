'use client';

import { ReactNode } from 'react';
import { UserProvider } from '@/hooks/useUser';

interface Props {
  children: ReactNode;
}

export default function ConditionalUserProvider({ children }: Props): JSX.Element {
  // UserProvider updated to use Firebase-compatible profile endpoint
  return <UserProvider>{children}</UserProvider>;
}