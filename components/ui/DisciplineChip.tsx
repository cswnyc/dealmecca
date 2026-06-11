'use client';

import {
  getDisciplineKey,
  DISCIPLINE_LABELS,
  DISCIPLINE_COLORS,
  formatEnumLabel,
  type DisciplineKey,
} from '@/lib/labels';

interface DisciplineChipProps {
  /** The raw duty name (e.g. "Buying", "Digital", "OOH") */
  name: string;
  /** Chip size */
  size?: 'sm' | 'md';
  /** Visual variant */
  variant?: 'filled' | 'outline';
  /** Additional className */
  className?: string;
}

/** Default color for duties that don't map to a known discipline */
const DEFAULT_COLOR = {
  bg: 'bg-gray-50',
  text: 'text-gray-700',
  border: 'border-gray-200',
  darkBg: 'dark:bg-gray-900',
  darkText: 'dark:text-gray-300',
};

/**
 * Consistent discipline chip used everywhere a discipline/duty appears.
 * Maps raw duty names to a canonical discipline with fixed colors.
 */
export function DisciplineChip({
  name,
  size = 'sm',
  variant = 'filled',
  className = '',
}: DisciplineChipProps) {
  const disciplineKey = getDisciplineKey(name);
  const label = disciplineKey
    ? DISCIPLINE_LABELS[disciplineKey]
    : formatEnumLabel(name);
  const colors = disciplineKey
    ? DISCIPLINE_COLORS[disciplineKey]
    : DEFAULT_COLOR;

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-sm';

  const variantClasses = variant === 'filled'
    ? `${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText} border ${colors.border}`
    : `bg-transparent ${colors.text} ${colors.darkText} border ${colors.border}`;

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium whitespace-nowrap ${sizeClasses} ${variantClasses} ${className}`}
    >
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
  max,
  className = '',
}: {
  duties: Array<{ id: string; name: string; category?: string }>;
  size?: 'sm' | 'md';
  variant?: 'filled' | 'outline';
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
        />
      ))}
      {overflow > 0 && (
        <span className="text-xs text-muted-foreground">
          +{overflow} more
        </span>
      )}
    </div>
  );
}
