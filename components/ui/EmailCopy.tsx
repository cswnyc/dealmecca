'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './button';

interface EmailCopyProps {
  email: string;
  variant?: 'default' | 'inline';
  className?: string;
}

export function EmailCopy({ email, variant = 'default', className = '' }: EmailCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  if (variant === 'inline') {
    return (
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors group ${className}`}
        title="Click to copy email"
      >
        <span>{email}</span>
        {copied ? (
          <Check className="w-3 h-3 text-green-600" />
        ) : (
          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={`gap-2 ${className}`}
      title="Click to copy email"
    >
      <span className="font-mono text-sm">{email}</span>
      {copied ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  );
}
