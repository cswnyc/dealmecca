'use client';

import { cn } from '@/lib/utils';
import { FeatureList } from './FeatureList';
import { BillingPeriod, PlanKey, PRICING } from '@/lib/pricing';
import { Loader2 } from 'lucide-react';

interface PricingCardProps {
  planKey: PlanKey;
  billingPeriod: BillingPeriod;
  currentTier?: string;
  loading?: boolean;
  onUpgrade?: () => void;
  teamSeats?: number;
}

export function PricingCard({
  planKey,
  billingPeriod,
  currentTier,
  loading,
  onUpgrade,
  teamSeats = 10,
}: PricingCardProps): JSX.Element {
  const plan = PRICING[planKey];
  const pricing = plan[billingPeriod];
  const isCurrentPlan = currentTier?.toUpperCase() === planKey.toUpperCase();
  const isFeatured = plan.featured;

  const getPrice = (): string => {
    if (planKey === 'team') {
      return `$${pricing.price}`;
    }
    return `$${pricing.price}`;
  };

  const getSubtitle = (): string | null => {
    if (planKey === 'team') {
      return pricing.note || null;
    }
    if (billingPeriod === 'yearly' && pricing.note) {
      return pricing.note;
    }
    return null;
  };

  const getButtonVariant = (): string => {
    if (isCurrentPlan) {
      return 'border border-[#E6EAF2] dark:border-gray-600 text-[#64748B] dark:text-gray-300 cursor-default';
    }
    if (plan.cta.variant === 'gradient') {
      return 'text-white hover:opacity-90';
    }
    if (plan.cta.variant === 'dark') {
      return 'bg-[#162B54] dark:bg-white text-white dark:text-[#162B54] hover:opacity-90';
    }
    return 'border border-[#E6EAF2] dark:border-gray-600 text-[#64748B] dark:text-gray-300';
  };

  const buttonStyle =
    plan.cta.variant === 'gradient' && !isCurrentPlan
      ? { background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }
      : {};

  const cardClasses = isFeatured
    ? 'rounded-2xl p-6 relative border-2 bg-white dark:bg-[#0F1824] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#2575FC]/10 [background:linear-gradient(white,white)_padding-box,linear-gradient(135deg,#2575FC_0%,#8B5CF6_100%)_border-box] dark:[background:linear-gradient(#0F1824,#0F1824)_padding-box,linear-gradient(135deg,#5B8DFF_0%,#A78BFA_100%)_border-box]'
    : 'bg-white dark:bg-[#0F1824] border border-[#E6EAF2] dark:border-[#1E3A5F] rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#2575FC]/10';

  return (
    <div className={cardClasses}>
      {isFeatured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className="text-white px-4 py-1 rounded-full text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #2575FC 0%, #8B5CF6 100%)' }}
          >
            Most Popular
          </span>
        </div>
      )}

      <div className={isFeatured ? 'pt-2' : ''}>
        <h3 className="text-xl font-bold text-[#162B54] dark:text-gray-100 mb-1">
          {plan.name}
        </h3>
        <p className="text-sm text-[#64748B] dark:text-gray-200">{plan.tagline}</p>
      </div>

      <div className="my-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-[#162B54] dark:text-gray-100">
            {getPrice()}
          </span>
          <span className="text-[#64748B] dark:text-gray-200">{pricing.label}</span>
        </div>
        {getSubtitle() && (
          <p
            className={cn(
              'text-xs mt-1',
              billingPeriod === 'yearly' && planKey !== 'free'
                ? 'text-green-600 dark:text-green-400'
                : 'text-[#9AA7C2] dark:text-gray-300'
            )}
          >
            {getSubtitle()}
          </p>
        )}
      </div>

      <button
        onClick={onUpgrade}
        disabled={isCurrentPlan || loading}
        className={cn(
          'w-full py-3 px-4 rounded-xl text-sm font-medium transition-opacity',
          getButtonVariant()
        )}
        style={buttonStyle}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : (
          plan.cta.text
        )}
      </button>

      <div className="mt-6 pt-6 border-t border-[#E6EAF2] dark:border-[#1E3A5F]">
        {plan.featuresHeading && (
          <p className="text-sm font-semibold text-[#162B54] dark:text-gray-100 mb-4">
            {plan.featuresHeading}
          </p>
        )}
        <FeatureList features={plan.features} />
      </div>
    </div>
  );
}
