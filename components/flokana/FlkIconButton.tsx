import React from 'react';

import { cn } from '@/lib/utils';

type FlkIconButtonVariant = 'ghost' | 'soft';
type FlkIconButtonSize = 'sm' | 'md';

interface FlkIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FlkIconButtonVariant;
  size?: FlkIconButtonSize;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<FlkIconButtonVariant, string> = {
  ghost: 'bg-transparent hover:bg-flk-surface-subtle',
  soft: 'bg-flk-surface-subtle border border-flk-border-subtle hover:bg-flk-border-subtle',
};

const SIZE_CLASSES: Record<FlkIconButtonSize, string> = {
  sm: 'h-[32px] w-[32px] rounded-flk-sm',
  md: 'h-[40px] w-[40px] rounded-flk-md',
};

export function FlkIconButton({
  variant = 'ghost',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: FlkIconButtonProps): JSX.Element {
  const baseClasses = 'inline-flex items-center justify-center transition-all';
  const classes = cn(baseClasses, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className);

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
