import type { Metadata } from 'next';

import './flokana.css';

export const metadata: Metadata = {
  title: 'Flokana Design System',
  description: 'Flokana-inspired component showcase (scoped theme)',
};

export default function FlokanaLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return children as JSX.Element;
}
