'use client';

import { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';

interface RatingProgressBarsProps {
  overall: number | null;
  networking: number | null;
  content: number | null;
  roi: number | null;
  totalReviews: number;
  animated?: boolean;
}

interface RatingBarProps {
  label: string;
  value: number | null;
  delay?: number;
  animated?: boolean;
}

function RatingBar({ label, value, delay = 0, animated = true }: RatingBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animated) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (barRef.current) {
      observer.observe(barRef.current);
    }

    return () => observer.disconnect();
  }, [delay, animated]);

  if (value === null || value === undefined) {
    return null;
  }

  const percentage = (value / 5) * 100;
  const colorClass = getRatingColor(value);
  const bgColorClass = getRatingBgColor(value);

  return (
    <div ref={barRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <StarRating value={value} size="sm" />
          <span className={`text-sm font-bold ${colorClass}`}>{value.toFixed(1)}</span>
        </div>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-800 ease-out ${bgColorClass}`}
          style={{
            width: isVisible ? `${percentage}%` : '0%',
            transitionDelay: `${delay}ms`
          }}
        />
      </div>
    </div>
  );
}

function StarRating({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClass = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`${sizeClass} fill-amber-400 text-amber-400`} />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className={`${sizeClass} text-muted-foreground/40`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${sizeClass} fill-amber-400 text-amber-400`} />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${sizeClass} text-muted-foreground/40`} />
      ))}
    </div>
  );
}

function getRatingColor(value: number): string {
  if (value >= 4.5) return 'text-emerald-600';
  if (value >= 4.0) return 'text-green-600';
  if (value >= 3.5) return 'text-amber-600';
  if (value >= 3.0) return 'text-orange-600';
  return 'text-red-600';
}

function getRatingBgColor(value: number): string {
  if (value >= 4.5) return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
  if (value >= 4.0) return 'bg-gradient-to-r from-green-400 to-green-500';
  if (value >= 3.5) return 'bg-gradient-to-r from-amber-400 to-amber-500';
  if (value >= 3.0) return 'bg-gradient-to-r from-orange-400 to-orange-500';
  return 'bg-gradient-to-r from-red-400 to-red-500';
}

export function RatingProgressBars({
  overall,
  networking,
  content,
  roi,
  totalReviews,
  animated = true
}: RatingProgressBarsProps) {
  const ratings = [
    { label: 'Overall', value: overall, delay: 0 },
    { label: 'Networking', value: networking, delay: 100 },
    { label: 'Content', value: content, delay: 200 },
    { label: 'ROI', value: roi, delay: 300 }
  ].filter(r => r.value !== null);

  if (ratings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          Event Ratings
        </h3>
        <span className="text-sm text-muted-foreground">
          {totalReviews.toLocaleString()} {totalReviews === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      <div className="space-y-4">
        {ratings.map((rating) => (
          <RatingBar
            key={rating.label}
            label={rating.label}
            value={rating.value}
            delay={rating.delay}
            animated={animated}
          />
        ))}
      </div>
    </div>
  );
}

// Compact rating display for cards
export function RatingBadge({ value, reviews }: { value: number | null; reviews?: number }) {
  if (!value) return null;

  const colorClass = getRatingColor(value);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className={`text-sm font-bold ${colorClass}`}>{value.toFixed(1)}</span>
      </div>
      {reviews !== undefined && (
        <span className="text-xs text-muted-foreground">({reviews.toLocaleString()})</span>
      )}
    </div>
  );
}

// Large hero rating display
export function RatingHero({ value, reviews }: { value: number | null; reviews?: number }) {
  if (!value) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
        <span className="text-3xl font-black text-white">{value.toFixed(1)}</span>
      </div>
      <StarRating value={value} size="md" />
      {reviews !== undefined && (
        <span className="text-sm text-white/80">{reviews.toLocaleString()} reviews</span>
      )}
    </div>
  );
}

export { StarRating };
