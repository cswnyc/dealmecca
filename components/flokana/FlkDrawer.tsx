'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface FlkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function FlkDrawer({ isOpen, onClose, title, children, className }: FlkDrawerProps): JSX.Element | null {
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
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close drawer overlay"
        className="absolute inset-0 bg-black/35 dark:bg-black/55"
        onClick={onClose}
        type="button"
      />
      <div className={cn('absolute right-0 top-0 h-full w-full max-w-[420px] border-l border-flk-border-subtle bg-flk-surface p-6 shadow-flk-floating dark:shadow-flk-floating-dark overflow-y-auto', className)}>
        <div className="flex items-center justify-between mb-6">
          {title ? <h3 className="text-flk-h3 font-bold">{title}</h3> : <div />}
          <button
            aria-label="Close drawer"
            className="flex h-10 w-10 items-center justify-center rounded-flk-md hover:bg-flk-surface-subtle"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
