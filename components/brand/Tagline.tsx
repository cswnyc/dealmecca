import React from 'react';
import { brandConfig } from '@/lib/brand-config';

interface TaglineProps {
  variant?: 'primary' | 'secondary' | 'alternative' | 'full' | 'random';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: 'default' | 'gradient' | 'accent' | 'muted';
  animated?: boolean;
  prefix?: string;
  suffix?: string;
}

export function Tagline({ 
  variant = 'primary', 
  className = '',
  size = 'md',
  style = 'default',
  animated = false,
  prefix = '',
  suffix = ''
}: TaglineProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const getStyleClasses = () => {
    switch (style) {
      case 'gradient':
        return 'bg-gradient-primary bg-clip-text text-transparent font-semibold';
      case 'accent':
        return 'text-accent font-semibold';
      case 'muted':
        return 'text-neutral-500 font-medium';
      default:
        return 'text-secondary font-medium';
    }
  };

  const getTaglineText = () => {
    if (variant === 'random') {
      return brandConfig.taglines.options[Math.floor(Math.random() * brandConfig.taglines.options.length)];
    }
    return brandConfig.taglines[variant];
  };

  return (
    <p className={`
      font-headline
      ${sizeClasses[size]} 
      ${getStyleClasses()}
      ${animated ? 'animate-fade-in' : ''}
      ${className}
    `}>
      {prefix}{getTaglineText()}{suffix}
    </p>
  );
}

// Hero tagline with special styling
export function TaglineHero({ 
  variant = 'primary',
  className = '',
  animated = true,
  showEmphasis = true
}: Pick<TaglineProps, 'variant' | 'className' | 'animated'> & { showEmphasis?: boolean }) {
  const getTaglineText = () => {
    if (variant === 'random') {
      return brandConfig.taglines.options[Math.floor(Math.random() * brandConfig.taglines.options.length)];
    }
    return brandConfig.taglines[variant];
  };

  const taglineText = getTaglineText();

  return (
    <div className={`
      text-center
      ${animated ? 'animate-fade-in' : ''}
      ${className}
    `}>
      <p className="tagline-hero bg-gradient-accent bg-clip-text text-transparent">
        {showEmphasis && taglineText.includes('Intelligence') ? (
          <>
            <span className="font-bold">Intelligence</span>
            {taglineText.replace('Intelligence', '')}
          </>
        ) : (
          taglineText
        )}
      </p>
    </div>
  );
}

// Rotating tagline component
interface RotatingTaglineProps {
  taglines?: string[];
  interval?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: 'default' | 'gradient' | 'accent' | 'muted';
}

export function RotatingTagline({
  taglines = [...brandConfig.taglines.options],
  interval = 3000,
  className = '',
  size = 'md',
  style = 'default'
}: RotatingTaglineProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % taglines.length);
    }, interval);

    return () => clearInterval(timer);
  }, [taglines.length, interval]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const getStyleClasses = () => {
    switch (style) {
      case 'gradient':
        return 'bg-gradient-primary bg-clip-text text-transparent font-semibold';
      case 'accent':
        return 'text-accent font-semibold';
      case 'muted':
        return 'text-neutral-500 font-medium';
      default:
        return 'text-secondary font-medium';
    }
  };

  return (
    <div className={`
      font-headline
      ${sizeClasses[size]}
      ${getStyleClasses()}
      transition-all duration-500 ease-in-out
      ${className}
    `}>
      {taglines[currentIndex]}
    </div>
  );
}

// Inline tagline for use within text
export function TaglineInline({
  variant = 'primary',
  className = '',
  bold = false
}: Pick<TaglineProps, 'variant' | 'className'> & { bold?: boolean }) {
  const getTaglineText = () => {
    if (variant === 'random') {
      return brandConfig.taglines.options[Math.floor(Math.random() * brandConfig.taglines.options.length)];
    }
    return brandConfig.taglines[variant];
  };

  return (
    <span className={`
      font-headline text-secondary
      ${bold ? 'font-semibold' : 'font-medium'}
      ${className}
    `}>
      {getTaglineText()}
    </span>
  );
}

 