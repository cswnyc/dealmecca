'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  variant?: 'light' | 'dark' | 'gradient';
  showLabels?: boolean;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function CountdownTimer({
  targetDate,
  size = 'md',
  variant = 'dark',
  showLabels = true,
  onComplete
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        onComplete?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (!isClient) {
    return null;
  }

  if (timeLeft.total <= 0) {
    return (
      <div className={`flex items-center justify-center ${getSizeClasses(size).container}`}>
        <span className={`font-bold ${getVariantClasses(variant).text} ${getSizeClasses(size).label}`}>
          Event Started!
        </span>
      </div>
    );
  }

  const sizeClasses = getSizeClasses(size);
  const variantClasses = getVariantClasses(variant);

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' }
  ];

  return (
    <div className={`flex items-center justify-center gap-2 md:gap-4 ${sizeClasses.container}`}>
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center">
          <div className={`flex flex-col items-center ${sizeClasses.unitWrapper}`}>
            <div className={`
              ${sizeClasses.digit}
              ${variantClasses.digitBg}
              ${variantClasses.text}
              rounded-lg flex items-center justify-center font-headline font-black
              transition-all duration-300
            `}>
              <span className="tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            {showLabels && (
              <span className={`${sizeClasses.label} ${variantClasses.label} mt-1 uppercase tracking-wider font-semibold`}>
                {unit.label}
              </span>
            )}
          </div>
          {index < timeUnits.length - 1 && (
            <span className={`${sizeClasses.separator} ${variantClasses.text} font-bold mx-1 md:mx-2 self-start mt-2`}>
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function getSizeClasses(size: 'sm' | 'md' | 'lg' | 'hero') {
  switch (size) {
    case 'sm':
      return {
        container: 'py-2',
        digit: 'w-10 h-10 text-lg',
        label: 'text-[10px]',
        separator: 'text-lg',
        unitWrapper: ''
      };
    case 'md':
      return {
        container: 'py-3',
        digit: 'w-14 h-14 md:w-16 md:h-16 text-2xl md:text-3xl',
        label: 'text-xs',
        separator: 'text-2xl',
        unitWrapper: ''
      };
    case 'lg':
      return {
        container: 'py-4',
        digit: 'w-16 h-16 md:w-20 md:h-20 text-3xl md:text-4xl',
        label: 'text-sm',
        separator: 'text-3xl',
        unitWrapper: ''
      };
    case 'hero':
      return {
        container: 'py-6',
        digit: 'w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 text-4xl md:text-5xl lg:text-6xl',
        label: 'text-sm md:text-base',
        separator: 'text-4xl md:text-5xl',
        unitWrapper: ''
      };
  }
}

function getVariantClasses(variant: 'light' | 'dark' | 'gradient') {
  switch (variant) {
    case 'light':
      return {
        digitBg: 'bg-white/20 backdrop-blur-sm border border-white/30',
        text: 'text-white',
        label: 'text-white/80'
      };
    case 'dark':
      return {
        digitBg: 'bg-foreground shadow-lg',
        text: 'text-background',
        label: 'text-muted-foreground'
      };
    case 'gradient':
      return {
        digitBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30',
        text: 'text-white',
        label: 'text-muted-foreground'
      };
  }
}

// Compact inline countdown for cards
export function CountdownBadge({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isClient || timeLeft.total <= 0) {
    return null;
  }

  // Show different formats based on time remaining
  if (timeLeft.days > 7) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
        In {timeLeft.days} days
      </span>
    );
  }

  if (timeLeft.days > 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 animate-pulse-glow">
        {timeLeft.days}d {timeLeft.hours}h left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse-glow">
      {timeLeft.hours}h {timeLeft.minutes}m left
    </span>
  );
}
