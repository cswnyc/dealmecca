import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/providers/session-provider';
import PWAProvider from '@/components/providers/pwa-provider';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import './globals.css';
import './navigation-polish.css';

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
    'msapplication-TileColor': '#0f172a',
    'msapplication-TileImage': '/icons/ms-icon-144x144.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <AuthProvider>
          <PWAProvider>
            <div className="min-h-screen">
              {/* Main content with bottom padding for mobile navigation */}
              <main className="pb-16 md:pb-0">
                {children}
              </main>
              
              {/* Mobile Navigation - only visible on mobile */}
              <MobileNavigation />
            </div>
          </PWAProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 