'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LogoWithIcon } from '@/components/brand/Logo';
import { GradientHero } from '@/components/invite-only/gradient-hero';
import { WaitlistForm } from '@/components/invite-only/waitlist-form';
import { AnimatedBackground } from '@/components/invite-only/animated-bg';
import { Linkedin, Twitter, Mail } from 'lucide-react';

export default function InviteOnlyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Minimal Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-6 md:p-8"
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="block">
              <LogoWithIcon size="sm" />
            </Link>

            {/* Social Links */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.a
                href="https://linkedin.com/company/dealmecca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://twitter.com/dealmecca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="mailto:hello@getmecca.com"
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="w-5 h-5" />
              </motion.a>
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

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4.5, duration: 0.8 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 5, duration: 0.6 }}
                  className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">AI</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Insights</h3>
                  <p className="text-slate-400 text-sm">Intelligence that identifies the hottest prospects</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 5.2, duration: 0.6 }}
                  className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">⚡</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Real-Time Data</h3>
                  <p className="text-slate-400 text-sm">Live updates on market movements and opportunities</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 5.4, duration: 0.6 }}
                  className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sales Intelligence</h3>
                  <p className="text-slate-400 text-sm">Predictive analytics for media sales success</p>
                </motion.div>
              </div>

              {/* Beta Access Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5.6, duration: 0.8 }}
                className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-6 max-w-2xl mx-auto"
              >
                <h4 className="text-xl font-semibold text-white mb-3">Why Invite-Only?</h4>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  We're carefully onboarding media sales professionals to ensure the best possible experience.
                  Early access members get priority support, exclusive features, and input on product development.
                </p>
                <div className="flex items-center justify-center space-x-6 text-xs text-slate-400">
                  <span>🔒 Private Beta</span>
                  <span>👥 Limited Access</span>
                  <span>🚀 Early Features</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </main>

        {/* Minimal Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 6, duration: 0.8 }}
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

            <div className="flex items-center space-x-4">
              <span className="text-slate-500 text-sm">© 2024 DealMecca</span>

              {/* Mobile Social Links */}
              <div className="flex md:hidden items-center space-x-3">
                <a
                  href="https://linkedin.com/company/dealmecca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com/dealmecca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}