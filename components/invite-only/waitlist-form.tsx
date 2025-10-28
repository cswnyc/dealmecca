'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { motionVariants, designTokens, shouldReduceMotion } from '@/lib/design-tokens';

interface WaitlistFormProps {
  className?: string;
}

export function WaitlistForm({ className = '' }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Accessibility
  const reducedMotion = shouldReduceMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'invite-only',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      // Handle already registered case
      if (data.status === 'already_exists') {
        setError('This email is already registered for early access');
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      setEmail('');
    } catch (err) {
      console.error('Waitlist signup error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        {...motionVariants.scaleIn}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
        className={`max-w-md mx-auto text-center ${className}`}
      >
        <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-8">
          <motion.div
            {...motionVariants.scaleIn}
            transition={reducedMotion ? { duration: 0 } : { delay: 0.2, ...designTokens.transitions.spring }}
          >
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">You're on the list!</h3>
          <p className="text-slate-300 text-sm">
            We'll notify you when early access becomes available.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reducedMotion ? 0 : 2, duration: reducedMotion ? 0 : 0.6 }}
      className={`max-w-md mx-auto ${className}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="relative bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-1.5 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-transparent text-white placeholder:text-white/90 placeholder:font-normal pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-base font-medium"
                  required
                />
              </div>
              <motion.button
                type="submit"
                disabled={isLoading || !email}
                className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-xl font-black text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all hover:shadow-xl shadow-lg"
                whileHover={reducedMotion ? {} : designTokens.hover.button}
                whileTap={reducedMotion ? {} : designTokens.tap.button}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="tracking-wide">Join</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {error && (
          <motion.p
            {...motionVariants.fadeIn}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
            className="text-red-400 text-sm text-center"
          >
            {error}
          </motion.p>
        )}
      </form>
    </motion.div>
  );
}