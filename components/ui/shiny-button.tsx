'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ShinyButtonProps = 
  | ({
      children: React.ReactNode;
      href: string;
      className?: string;
    } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'>)
  | ({
      children: React.ReactNode;
      href?: never;
      className?: string;
    } & React.ButtonHTMLAttributes<HTMLButtonElement>);

export function ShinyButton({ children, href, className = '', ...props }: ShinyButtonProps): JSX.Element {
  const content = (
    <>
      <div className="shimmer" />
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn('shiny-cta', className)} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </Link>
    );
  }

  return (
    <button className={cn('shiny-cta', className)} type="button" {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
}
