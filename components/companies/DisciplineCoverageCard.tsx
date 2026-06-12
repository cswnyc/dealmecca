'use client';

import Link from 'next/link';
import {
  DISCIPLINE_KEYS,
  DISCIPLINE_LABELS,
  DISCIPLINE_HEX,
  getDisciplineKey,
  type DisciplineKey,
} from '@/lib/labels';
import { DisciplineChip } from '@/components/ui/DisciplineChip';
import { CheckCircle, Minus } from 'lucide-react';

/**
 * Minimum number of verified disciplines before we frame gaps as
 * "potential openings" (a sales signal). Below this threshold the
 * card shows coverage neutrally without the opening framing, since
 * sparse data does not imply a real gap.
 */
const COVERAGE_COMPLETENESS_THRESHOLD = 3;

interface Partnership {
  id: string;
  isAOR?: boolean;
  partner: {
    id: string;
    name: string;
  };
  duties?: Array<{ id: string; name: string; category: string }>;
}

interface DisciplineCoverageCardProps {
  partnerships: Partnership[];
  advertiserName: string;
}

export function DisciplineCoverageCard({
  partnerships,
  advertiserName,
}: DisciplineCoverageCardProps) {
  // Build coverage map: discipline -> agency partnerships that cover it
  const coverageMap = new Map<DisciplineKey, Array<{ agencyId: string; agencyName: string; isLead: boolean }>>();

  for (const p of partnerships) {
    if (!p.duties || p.duties.length === 0) continue;
    for (const duty of p.duties) {
      const dk = getDisciplineKey(duty.name);
      if (!dk) continue;
      if (!coverageMap.has(dk)) coverageMap.set(dk, []);
      const existing = coverageMap.get(dk)!;
      if (!existing.find(e => e.agencyId === p.partner.id)) {
        existing.push({
          agencyId: p.partner.id,
          agencyName: p.partner.name,
          isLead: p.isAOR || false,
        });
      }
    }
  }

  const coveredCount = coverageMap.size;
  const totalDisciplines = DISCIPLINE_KEYS.length;
  const gapCount = totalDisciplines - coveredCount;
  const isComplete = coveredCount >= COVERAGE_COMPLETENESS_THRESHOLD;

  // If no coverage data at all, hide the card entirely
  if (coveredCount === 0) return null;

  return (
    <div className="bg-white dark:bg-[#0F1A2E] border border-[#E6EAF2] dark:border-[#22304A] rounded-2xl p-5">
      {/* Header */}
      <h3 className="text-sm font-bold text-[#0B1220] dark:text-[#EAF0FF] mb-1">
        Discipline Coverage
      </h3>
      <p className="text-xs text-[#64748B] dark:text-[#9AA7C2] mb-4">
        {coveredCount} of {totalDisciplines} disciplines have an agency on file
      </p>

      {/* Gap signal — only shown above completeness threshold */}
      {isComplete && gapCount > 0 && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            {gapCount} {gapCount === 1 ? 'discipline has' : 'disciplines have'} no agency on file — a potential opening.
          </p>
        </div>
      )}

      {/* Coverage list */}
      <div className="space-y-2">
        {DISCIPLINE_KEYS.map((dk) => {
          const agencies = coverageMap.get(dk);
          const isCovered = agencies && agencies.length > 0;
          const hex = DISCIPLINE_HEX[dk];

          return (
            <div key={dk} className="flex items-center gap-2.5 py-1">
              {/* Status icon */}
              {isCovered ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: hex }} />
              ) : (
                <Minus className="w-4 h-4 flex-shrink-0 text-[#D7DEEA] dark:text-[#2C3C5C]" />
              )}

              {/* Discipline label */}
              <span
                className={`text-[13px] font-medium flex-1 ${
                  isCovered
                    ? 'text-[#0B1220] dark:text-[#EAF0FF]'
                    : 'text-[#94a3b8] dark:text-[#64748B]'
                }`}
              >
                {DISCIPLINE_LABELS[dk]}
              </span>

              {/* Agency name (links to agency page) */}
              {isCovered && agencies[0] && (
                <Link
                  href={`/companies/${agencies[0].agencyId}`}
                  className="text-[12px] font-medium text-[#2575FC] dark:text-[#5B8DFF] hover:underline truncate max-w-[120px]"
                >
                  {agencies[0].agencyName}
                  {agencies.length > 1 && (
                    <span className="text-[#94a3b8] dark:text-[#64748B] ml-1">
                      +{agencies.length - 1}
                    </span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
