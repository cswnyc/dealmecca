import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LinkedIn OAuth Test - Isolated',
  description: 'Clean LinkedIn OAuth testing without Firebase interference',
};

export default function IsolatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{
        fontFamily: 'Arial, sans-serif',
        margin: 0,
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh'
      }}>
        {children}
      </body>
    </html>
  );
}