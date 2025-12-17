import React from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

type FlkButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
type FlkButtonSize = 'sm' | 'md' | 'lg';

interface FlkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FlkButtonVariant;
  size?: FlkButtonSize;
  href?: string;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<FlkButtonVariant, string> = {
  primary: 'bg-flk-primary text-flk-text-inverse hover:bg-flk-primary-hover active:bg-flk-primary-active shadow-flk-card dark:shadow-flk-card-dark',
  secondary: 'bg-flk-surface text-flk-text-primary border border-flk-border-subtle hover:bg-flk-surface-subtle',
  outline: 'bg-transparent text-flk-text-primary border border-flk-border-strong hover:bg-flk-primary-soft-bg hover:text-flk-primary-soft-text',
  ghost: 'bg-transparent text-flk-text-primary hover:bg-flk-surface-subtle',
  link: 'bg-transparent text-flk-primary hover:underline',
};

const SIZE_CLASSES: Record<FlkButtonSize, string> = {
  sm: 'h-[36px] px-[14px] text-flk-body-s',
  md: 'h-[44px] px-[18px] text-flk-body-m',
  lg: 'h-[52px] px-[22px] text-flk-body-l',
};

export function FlkButton({
  variant = 'primary',
  size = 'md',
  href,
  className,
  children,
  type = 'button',
  ...props
}: FlkButtonProps): JSX.Element {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-flk-pill transition-all';
  const classes = cn(baseClasses, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className);

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
