'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { designTokens, motionVariants, shouldReduceMotion } from '@/lib/design-tokens';

// ============================================
// ANIMATED CARD
// ============================================

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, hoverable = true, className, ...props }, ref) => {
    const reducedMotion = shouldReduceMotion();

    return (
      <motion.div
        ref={ref}
        {...motionVariants.fadeIn}
        whileHover={hoverable && !reducedMotion ? designTokens.hover.card : undefined}
        whileTap={hoverable && !reducedMotion ? designTokens.tap.card : undefined}
        transition={designTokens.transitions.spring}
        className={cn('card-enhanced', className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// ============================================
// ANIMATED BUTTON
// ============================================

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, variant = 'default', loading, className, ...props }, ref) => {
    const reducedMotion = shouldReduceMotion();

    const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors relative overflow-hidden';
    const variantStyles = {
      default: 'bg-background hover:bg-muted border border-border',
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-muted',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={reducedMotion ? undefined : designTokens.hover.button}
        whileTap={reducedMotion ? undefined : designTokens.tap.button}
        disabled={loading}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      >
        {loading && !reducedMotion && (
          <motion.span
            className="absolute inset-0 bg-white/20"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
        )}
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

// ============================================
// STAGGER CONTAINER
// ============================================

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  staggerDelay?: number;
}

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, staggerDelay = 0.1, className, ...props }, ref) => {
    const reducedMotion = shouldReduceMotion();

    // Use the design token stagger container with custom stagger delay if needed
    const variants = reducedMotion
      ? {}
      : {
          visible: {
            transition: {
              staggerChildren: staggerDelay,
            },
          },
        };

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={variants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

StaggerContainer.displayName = 'StaggerContainer';

// ============================================
// STAGGER ITEM
// ============================================

interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={motionVariants.staggerItem}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

StaggerItem.displayName = 'StaggerItem';

// ============================================
// ANIMATED BADGE
// ============================================

interface AnimatedBadgeProps extends HTMLMotionProps<'span'> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export const AnimatedBadge = forwardRef<HTMLSpanElement, AnimatedBadgeProps>(
  ({ children, variant = 'default', className, ...props }, ref) => {
    const reducedMotion = shouldReduceMotion();

    const variantStyles = {
      default: 'bg-muted text-muted-foreground',
      primary: 'bg-primary text-primary-foreground',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-white',
      danger: 'bg-red-500 text-white',
    };

    return (
      <motion.span
        ref={ref}
        {...motionVariants.scaleIn}
        transition={reducedMotion ? { duration: 0 } : designTokens.transitions.spring}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.span>
    );
  }
);

AnimatedBadge.displayName = 'AnimatedBadge';

// ============================================
// PAGE TRANSITION WRAPPER
// ============================================

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const reducedMotion = shouldReduceMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      {...motionVariants.fadeIn}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ANIMATED ICON BUTTON
// ============================================

interface AnimatedIconButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  tooltip?: string;
}

export const AnimatedIconButton = forwardRef<HTMLButtonElement, AnimatedIconButtonProps>(
  ({ children, tooltip, className, ...props }, ref) => {
    const reducedMotion = shouldReduceMotion();

    return (
      <motion.button
        ref={ref}
        whileHover={reducedMotion ? undefined : { scale: 1.1, rotate: 3 }}
        whileTap={reducedMotion ? undefined : designTokens.tap.button}
        transition={designTokens.transitions.spring}
        title={tooltip}
        className={cn(
          'p-2 rounded-lg hover:bg-muted transition-colors',
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

AnimatedIconButton.displayName = 'AnimatedIconButton';

// ============================================
// ANIMATED LIST
// ============================================

interface AnimatedListProps extends HTMLMotionProps<'ul'> {
  children: React.ReactNode;
}

export const AnimatedList = forwardRef<HTMLUListElement, AnimatedListProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.ul
        ref={ref}
        variants={motionVariants.staggerContainer}
        initial="hidden"
        animate="visible"
        className={className}
        {...props}
      >
        {children}
      </motion.ul>
    );
  }
);

AnimatedList.displayName = 'AnimatedList';

// ============================================
// ANIMATED LIST ITEM
// ============================================

interface AnimatedListItemProps extends HTMLMotionProps<'li'> {
  children: React.ReactNode;
}

export const AnimatedListItem = forwardRef<HTMLLIElement, AnimatedListItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.li
        ref={ref}
        variants={motionVariants.staggerItem}
        className={className}
        {...props}
      >
        {children}
      </motion.li>
    );
  }
);

AnimatedListItem.displayName = 'AnimatedListItem';

// ============================================
// SKELETON LOADER
// ============================================

interface SkeletonProps extends HTMLMotionProps<'div'> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ width, height, circle, className, ...props }, ref) => {
    const reducedMotion = shouldReduceMotion();

    return (
      <motion.div
        ref={ref}
        {...motionVariants.fadeIn}
        transition={reducedMotion ? { duration: 0 } : designTokens.transitions.smooth}
        className={cn(
          'skeleton bg-muted animate-pulse',
          circle && 'rounded-full',
          className
        )}
        style={{ width, height }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
