'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LogoWithIcon } from '@/components/brand/Logo';
import { GradientHero } from '@/components/invite-only/gradient-hero';
import { WaitlistForm } from '@/components/invite-only/waitlist-form';

export default function InviteOnlyPage() {
  return (
    <div className="h-screen bg-slate-900 text-white relative overflow-hidden"
         style={{ isolation: 'isolate', zIndex: 9999 }}>
      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Minimal Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-6 md:p-8"
        >
          <div className="max-w-7xl mx-auto flex justify-center md:justify-start">
            <div className="flex items-center">
              <LogoWithIcon
                size="md"
                variant="white"
                className="drop-shadow-lg"
              />
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 md:px-8 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            {/* Hero Section */}
            <GradientHero />

            {/* Waitlist Form */}
            <WaitlistForm className="mt-16" />
          </div>
        </main>

        {/* Minimal Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.6 }}
          className="p-6 md:p-8"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-slate-400 text-sm">
              <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                Terms of Service
              </Link>
            </div>

            <div className="flex items-center">
              <span className="text-slate-500 text-sm">© 2024 DealMecca</span>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}