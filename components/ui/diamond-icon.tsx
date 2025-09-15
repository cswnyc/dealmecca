'use client';

interface DiamondIconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  filled?: boolean;
}

export function DiamondIcon({
  className = '',
  size = 24,
  strokeWidth = 1.5,
  filled = false
}: DiamondIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Diamond outline */}
      <path d="M6 3h12l3 5-9 13L3 8l3-5z" />

      {/* Inner diamond facets for detail */}
      <path d="M6 3l3 5-9 0" />
      <path d="M18 3l-3 5 9 0" />
      <path d="M9 8l3 13" />
      <path d="M15 8l-3 13" />
      <path d="M6 8h12" />
    </svg>
  );
}

export function DiamondIconOutline({
  className = '',
  size = 24,
  strokeWidth = 1.5
}: DiamondIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Simplified diamond outline similar to logo */}
      <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
      <path d="M6 9h12" />
      <path d="M9 3l3 6" />
      <path d="M15 3l-3 6" />
    </svg>
  );
}

export function DiamondIconMinimal({
  className = '',
  size = 24,
  strokeWidth = 2
}: DiamondIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Very clean minimal diamond */}
      <path d="M6 3h12l3 6-9 12L3 9l3-6z" />
      <path d="M6 9h12" />
    </svg>
  );
}

export function DiamondIconDetailed({
  className = '',
  size = 24,
  strokeWidth = 1.5,
  animated = false
}: DiamondIconProps & { animated?: boolean }) {
  const gradientId = `diamond-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="50%" x2="100%" y2="50%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#40E0D0">
            {animated && (
              <animate
                attributeName="stop-color"
                values="#40E0D0;#FF8C00;#8A2BE2;#40E0D0"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="50%" stopColor="#FF8C00">
            {animated && (
              <animate
                attributeName="stop-color"
                values="#FF8C00;#8A2BE2;#40E0D0;#FF8C00"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="100%" stopColor="#8A2BE2">
            {animated && (
              <animate
                attributeName="stop-color"
                values="#8A2BE2;#40E0D0;#FF8C00;#8A2BE2"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          {animated && (
            <animateTransform
              attributeName="gradientTransform"
              attributeType="XML"
              type="rotate"
              values="0 12 12;360 12 12;0 12 12"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </linearGradient>
      </defs>

      {/* Main diamond outline */}
      <path
        d="M6 3h12l3 5-9 13L3 8l3-5z"
        stroke={animated ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Top table facets - crown lines */}
      <path
        d="M6 3l3 5"
        stroke={animated ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M9 3l0 5"
        stroke={animated ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M15 3l0 5"
        stroke={animated ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M18 3l-3 5"
        stroke={animated ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Cross crown facets */}
      <path
        d="M9 3l6 5"
        stroke={animated ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M15 3l-6 5"
        stroke={animated ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Horizontal girdle line */}
      <path
        d="M3 8h18"
        stroke={animated ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidth * 0.8}
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Pavilion facets - bottom section */}
      <path
        d="M3 8l9 13"
        stroke={animated ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M8 8l4 13"
        stroke={animated ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M16 8l-4 13"
        stroke={animated ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M21 8l-9 13"
        stroke={animated ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}