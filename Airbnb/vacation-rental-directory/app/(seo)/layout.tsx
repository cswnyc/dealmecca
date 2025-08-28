import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function SeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}