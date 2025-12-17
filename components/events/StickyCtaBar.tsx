'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Share2, Calendar, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StickyCtaBarProps {
  eventName: string;
  registrationUrl?: string | null;
  cost?: number | null;
  isUpcoming: boolean;
  onShare?: () => void;
}

export function StickyCtaBar({
  eventName,
  registrationUrl,
  cost,
  isUpcoming,
  onShare
}: StickyCtaBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past hero (approx 400px)
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 400);
      setShowScrollTop(scrollY > 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatCost = (cost: number) => {
    if (cost === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(cost);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop: Top sticky bar */}
      <div className="hidden md:block sticky-cta-bar top-0 bg-background/95 border-b border-border shadow-lg animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Event Name */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-green-500" />
              <h2 className="text-lg font-bold text-foreground truncate max-w-md">
                {eventName}
              </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {cost !== null && cost !== undefined && (
                <span className="text-lg font-bold text-foreground">
                  {formatCost(cost)}
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="hidden sm:flex"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>

              {registrationUrl && isUpcoming ? (
                <a
                  href={registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                >
                  Register Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <Button disabled className="cursor-not-allowed opacity-50">
                  {isUpcoming ? 'Registration Unavailable' : 'Event Ended'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Bottom sticky bar */}
      <div className="md:hidden sticky-cta-bar bottom-0 bg-background/95 border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] animate-slide-up">
        <div className="px-4 py-3 safe-area-pb">
          <div className="flex items-center gap-3">
            {registrationUrl && isUpcoming ? (
              <a
                href={registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg"
              >
                Register {cost !== null && cost !== undefined && `- ${formatCost(cost)}`}
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <Button disabled className="flex-1 cursor-not-allowed opacity-50 py-3">
                {isUpcoming ? 'Registration Unavailable' : 'Event Ended'}
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={onShare}
              className="shrink-0 w-12 h-12"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-12 h-12 bg-foreground text-background rounded-full shadow-lg hover:bg-foreground/90 transition-all flex items-center justify-center animate-slide-up"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
}

// Alternative floating CTA button for simpler use cases
export function FloatingRegisterButton({
  registrationUrl,
  cost,
  isUpcoming
}: {
  registrationUrl?: string | null;
  cost?: number | null;
  isUpcoming: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || !registrationUrl || !isUpcoming) return null;

  const formatCost = (cost: number) => {
    if (cost === 0) return 'Free';
    return `$${cost.toLocaleString()}`;
  };

  return (
    <a
      href={registrationUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-full shadow-xl hover:from-emerald-600 hover:to-green-700 transition-all animate-slide-up hover:scale-105"
    >
      <Calendar className="w-5 h-5" />
      Register {cost !== null && cost !== undefined && `- ${formatCost(cost)}`}
    </a>
  );
}
