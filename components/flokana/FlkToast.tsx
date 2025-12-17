'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils';

type FlkToastVariant = 'info' | 'success' | 'warning' | 'danger';

interface FlkToastProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: FlkToastVariant;
  title: string;
  description?: string;
  duration?: number;
  className?: string;
}

const VARIANT_CONFIG: Record<FlkToastVariant, { icon: React.ComponentType<{ className?: string }> }> = {
  info: { icon: Info },
  success: { icon: CheckCircle2 },
  warning: { icon: AlertTriangle },
  danger: { icon: AlertCircle },
};

export function FlkToast({
  isOpen,
  onClose,
  variant = 'success',
  title,
  description,
  duration = 3000,
  className,
}: FlkToastProps): JSX.Element | null {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, duration, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={cn('fixed bottom-6 right-6 z-50 min-w-[320px] rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-4 shadow-flk-floating dark:shadow-flk-floating-dark', className)}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-[2px] text-flk-primary" />
        <div className="flex-1">
          <div className="text-flk-body-m font-semibold text-flk-text-primary">{title}</div>
          {description ? <div className="mt-1 text-flk-body-s text-flk-text-secondary">{description}</div> : null}
        </div>
        <button
          aria-label="Close notification"
          className="text-flk-text-muted hover:text-flk-text-primary"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
