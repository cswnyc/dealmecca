'use client';

import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyLogoProps {
  logoUrl?: string | null;
  companyName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: boolean;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6', 
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const iconSizeClasses = {
  xs: 'w-2 h-2',
  sm: 'w-3 h-3',
  md: 'w-4 h-4', 
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
};

export function CompanyLogo({ 
  logoUrl, 
  companyName, 
  size = 'md',
  className = '',
  rounded = true,
  fallbackIcon: FallbackIcon = Building2
}: CompanyLogoProps) {
  const sizeClass = sizeClasses[size];
  const iconSizeClass = iconSizeClasses[size];
  const roundedClass = rounded ? (size === 'xs' || size === 'sm' ? 'rounded' : 'rounded-lg') : '';

  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={`${companyName} logo`}
        className={cn(
          sizeClass,
          roundedClass,
          'object-cover border border-border',
          className
        )}
      />
    );
  }

  return (
    <div 
      className={cn(
        sizeClass,
        roundedClass,
        'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center',
        className
      )}
    >
      <FallbackIcon className={cn(iconSizeClass, 'text-blue-600')} />
    </div>
  );
}

export default CompanyLogo;