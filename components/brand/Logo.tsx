'use client';

import { brandConfig } from '@/lib/brand-config';
import { DiamondIconDetailed } from '@/components/ui/diamond-icon';

interface LogoProps {
  variant?: 'default' | 'white' | 'dark' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Logo({ 
  variant = 'default', 
  size = 'md', 
  showTagline = false,
  className = '',
  onClick
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl', 
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl'
  };

  const taglineSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl'
  };

  const getLogoColorClasses = () => {
    switch (variant) {
      case 'white':
        return 'text-white';
      case 'dark':
        return 'text-neutral-900';
      case 'gradient':
        return 'bg-gradient-primary bg-clip-text text-transparent';
      default:
        return 'text-primary';
    }
  };

  const getTaglineColorClasses = () => {
    switch (variant) {
      case 'white':
        return 'text-white/80';
      case 'dark':
        return 'text-neutral-600';
      case 'gradient':
        return 'text-neutral-600';
      default:
        return 'text-secondary';
    }
  };

  const logoElement = (
    <div className={`flex flex-col ${className}`}>
      <div
        className={`
          font-headline font-semibold tracking-normal
          ${sizeClasses[size]}
          ${getLogoColorClasses()}
          ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}
        `}
        onClick={onClick}
      >
        {brandConfig.name}
      </div>
      {showTagline && (
        <div className={`
          font-body font-medium mt-1 leading-tight
          ${taglineSizeClasses[size]} 
          ${getTaglineColorClasses()}
        `}>
          {brandConfig.taglines.primary}
        </div>
      )}
    </div>
  );

  return logoElement;
}

// Logo with icon variant
interface LogoWithIconProps extends LogoProps {
  showIcon?: boolean;
  iconPosition?: 'left' | 'top';
}

export function LogoWithIcon({
  showIcon = true,
  iconPosition = 'left',
  ...props
}: LogoWithIconProps) {
  const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  const getIconColorClasses = () => {
    switch (props.variant) {
      case 'white':
        return 'text-white';
      case 'dark':
        return 'text-neutral-900';
      case 'gradient':
        return 'text-secondary';
      default:
        return 'text-secondary';
    }
  };

  const Icon = () => {
    // Make diamond bigger than the text - increase size significantly
    const iconSize = {
      sm: 24,    // was 16
      md: 32,    // was 20
      lg: 40,    // was 24
      xl: 48,    // was 28
      '2xl': 56  // was 32
    }[props.size || 'md'];

    return (
      <div className={`
        flex items-center justify-center
        ${props.size === 'sm' ? 'w-6 h-6' :
          props.size === 'md' ? 'w-8 h-8' :
          props.size === 'lg' ? 'w-10 h-10' :
          props.size === 'xl' ? 'w-12 h-12' : 'w-16 h-16'}
      `}>
        <DiamondIconDetailed
          size={iconSize}
          strokeWidth={1.5}
          animated={true}
          className="drop-shadow-sm"
        />
      </div>
    );
  };

  if (!showIcon) {
    return <Logo {...props} />;
  }

  return (
    <div className={`
      flex items-center gap-3
      ${iconPosition === 'top' ? 'flex-col gap-2' : 'flex-row'}
      ${props.className}
    `}>
      <Icon />
      <Logo {...props} className="" />
    </div>
  );
}

// Compact logo for mobile/tight spaces
export function LogoCompact({ 
  variant = 'default',
  size = 'md',
  className = '',
  onClick
}: Pick<LogoProps, 'variant' | 'size' | 'className' | 'onClick'>) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl'
  };

  const getColorClasses = () => {
    switch (variant) {
      case 'white':
        return 'text-white';
      case 'dark':
        return 'text-neutral-900';
      case 'gradient':
        return 'bg-gradient-primary bg-clip-text text-transparent';
      default:
        return 'text-primary';
    }
  };

  return (
    <div
      className={`
        font-headline font-semibold tracking-normal
        ${sizeClasses[size]}
        ${getColorClasses()}
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      DM
    </div>
  );
} 