import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

import { cn } from '@/lib/utils';

type FlkAlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface FlkAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: FlkAlertVariant;
  title?: string;
  children: React.ReactNode;
}

const VARIANT_CONFIG: Record<FlkAlertVariant, { bg: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Info,
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: CheckCircle2,
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: AlertTriangle,
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: AlertCircle,
  },
};

export function FlkAlert({ variant = 'info', title, className, children, ...props }: FlkAlertProps): JSX.Element {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;
  
  return (
    <div
      className={cn('rounded-flk-md border p-4 flex items-start gap-3', config.bg, config.border, className)}
      {...props}
    >
      <Icon className="h-5 w-5 mt-[2px] flex-shrink-0" />
      <div className="flex-1">
        {title ? (
          <div className="font-semibold text-flk-text-primary mb-1">{title}</div>
        ) : null}
        <div className="text-flk-body-s text-flk-text-secondary">{children}</div>
      </div>
    </div>
  );
}
