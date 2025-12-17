'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface FlkModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function FlkModal({ isOpen, onClose, title, children, footer, className }: FlkModalProps): JSX.Element | null {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 dark:bg-black/55">
      <div className={cn('w-full max-w-[520px] rounded-flk-lg border border-flk-border-subtle bg-flk-surface p-6 shadow-flk-floating dark:shadow-flk-floating-dark', className)}>
        {title ? (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-flk-h3 font-bold">{title}</h3>
            <button
              aria-label="Close modal"
              className="flex h-8 w-8 items-center justify-center rounded-flk-sm hover:bg-flk-surface-subtle"
              onClick={onClose}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : null}
        
        <div className="text-flk-body-m text-flk-text-secondary">{children}</div>
        
        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>
  );
}
