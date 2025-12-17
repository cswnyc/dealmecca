'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Show only the logomark (no text) */
  iconOnly?: boolean;
  /** Use dark mode colors */
  dark?: boolean;
  /** Enable gradient animation */
  animated?: boolean;
  /** Additional className */
  className?: string;
}

const sizes = {
  xs: { icon: 16, text: 'text-sm', gap: 'gap-1' },
  sm: { icon: 20, text: 'text-base', gap: 'gap-1' },
  md: { icon: 32, text: 'text-xl', gap: 'gap-1.5' },
  lg: { icon: 40, text: 'text-2xl', gap: 'gap-2' },
  xl: { icon: 48, text: 'text-3xl', gap: 'gap-2' },
};

export function Logo({ size = 'md', iconOnly = false, dark = false, animated = true, className }: LogoProps) {
  const { icon, text, gap } = sizes[size];

  // Gradient colors based on theme
  const gradientStart = dark ? '#5B8DFF' : '#2575FC';
  const gradientEnd = dark ? '#A78BFA' : '#8B5CF6';
  const textColor = dark ? '#EAF0FF' : '#162B54';
  const accentColor = dark ? '#5B8DFF' : '#2575FC';

  // Unique gradient ID to avoid conflicts when multiple logos are on the page
  const gradientId = `logo-gradient-${dark ? 'dark' : 'light'}-${size}`;

  return (
    <div className={cn('flex items-center', gap, className)}>
      {/* Logomark */}
      <svg
        viewBox="0 0 100 100"
        width={icon}
        height={icon}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStart}>
              {animated && (
                <animate
                  attributeName="stop-color"
                  values={dark ? '#5B8DFF;#A78BFA;#5B8DFF' : '#2575FC;#8B5CF6;#2575FC'}
                  dur="3s"
                  repeatCount="indefinite"
                />
              )}
            </stop>
            <stop offset="100%" stopColor={gradientEnd}>
              {animated && (
                <animate
                  attributeName="stop-color"
                  values={dark ? '#A78BFA;#5B8DFF;#A78BFA' : '#8B5CF6;#2575FC;#8B5CF6'}
                  dur="3s"
                  repeatCount="indefinite"
                />
              )}
            </stop>
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={size === 'xs' ? 6 : size === 'sm' ? 5 : 4}
          strokeDasharray="8 4"
        >
          {animated && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="10s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <circle
          cx="50"
          cy="50"
          r="22"
          fill={`url(#${gradientId})`}
        />
        <text
          x="50"
          y="58"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="24"
          fill="white"
          textAnchor="middle"
          fontWeight="800"
        >
          M
        </text>
      </svg>

      {/* Wordmark */}
      {!iconOnly && (
        <span
          className={cn('font-bold font-display', text)}
          style={{ color: textColor }}
        >
          Deal
          <span
            style={{
              backgroundImage: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Mecca
          </span>
        </span>
      )}
    </div>
  );
}

/** Standalone logomark for favicons, app icons, etc. */
export function LogoMark({
  size = 32,
  dark = false,
  animated = true,
  className
}: {
  size?: number;
  dark?: boolean;
  animated?: boolean;
  className?: string;
}) {
  const gradientStart = dark ? '#5B8DFF' : '#2575FC';
  const gradientEnd = dark ? '#A78BFA' : '#8B5CF6';
  const gradientId = `logomark-gradient-${dark ? 'dark' : 'light'}-${size}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-label="DealMecca"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradientStart}>
            {animated && (
              <animate
                attributeName="stop-color"
                values={dark ? '#5B8DFF;#A78BFA;#5B8DFF' : '#2575FC;#8B5CF6;#2575FC'}
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="100%" stopColor={gradientEnd}>
            {animated && (
              <animate
                attributeName="stop-color"
                values={dark ? '#A78BFA;#5B8DFF;#A78BFA' : '#8B5CF6;#2575FC;#8B5CF6'}
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </stop>
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        strokeDasharray="8 4"
      >
        {animated && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="10s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle
        cx="50"
        cy="50"
        r="22"
        fill={`url(#${gradientId})`}
      />
      <text
        x="50"
        y="58"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="24"
        fill="white"
        textAnchor="middle"
        fontWeight="800"
      >
        M
      </text>
    </svg>
  );
}

/** Monochrome logomark for single-color contexts */
export function LogoMarkMono({ 
  size = 32, 
  color = '#162B54',
  className 
}: { 
  size?: number; 
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-label="DealMecca"
    >
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke={color}
        strokeWidth="4"
      />
      <circle
        cx="50"
        cy="50"
        r="22"
        fill={color}
      />
      <text
        x="50"
        y="58"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="24"
        fill={color === '#FFFFFF' || color === 'white' ? '#2575FC' : 'white'}
        textAnchor="middle"
        fontWeight="800"
      >
        M
      </text>
    </svg>
  );
}

export default Logo;
