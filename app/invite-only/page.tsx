'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { GradientHero } from '@/components/invite-only/gradient-hero';
import { WaitlistForm } from '@/components/invite-only/waitlist-form';
import { shouldReduceMotion } from '@/lib/design-tokens';

export default function InviteOnlyPage(): JSX.Element {
  const reducedMotion = shouldReduceMotion();
  
  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent opacity-30" />
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: reducedMotion ? 0 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.8 }}
          className="p-6 md:p-8"
        >
          <div className="container-premium">
            <div className="flex justify-center md:justify-start">
              <Logo
                size="md"
                dark={true}
                className="drop-shadow-lg"
              />
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 md:px-8 py-12">
          <div className="max-w-4xl mx-auto w-full text-center space-y-12">
            {/* Hero Section */}
            <GradientHero />

            {/* Waitlist Form */}
            <WaitlistForm />
          </div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reducedMotion ? 0 : 2, duration: reducedMotion ? 0 : 0.6 }}
          className="py-6 px-6 md:py-8 md:px-8"
        >
          <div className="container-premium">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6 text-sm">
                <Link 
                  href="/privacy" 
                  className="link-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms" 
                  className="link-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </div>

              <div className="flex items-center">
                <span className="text-muted-foreground text-sm">© 2024 DealMecca</span>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
