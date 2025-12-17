import React from 'react';

import { cn } from '@/lib/utils';

interface FlkCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  children: React.ReactNode;
}

interface FlkCardSubComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FlkCard({ hover = false, className, children, ...props }: FlkCardProps): JSX.Element {
  const baseClasses = 'rounded-flk-lg border border-flk-border-subtle bg-flk-surface shadow-flk-card dark:shadow-flk-card-dark';
  const hoverClasses = hover ? 'transition-all hover:-translate-y-[2px] hover:shadow-flk-card-hover dark:hover:shadow-flk-card-hover-dark' : '';
  
  return (
    <div className={cn(baseClasses, hoverClasses, className)} {...props}>
      {children}
    </div>
  );
}

export function FlkCardHeader({ className, children, ...props }: FlkCardSubComponentProps): JSX.Element {
  return (
    <div className={cn('p-6 pb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function FlkCardContent({ className, children, ...props }: FlkCardSubComponentProps): JSX.Element {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function FlkCardFooter({ className, children, ...props }: FlkCardSubComponentProps): JSX.Element {
  return (
    <div className={cn('p-6 pt-4', className)} {...props}>
      {children}
    </div>
  );
}

export function FlkCardTitle({ className, children, ...props }: FlkCardSubComponentProps): JSX.Element {
  return (
    <h3 className={cn('text-[16px] font-semibold tracking-[-0.01em] text-flk-text-primary', className)} {...props}>
      {children}
    </h3>
  );
}

export function FlkCardDescription({ className, children, ...props }: FlkCardSubComponentProps): JSX.Element {
  return (
    <p className={cn('text-flk-body-s text-flk-text-muted', className)} {...props}>
      {children}
    </p>
  );
}
