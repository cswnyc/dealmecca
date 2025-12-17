import React from 'react';

import { cn } from '@/lib/utils';

type FlkBadgeVariant = 'neutral' | 'primary' | 'outline' | 'success' | 'warning' | 'danger';

interface FlkBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: FlkBadgeVariant;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<FlkBadgeVariant, string> = {
  neutral: 'bg-flk-surface-subtle text-flk-text-muted',
  primary: 'bg-flk-primary-soft-bg text-flk-primary-soft-text',
  outline: 'bg-transparent border border-flk-border-subtle text-flk-text-muted',
  success: 'bg-flk-primary-soft-bg text-flk-status-success',
  warning: 'bg-flk-primary-soft-bg text-flk-status-warning',
  danger: 'bg-flk-primary-soft-bg text-flk-status-danger',
};

export function FlkBadge({ variant = 'neutral', className, children, ...props }: FlkBadgeProps): JSX.Element {
  const baseClasses = 'inline-flex items-center rounded-flk-pill px-[10px] py-[6px] text-flk-caption font-medium uppercase tracking-[0.08em]';
  
  return (
    <span className={cn(baseClasses, VARIANT_CLASSES[variant], className)} {...props}>
      {children}
    </span>
  );
}
