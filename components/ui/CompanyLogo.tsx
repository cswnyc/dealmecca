'use client';

import { Building2 } from 'lucide-react';

interface CompanyLogoProps {
  logoUrl?: string | null;
  companyName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
  rounded?: boolean;
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6', 
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const iconSizes = {
  xs: 'w-2 h-2',
  sm: 'w-3 h-3',
  md: 'w-4 h-4', 
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

export function CompanyLogo({
  logoUrl,
  companyName,
  size = 'md',
  className = '',
  showFallback = true,
  rounded = true
}: CompanyLogoProps) {
  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];
  const roundedClass = rounded ? (size === 'xs' || size === 'sm' ? 'rounded' : 'rounded-lg') : '';
  
  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={`${companyName} logo`}
        className={`${sizeClass} ${roundedClass} object-cover border border-gray-200 ${className}`}
      />
    );
  }

  if (!showFallback) {
    return null;
  }

  // Fallback with company initial or building icon
  const initial = companyName?.charAt(0)?.toUpperCase() || 'C';
  
  return (
    <div className={`${sizeClass} ${roundedClass} bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center ${className}`}>
      {size === 'xs' || size === 'sm' ? (
        <Building2 className={`${iconSize} text-blue-600`} />
      ) : (
        <span className={`font-semibold text-blue-600 ${
          size === 'xl' ? 'text-2xl' : 
          size === 'lg' ? 'text-lg' : 
          size === 'md' ? 'text-sm' : 'text-xs'
        }`}>
          {initial}
        </span>
      )}
    </div>
  );
}

export default CompanyLogo;
