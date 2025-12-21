'use client';

import { cn } from '@/lib/utils';
import { BillingPeriod } from '@/lib/pricing';

interface BillingToggleProps {
  billingPeriod: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
}

export function BillingToggle({ billingPeriod, onChange }: BillingToggleProps): JSX.Element {
  return (
    <div className="inline-flex items-center p-1 bg-white dark:bg-[#0F1A2E] border border-[#E6EAF2] dark:border-[#1E3A5F] rounded-xl">
      <button
        onClick={() => onChange('monthly')}
        className={cn(
          'px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
          billingPeriod === 'monthly'
            ? 'text-white'
            : 'text-[#64748B] dark:text-[#9AA7C2]'
        )}
        style={
          billingPeriod === 'monthly'
            ? { background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }
            : {}
        }
      >
        Monthly billing
      </button>
      <button
        onClick={() => onChange('yearly')}
        className={cn(
          'px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
          billingPeriod === 'yearly'
            ? 'text-white'
            : 'text-[#64748B] dark:text-[#9AA7C2]'
        )}
        style={
          billingPeriod === 'yearly'
            ? { background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }
            : {}
        }
      >
        Yearly billing
        <span className="px-2.5 py-1 bg-green-500 text-white rounded-full text-xs font-extrabold shadow-md">
          -17%
        </span>
      </button>
    </div>
  );
}
