'use client';

import {
  getDisciplineKey,
  DISCIPLINE_LABELS,
  DISCIPLINE_HEX,
  formatEnumLabel,
  type DisciplineKey,
} from '@/lib/labels';

// SVG path data per discipline icon (from the design reference)
const DISCIPLINE_ICONS: Record<DisciplineKey, string> = {
  Media:        '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/>',
  Programmatic: '<rect x="5.5" y="5.5" width="13" height="13" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="0.8"/><path d="M9 2.5v3M15 2.5v3M9 18.5v3M15 18.5v3M2.5 9h3M2.5 15h3M18.5 9h3M18.5 15h3"/>',
  Digital:      '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/>',
  Social:       '<circle cx="12" cy="12" r="3.6"/><path d="M15.6 9.2V13a2.9 2.9 0 0 0 5.7-.7v-.3a9.3 9.3 0 1 0-3.7 7.4"/>',
  Creative:     '<path d="M12 20h8.5"/><path d="M16.5 3.6a2 2 0 0 1 2.9 2.8L7.6 18.2 3.5 19.5l1.3-4.1L16.5 3.6Z"/>',
  OOH:          '<rect x="3" y="4" width="18" height="10.5" rx="1.5"/><path d="M7 8h10M7 11h6M8.5 14.5 7.5 21M15.5 14.5 16.5 21"/>',
  PR:           '<path d="m3.5 10.5 14-4.5v12l-14-4.5v-3Z"/><path d="M11.5 15.8a3 3 0 0 1-5.6-1.3"/><path d="M17.5 9.5a3.5 3.5 0 0 1 0 5"/>',
  Production:   '<path d="M3.5 9.5h17v9a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 18.5v-9Z"/><path d="m4 9.5 1-4 16 1.2-.6 2.8M8.5 5.9 9 9.5M13 6.2l.4 3.3"/>',
};

const DEFAULT_HEX = '#64748B';

interface DisciplineChipProps {
  /** The raw duty name (e.g. "Buying", "Digital", "OOH") */
  name: string;
  /** Chip size */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'filled' | 'outline' | 'solid' | 'muted';
  /** Show the discipline icon */
  showIcon?: boolean;
  /** Make interactive (pointer cursor, hover effect) */
  interactive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

function DisciplineIcon({ disciplineKey, size }: { disciplineKey: DisciplineKey | null; size: number }) {
  const pathData = disciplineKey ? DISCIPLINE_ICONS[disciplineKey] : '';
  if (!pathData) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: pathData }}
    />
  );
}

/**
 * Consistent discipline chip used everywhere a discipline/duty appears.
 * Uses color-mix() for theme-aware backgrounds matching the design reference.
 */
export function DisciplineChip({
  name,
  size = 'sm',
  variant = 'filled',
  showIcon = true,
  interactive = false,
  onClick,
  className = '',
}: DisciplineChipProps) {
  const disciplineKey = getDisciplineKey(name);
  const label = disciplineKey
    ? DISCIPLINE_LABELS[disciplineKey]
    : formatEnumLabel(name);
  const hex = disciplineKey ? DISCIPLINE_HEX[disciplineKey] : DEFAULT_HEX;

  const sizeStyles: React.CSSProperties = size === 'sm'
    ? { fontSize: 11, padding: '3px 8px 3px 7px', gap: 5 }
    : size === 'lg'
      ? { fontSize: 13, padding: '6px 13px 6px 11px', gap: 7 }
      : { fontSize: 12, padding: '4px 10px 4px 8px', gap: 6 };

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 15 : 13;

  let chipStyles: React.CSSProperties;
  if (variant === 'solid') {
    chipStyles = {
      background: hex,
      color: '#fff',
      borderColor: 'transparent',
    };
  } else if (variant === 'muted') {
    chipStyles = {
      background: `color-mix(in srgb, ${hex} 11%, transparent)`,
      color: `color-mix(in srgb, ${hex} 70%, currentColor)`,
      borderColor: `color-mix(in srgb, ${hex} 24%, transparent)`,
      opacity: 0.45,
    };
  } else if (variant === 'outline') {
    chipStyles = {
      background: 'transparent',
      color: `color-mix(in srgb, ${hex} 70%, currentColor)`,
      borderColor: `color-mix(in srgb, ${hex} 24%, transparent)`,
    };
  } else {
    // filled (default)
    chipStyles = {
      background: `color-mix(in srgb, ${hex} 11%, transparent)`,
      color: `color-mix(in srgb, ${hex} 70%, currentColor)`,
      borderColor: `color-mix(in srgb, ${hex} 24%, transparent)`,
    };
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold whitespace-nowrap border leading-none ${interactive ? 'cursor-pointer hover:-translate-y-px' : 'cursor-default'} transition-all ${className}`}
      style={{
        ...sizeStyles,
        ...chipStyles,
        letterSpacing: '0.005em',
      }}
      onClick={onClick}
    >
      {showIcon && (
        <span style={{ color: variant === 'solid' ? '#fff' : hex, display: 'inline-flex' }}>
          <DisciplineIcon disciplineKey={disciplineKey} size={iconSize} />
        </span>
      )}
      {label}
    </span>
  );
}

/**
 * Render a list of duty objects as discipline chips.
 * Deduplicates by canonical discipline key.
 */
export function DisciplineChipList({
  duties,
  size = 'sm',
  variant = 'filled',
  showIcon = true,
  max,
  className = '',
}: {
  duties: Array<{ id: string; name: string; category?: string }>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline' | 'solid' | 'muted';
  showIcon?: boolean;
  max?: number;
  className?: string;
}) {
  if (!duties || duties.length === 0) return null;

  // Deduplicate by canonical discipline key (or raw name for unmapped)
  const seen = new Set<string>();
  const unique = duties.filter((d) => {
    const key = getDisciplineKey(d.name) || d.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const visible = max ? unique.slice(0, max) : unique;
  const overflow = max ? unique.length - max : 0;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {visible.map((duty) => (
        <DisciplineChip
          key={duty.id}
          name={duty.name}
          size={size}
          variant={variant}
          showIcon={showIcon}
        />
      ))}
      {overflow > 0 && (
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          +{overflow}
        </span>
      )}
    </div>
  );
}
