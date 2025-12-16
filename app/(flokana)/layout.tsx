import type { Metadata } from 'next';

import '../design-system/flokana/flokana.css';

export const metadata: Metadata = {
  title: {
    default: 'DealMecca',
    template: '%s | DealMecca',
  },
};

export default function FlokanaRootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="flk min-h-screen w-full bg-flk-bg text-flk-text-primary font-flk">
      {children}
    </div>
  );
}
