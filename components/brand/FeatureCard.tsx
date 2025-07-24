import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
  layout?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  highlight = false,
  layout = 'vertical',
  size = 'md',
  className = '',
  onClick
}: FeatureCardProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-10';
      default:
        return 'p-6';
    }
  };

  const getIconSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-10 h-10';
      case 'lg':
        return 'w-20 h-20';
      default:
        return 'w-12 h-12';
    }
  };

  const getTitleClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-lg font-semibold';
      case 'lg':
        return 'text-2xl font-bold';
      default:
        return 'text-xl font-semibold';
    }
  };

  const getDescriptionClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const baseClasses = `
    rounded-xl border transition-all duration-300 hover:shadow-premium-lg
    ${highlight 
      ? 'card-highlight text-white border-transparent' 
      : 'card-premium border-neutral-200 hover:border-secondary'
    }
    ${getSizeClasses()}
    ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
    ${className}
  `;

  const iconContainerClasses = `
    ${getIconSizeClasses()}
    rounded-xl flex items-center justify-center mb-4
    ${highlight ? 'bg-white/20' : 'bg-secondary/10'}
    ${layout === 'horizontal' ? 'flex-shrink-0' : 'mx-auto'}
  `;

  const contentClasses = `
    ${layout === 'horizontal' ? 'flex-1' : 'text-center'}
  `;

  const titleClasses = `
    font-headline mb-3
    ${getTitleClasses()}
    ${highlight ? 'text-white' : 'text-primary'}
  `;

  const descriptionClasses = `
    font-body leading-relaxed
    ${getDescriptionClasses()}
    ${highlight ? 'text-white/90' : 'text-neutral-600'}
  `;

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
    >
      <div className={layout === 'horizontal' ? 'flex items-start gap-4' : ''}>
        <div className={iconContainerClasses}>
          {icon}
        </div>
        <div className={contentClasses}>
          <h3 className={titleClasses}>
            {title}
          </h3>
          <p className={descriptionClasses}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

// Premium feature card with metrics
interface FeatureCardWithMetricsProps extends Omit<FeatureCardProps, 'description'> {
  description: string;
  metrics?: {
    value: string;
    label: string;
    improvement?: string;
  }[];
}

export function FeatureCardWithMetrics({
  icon,
  title,
  description,
  metrics = [],
  highlight = false,
  size = 'md',
  className = '',
  onClick
}: FeatureCardWithMetricsProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-10';
      default:
        return 'p-6';
    }
  };

  const getIconSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-10 h-10';
      case 'lg':
        return 'w-20 h-20';
      default:
        return 'w-12 h-12';
    }
  };

  const baseClasses = `
    rounded-xl border transition-all duration-300 hover:shadow-premium-lg
    ${highlight 
      ? 'card-highlight text-white border-transparent' 
      : 'card-premium border-neutral-200 hover:border-secondary'
    }
    ${getSizeClasses()}
    ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
    ${className}
  `;

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
    >
      <div className="text-center">
        <div className={`
          ${getIconSizeClasses()}
          rounded-xl flex items-center justify-center mx-auto mb-4
          ${highlight ? 'bg-white/20' : 'bg-secondary/10'}
        `}>
          {icon}
        </div>
        
        <h3 className={`
          font-headline font-semibold text-xl mb-3
          ${highlight ? 'text-white' : 'text-primary'}
        `}>
          {title}
        </h3>
        
        <p className={`
          font-body text-base leading-relaxed mb-6
          ${highlight ? 'text-white/90' : 'text-neutral-600'}
        `}>
          {description}
        </p>

        {metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-opacity-20">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className={`
                  text-2xl font-bold font-headline mb-1
                  ${highlight ? 'text-white' : 'text-secondary'}
                `}>
                  {metric.value}
                  {metric.improvement && (
                    <span className={`
                      text-sm ml-1
                      ${highlight ? 'text-white/80' : 'text-accent'}
                    `}>
                      {metric.improvement}
                    </span>
                  )}
                </div>
                <div className={`
                  text-sm font-body
                  ${highlight ? 'text-white/80' : 'text-neutral-500'}
                `}>
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact feature card for dense layouts
export function FeatureCardCompact({
  icon,
  title,
  description,
  highlight = false,
  className = '',
  onClick
}: Omit<FeatureCardProps, 'layout' | 'size'>) {
  const baseClasses = `
    p-4 rounded-lg border transition-all duration-300 hover:shadow-lg
    ${highlight 
      ? 'bg-gradient-accent text-white border-transparent' 
      : 'bg-white border-neutral-200 hover:border-secondary'
    }
    ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
    ${className}
  `;

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
          ${highlight ? 'bg-white/20' : 'bg-secondary/10'}
        `}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className={`
            font-headline font-medium text-base mb-1
            ${highlight ? 'text-white' : 'text-primary'}
          `}>
            {title}
          </h4>
          <p className={`
            font-body text-sm leading-relaxed
            ${highlight ? 'text-white/90' : 'text-neutral-600'}
          `}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

// Feature card with action button
interface FeatureCardWithActionProps extends FeatureCardProps {
  actionLabel: string;
  actionVariant?: 'primary' | 'secondary' | 'accent';
  onActionClick?: () => void;
}

export function FeatureCardWithAction({
  icon,
  title,
  description,
  actionLabel,
  actionVariant = 'primary',
  onActionClick,
  highlight = false,
  size = 'md',
  className = '',
}: FeatureCardWithActionProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-10';
      default:
        return 'p-6';
    }
  };

  const getActionClasses = () => {
    if (highlight) {
      return 'btn-outline-secondary bg-white/10 border-white/30 hover:bg-white hover:text-primary';
    }
    
    switch (actionVariant) {
      case 'secondary':
        return 'btn-secondary';
      case 'accent':
        return 'btn-accent';
      default:
        return 'btn-primary';
    }
  };

  const baseClasses = `
    rounded-xl border transition-all duration-300 hover:shadow-premium-lg
    ${highlight 
      ? 'card-highlight text-white border-transparent' 
      : 'card-premium border-neutral-200 hover:border-secondary'
    }
    ${getSizeClasses()}
    ${className}
  `;

  return (
    <div className={baseClasses}>
      <div className="text-center">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4
          ${highlight ? 'bg-white/20' : 'bg-secondary/10'}
        `}>
          {icon}
        </div>
        
        <h3 className={`
          font-headline font-semibold text-xl mb-3
          ${highlight ? 'text-white' : 'text-primary'}
        `}>
          {title}
        </h3>
        
        <p className={`
          font-body text-base leading-relaxed mb-6
          ${highlight ? 'text-white/90' : 'text-neutral-600'}
        `}>
          {description}
        </p>

        <button
          onClick={onActionClick}
          className={`${getActionClasses()} w-full`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
} 