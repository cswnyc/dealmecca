import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FirebaseProvider } from '@/components/providers/FirebaseProvider';
import AuthHeader from '@/components/navigation/AuthHeader';
import ConditionalUserProvider from '@/components/providers/conditional-user-provider';
import { ThemeProvider } from '@/lib/theme-context';
import ConditionalSidebar from '@/components/layout/ConditionalSidebar';
import ConditionalMobileBottomNav from '@/components/layout/ConditionalMobileBottomNav';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | DealMecca',
    default: 'DealMecca - Intelligence that closes',
  },
  description: 'DealMecca is the intelligence hub for media-sales teams. We plug your CRM, ad-server, and billing data into one neural engine, flagging the ripest prospects and the riskiest gaps—so reps close faster and managers forecast with surgical accuracy.',
  metadataBase: new URL('https://www.getmecca.com'),
  keywords: [
    'media sales intelligence',
    'sales data platform', 
    'deal pipeline management',
    'sales forecasting',
    'CRM integration',
    'media sales tools',
    'sales intelligence hub',
    'prospect identification',
    'deal tracking',
    'revenue forecasting',
    'sales automation',
    'media sales CRM'
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DealMecca',
    // Temporarily disabled to prevent 404 errors
    // startupImage: [
    //   {
    //     url: '/icons/apple-touch-startup-image-750x1334.png',
    //     media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
    //   },
    //   {
    //     url: '/icons/apple-touch-startup-image-828x1792.png',
    //     media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
    //   },
    // ],
  },
  openGraph: {
    title: 'DealMecca - Intelligence that closes',
    description: 'The intelligence hub for media-sales teams. Connect your CRM, ad-server, and billing data into one neural engine for faster deals and surgical forecasting accuracy.',
    url: 'https://www.getmecca.com',
    siteName: 'DealMecca',
    // Temporarily disabled to prevent 404 errors
    // images: [
    //   {
    //     url: '/og-image.jpg',
    //     width: 1200,
    //     height: 630,
    //     alt: 'DealMecca - Intelligence that closes',
    //   },
    // ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DealMecca - Intelligence that closes',
    description: 'The intelligence hub for media-sales teams. Connect your CRM, ad-server, and billing data into one neural engine for faster deals and surgical forecasting accuracy.',
    // Temporarily disabled to prevent 404 errors
    // images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  // Temporarily disabled to prevent 404 errors
  // icons: {
  //   icon: [
  //     { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
  //     { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
  //   ],
  //   apple: [
  //     { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  //   ],
  // },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-TileColor': '#2575FC',
    'msapplication-TileImage': '/icons/ms-icon-144x144.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#2575FC',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const theme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.classList.add(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-[#F7F9FC] dark:bg-[#0B1220] text-[#162B54] dark:text-[#EAF0FF] transition-colors duration-300`}>
        <ThemeProvider>
          <FirebaseProvider>
            <ConditionalUserProvider>
              <div className="flex h-screen overflow-hidden">
                {/* Collapsible Sidebar - Only shown for authenticated users on app pages */}
                <ConditionalSidebar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Auth Header */}
                  <AuthHeader />

                  {/* Scrollable Main Content */}
                  <main className="flex-1 overflow-y-auto">
                    {children}
                    {/* Mobile Bottom Navigation - Only shown for authenticated users on app pages */}
                    <ConditionalMobileBottomNav />
                  </main>
                </div>
              </div>
            </ConditionalUserProvider>
          </FirebaseProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
} 