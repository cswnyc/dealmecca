import React from 'react';

import { cn } from '@/lib/utils';

interface FlkSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
}

export const FlkSelect = React.forwardRef<HTMLSelectElement, FlkSelectProps>(
  ({ label, helperText, error, className, id, children, ...props }, ref): JSX.Element => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label ? (
          <label className="block text-flk-body-s font-medium text-flk-text-primary mb-2" htmlFor={selectId}>
            {label}
          </label>
        ) : null}
        
        <select
          className={cn(
            'h-[44px] w-full rounded-flk-md border border-flk-border-subtle bg-flk-surface px-[14px] text-flk-body-m text-flk-text-primary',
            'focus:outline-none focus:ring-4 focus:ring-[rgba(37,117,252,0.20)] dark:focus:ring-[rgba(91,141,255,0.22)] focus:border-flk-primary',
            error ? 'border-flk-status-danger focus:ring-[rgba(239,68,68,0.20)]' : '',
            className,
          )}
          id={selectId}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        
        {error ? (
          <p className="mt-2 text-flk-caption text-flk-status-danger">{error}</p>
        ) : helperText ? (
          <p className="mt-2 text-flk-caption text-flk-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

FlkSelect.displayName = 'FlkSelect';
