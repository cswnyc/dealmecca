import type { Metadata } from 'next';
import '../src/app/globals.css';

export const metadata: Metadata = {
  title: 'Local Stays — Book Direct',
  description: 'Skip platform fees. Message real owners. Keep your rate.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}