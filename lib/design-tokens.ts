// lib/design-tokens.ts
// Centralized design system tokens for DealMecca

export const designTokens = {
  // Animation timings
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    } as const,
  },

  // Shadows (theme-aware via CSS variables)
  shadows: {
    subtle: '0 1px 3px rgba(0, 0, 0, 0.08)',
    card: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)',
    cardHover: '0 10px 20px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.08)',
    glow: '0 0 20px var(--primary-glow)',
    glowLg: '0 0 40px var(--primary-glow-lg)',
  },

  // Spacing
  spacing: {
    cardPadding: '1.5rem',
    sectionGap: '2rem',
    navItemGap: '0.5rem',
  },

  // Border radius
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    sidebar: 30,
    modal: 40,
    popover: 50,
    toast: 60,
  },

  // Animation variants for Framer Motion
  animations: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 },
    },
    slideInRight: {
      initial: { x: 20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -20, opacity: 0 },
      transition: { duration: 0.3 },
    },
    slideInLeft: {
      initial: { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 20, opacity: 0 },
      transition: { duration: 0.3 },
    },
    slideInDown: {
      initial: { y: -20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -20, opacity: 0 },
      transition: { duration: 0.3 },
    },
    scaleIn: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
      transition: { duration: 0.2 },
    },
    staggerContainer: {
      animate: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
    staggerItem: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
  },

  // Hover effects
  hover: {
    card: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    button: {
      scale: 1.05,
      transition: { duration: 0.15 },
    },
    icon: {
      scale: 1.2,
      rotate: 5,
      transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
  },

  // Tap effects
  tap: {
    button: { scale: 0.95 },
    card: { scale: 0.98 },
  },
};

// Framer Motion variants for common animations
export const motionVariants = {
  fadeIn: designTokens.animations.fadeIn,
  slideInRight: designTokens.animations.slideInRight,
  slideInLeft: designTokens.animations.slideInLeft,
  slideInDown: designTokens.animations.slideInDown,
  scaleIn: designTokens.animations.scaleIn,
  staggerContainer: designTokens.animations.staggerContainer,
  staggerItem: designTokens.animations.staggerItem,
};

// Helper function for reduced motion
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get transition based on user preference
export const getTransition = (duration: 'fast' | 'normal' | 'slow' = 'normal') => {
  return shouldReduceMotion() ? '0ms' : designTokens.transitions[duration];
};
