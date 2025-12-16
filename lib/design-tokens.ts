// lib/design-tokens.ts
// Centralized design system tokens for DealMecca

// =============================================================================
// STATUS & ENTITY COLORS
// These colors convey specific meaning and should be used consistently
// =============================================================================

export const statusColors = {
  // Event/Post Status
  status: {
    DRAFT: 'bg-muted text-muted-foreground border-border',
    PUBLISHED: 'bg-green-100 text-green-800 border-green-200',
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    POSTPONED: 'bg-orange-100 text-orange-800 border-orange-200',
    FLAGGED: 'bg-red-100 text-red-800 border-red-200',
  },

  // Subscription Status
  subscription: {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-muted text-muted-foreground',
    CANCELLED: 'bg-red-100 text-red-800',
    PAST_DUE: 'bg-orange-100 text-orange-800',
  },

  // User Roles/Tiers
  role: {
    ADMIN: 'bg-purple-100 text-purple-800',
    PREMIUM: 'bg-blue-100 text-blue-800',
    FREE: 'bg-muted text-muted-foreground',
  },

  // VIP Tiers (entity-semantic - keep distinct colors)
  vipTier: {
    BRONZE: 'bg-amber-100 text-amber-800 border-amber-200',
    SILVER: 'bg-gray-100 text-gray-800 border-gray-200',
    GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PLATINUM: 'bg-purple-100 text-purple-800 border-purple-200',
  },

  // Data Quality
  dataQuality: {
    VERIFIED: 'bg-green-100 text-green-800',
    STANDARD: 'bg-blue-100 text-blue-800',
    UNVERIFIED: 'bg-muted text-muted-foreground',
  },
};

export const categoryColors = {
  // Event Categories (entity-semantic - keep distinct colors for visual scanning)
  event: {
    NETWORKING: 'bg-green-100 text-green-800',
    CONFERENCE: 'bg-blue-100 text-blue-800',
    WORKSHOP: 'bg-purple-100 text-purple-800',
    WEBINAR: 'bg-indigo-100 text-indigo-800',
    MEETUP: 'bg-teal-100 text-teal-800',
    TRADE_SHOW: 'bg-orange-100 text-orange-800',
    AWARD_SHOW: 'bg-pink-100 text-pink-800',
    OTHER: 'bg-muted text-muted-foreground',
  },

  // Company Types
  company: {
    AGENCY: 'bg-blue-100 text-blue-800',
    BRAND: 'bg-green-100 text-green-800',
    MEDIA: 'bg-purple-100 text-purple-800',
    TECH: 'bg-indigo-100 text-indigo-800',
    HOLDING_COMPANY: 'bg-orange-100 text-orange-800',
  },

  // Seniority Levels (entity-semantic)
  seniority: {
    C_LEVEL: 'bg-purple-100 text-purple-800',
    VP: 'bg-blue-100 text-blue-800',
    DIRECTOR: 'bg-green-100 text-green-800',
    SENIOR_MANAGER: 'bg-yellow-100 text-yellow-800',
    MANAGER: 'bg-orange-100 text-orange-800',
    SENIOR: 'bg-teal-100 text-teal-800',
    MID: 'bg-muted text-muted-foreground',
    ENTRY: 'bg-muted text-muted-foreground',
    UNKNOWN: 'bg-muted text-muted-foreground',
  },
};

// Helper to get status color with fallback
export const getStatusColor = (
  type: keyof typeof statusColors,
  value: string
): string => {
  const colors = statusColors[type];
  return (colors as Record<string, string>)[value] || 'bg-muted text-muted-foreground';
};

// Helper to get category color with fallback
export const getCategoryColor = (
  type: keyof typeof categoryColors,
  value: string
): string => {
  const colors = categoryColors[type];
  return (colors as Record<string, string>)[value] || 'bg-muted text-muted-foreground';
};

// =============================================================================
// DESIGN TOKENS
// =============================================================================

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
