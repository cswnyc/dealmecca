'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * PageFrame - Reusable layout pattern for in-app pages
 * 
 * Provides consistent structure with:
 * - Page header (title, description, actions)
 * - Optional filter/toolbar area
 * - Content area with proper spacing
 * - All using design system tokens and components
 * 
 * @example
 * <PageFrame
 *   title="Forum"
 *   description="Connect and share with the community"
 *   actions={<Button>New Post</Button>}
 * >
 *   <PageContent>{content}</PageContent>
 * </PageFrame>
 */

interface PageFrameProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
}

export function PageFrame({ children, className, maxWidth = '7xl' }: PageFrameProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn('min-h-full bg-background', className)}>
      <div className={cn('mx-auto px-4 sm:px-6 lg:px-8 py-8', maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">{title}</h1>
          {description && (
            <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

interface PageToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function PageToolbar({ children, className }: PageToolbarProps) {
  return (
    <div className={cn('mb-6', className)}>
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  );
}

interface PageSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function PageSection({ title, description, children, className, actions }: PageSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description || actions) && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && (
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

interface PageGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function PageGrid({ children, columns = 1, className }: PageGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('grid gap-6', gridClasses[columns], className)}>
      {children}
    </div>
  );
}

interface PageCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function PageCard({ children, className, hover = false }: PageCardProps) {
  return (
    <Card 
      className={cn(
        'border-border shadow-sm',
        hover && 'transition-all duration-200 hover:shadow-md hover:border-border/80',
        className
      )}
    >
      {children}
    </Card>
  );
}


