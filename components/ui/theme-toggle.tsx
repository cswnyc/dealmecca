'use client';

import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { AnimatedIconButton } from './animated-components';
import { useTheme } from '@/lib/theme-context';
import { shouldReduceMotion } from '@/lib/design-tokens';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const reducedMotion = shouldReduceMotion();

  return (
    <AnimatedIconButton
      onClick={toggleTheme}
      tooltip={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="w-9 h-9"
    >
      <motion.div
        initial={false}
        animate={reducedMotion ? {
          opacity: 1
        } : {
          rotate: theme === 'dark' ? 180 : 0,
          scale: theme === 'dark' ? 0.9 : 1,
        }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
        className="relative w-5 h-5 flex items-center justify-center"
      >
        {theme === 'light' ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-blue-400" />
        )}
      </motion.div>
    </AnimatedIconButton>
  );
}