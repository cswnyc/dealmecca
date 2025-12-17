import React from 'react';

import { cn } from '@/lib/utils';

interface FlkTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const FlkTextarea = React.forwardRef<HTMLTextAreaElement, FlkTextareaProps>(
  ({ label, helperText, error, className, id, rows = 4, ...props }, ref): JSX.Element => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label ? (
          <label className="block text-flk-body-s font-medium text-flk-text-primary mb-2" htmlFor={textareaId}>
            {label}
          </label>
        ) : null}
        
        <textarea
          className={cn(
            'w-full rounded-flk-md border border-flk-border-subtle bg-flk-surface px-[14px] py-3 text-flk-body-m text-flk-text-primary placeholder:text-flk-text-muted resize-none',
            'focus:outline-none focus:ring-4 focus:ring-[rgba(37,117,252,0.20)] dark:focus:ring-[rgba(91,141,255,0.22)] focus:border-flk-primary',
            error ? 'border-flk-status-danger focus:ring-[rgba(239,68,68,0.20)]' : '',
            className,
          )}
          id={textareaId}
          ref={ref}
          rows={rows}
          {...props}
        />
        
        {error ? (
          <p className="mt-2 text-flk-caption text-flk-status-danger">{error}</p>
        ) : helperText ? (
          <p className="mt-2 text-flk-caption text-flk-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

FlkTextarea.displayName = 'FlkTextarea';
