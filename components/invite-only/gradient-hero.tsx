'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { shouldReduceMotion } from '@/lib/design-tokens';

interface GradientHeroProps {
  className?: string;
}

export function GradientHero({ className = '' }: GradientHeroProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = shouldReduceMotion();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`text-center space-y-8 ${className}`}>
      {/* Main Headline */}
      <motion.div
        initial={{ opacity: 0, y: reducedMotion ? 0 : 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: reducedMotion ? 0 : 30 }}
        transition={{ duration: reducedMotion ? 0 : 0.8, ease: [0.215, 0.61, 0.355, 1] }}
      >
        <h1 className="heading-display text-white mb-4">
          Currently{' '}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Invite-Only
          </span>
        </h1>
      </motion.div>

      {/* Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: reducedMotion ? 0 : 20 }}
        transition={{ delay: reducedMotion ? 0 : 0.3, duration: reducedMotion ? 0 : 0.6 }}
        className="space-y-4"
      >
        <p className="text-xl md:text-2xl lg:text-3xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
          The intelligence platform that{' '}
          <motion.span
            className="text-emerald-400 font-semibold"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: reducedMotion ? 0 : 0.8, duration: reducedMotion ? 0 : 0.4 }}
          >
            closes deals faster
          </motion.span>
        </p>

        <motion.p
          className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: reducedMotion ? 0 : 1.2, duration: reducedMotion ? 0 : 0.6 }}
        >
          Limited beta access for media sales professionals
        </motion.p>
      </motion.div>
    </div>
  );
}
