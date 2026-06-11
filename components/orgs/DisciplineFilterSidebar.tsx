'use client';

import { Check } from 'lucide-react';
import { DISCIPLINE_KEYS, DISCIPLINE_LABELS, DISCIPLINE_HEX, type DisciplineKey } from '@/lib/labels';

// SVG icon paths per discipline (matching the DisciplineChip)
const DISC_ICONS: Record<DisciplineKey, string> = {
  Media:        '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/>',
  Programmatic: '<rect x="5.5" y="5.5" width="13" height="13" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="0.8"/><path d="M9 2.5v3M15 2.5v3M9 18.5v3M15 18.5v3M2.5 9h3M2.5 15h3M18.5 9h3M18.5 15h3"/>',
  Digital:      '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/>',
  Social:       '<circle cx="12" cy="12" r="3.6"/><path d="M15.6 9.2V13a2.9 2.9 0 0 0 5.7-.7v-.3a9.3 9.3 0 1 0-3.7 7.4"/>',
  Creative:     '<path d="M12 20h8.5"/><path d="M16.5 3.6a2 2 0 0 1 2.9 2.8L7.6 18.2 3.5 19.5l1.3-4.1L16.5 3.6Z"/>',
  OOH:          '<rect x="3" y="4" width="18" height="10.5" rx="1.5"/><path d="M7 8h10M7 11h6M8.5 14.5 7.5 21M15.5 14.5 16.5 21"/>',
  PR:           '<path d="m3.5 10.5 14-4.5v12l-14-4.5v-3Z"/><path d="M11.5 15.8a3 3 0 0 1-5.6-1.3"/><path d="M17.5 9.5a3.5 3.5 0 0 1 0 5"/>',
  Production:   '<path d="M3.5 9.5h17v9a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 18.5v-9Z"/><path d="m4 9.5 1-4 16 1.2-.6 2.8M8.5 5.9 9 9.5M13 6.2l.4 3.3"/>',
};

interface DisciplineFilterSidebarProps {
  selected: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}

export function DisciplineFilterSidebar({ selected, onToggle, onClear }: DisciplineFilterSidebarProps) {
  return (
    <div className="bg-white dark:bg-[#0F1A2E] border border-[#E6EAF2] dark:border-[#22304A] rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B] dark:text-[#9AA7C2]">
          Filter by discipline
        </span>
        {selected.length > 0 && (
          <button
            onClick={onClear}
            className="text-[12px] font-semibold text-[#2575FC] dark:text-[#5B8DFF] hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {DISCIPLINE_KEYS.map((dk) => {
          const hex = DISCIPLINE_HEX[dk];
          const isOn = selected.includes(dk);
          return (
            <button
              key={dk}
              onClick={() => onToggle(dk)}
              className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-left transition-all"
              style={{
                border: `1px solid ${isOn ? 'transparent' : 'var(--border-subtle, #E6EAF2)'}`,
                background: isOn ? `color-mix(in srgb, ${hex} 13%, transparent)` : 'transparent',
              }}
            >
              {/* Icon tile */}
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: `color-mix(in srgb, ${hex} 16%, transparent)`,
                  color: hex,
                }}
              >
                <svg
                  width={13}
                  height={13}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dangerouslySetInnerHTML={{ __html: DISC_ICONS[dk] }}
                />
              </span>

              {/* Label */}
              <span
                className="flex-1 text-[13px] font-semibold"
                style={{
                  color: isOn
                    ? 'var(--text-primary, #0B1220)'
                    : 'var(--text-secondary, #334155)',
                }}
              >
                {DISCIPLINE_LABELS[dk]}
              </span>

              {/* Check mark when active */}
              {isOn && (
                <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.6} style={{ color: hex }} />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 pt-3 border-t border-[#E6EAF2] dark:border-[#22304A] text-[12px] text-[#64748B] dark:text-[#9AA7C2] leading-relaxed">
        Discipline tags show what work each agency handles for a brand.
      </p>
    </div>
  );
}
