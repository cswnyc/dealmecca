'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Attendee {
  id: string;
  name: string;
  avatarUrl?: string;
  company?: string;
}

interface AttendeePreviewProps {
  attendees?: Attendee[];
  totalCount: number;
  maxDisplay?: number;
  eventId: string;
  variant?: 'default' | 'compact' | 'hero';
}

// Generate gradient backgrounds for avatars without images
const avatarGradients = [
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-orange-400 to-red-500',
  'from-purple-400 to-pink-500',
  'from-cyan-400 to-blue-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-green-400 to-emerald-500',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function AvatarCircle({
  attendee,
  index,
  size = 'md',
  animated = true
}: {
  attendee: Attendee;
  index: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}) {
  const gradient = avatarGradients[index % avatarGradients.length];

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }[size];

  return (
    <div
      className={`
        ${sizeClasses}
        rounded-full flex items-center justify-center font-semibold text-white
        border-2 border-white shadow-md
        ${animated ? 'animate-avatar-stack' : ''}
        hover:scale-110 hover:z-10 transition-transform duration-200 cursor-pointer
        ${attendee.avatarUrl ? '' : `bg-gradient-to-br ${gradient}`}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
      title={attendee.name}
    >
      {attendee.avatarUrl ? (
        <img
          src={attendee.avatarUrl}
          alt={attendee.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        getInitials(attendee.name)
      )}
    </div>
  );
}

function OverflowBadge({
  count,
  size = 'md'
}: {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }[size];

  return (
    <div
      className={`
        ${sizeClasses}
        rounded-full flex items-center justify-center font-bold
        bg-foreground text-background
        border-2 border-white shadow-md
      `}
    >
      +{count > 999 ? '999+' : count}
    </div>
  );
}

export function AttendeePreview({
  attendees = [],
  totalCount,
  maxDisplay = 8,
  eventId,
  variant = 'default'
}: AttendeePreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Generate placeholder attendees if none provided
  const displayAttendees = attendees.length > 0
    ? attendees.slice(0, maxDisplay)
    : generatePlaceholderAttendees(Math.min(maxDisplay, totalCount));

  const remainingCount = totalCount - displayAttendees.length;

  if (totalCount === 0) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {displayAttendees.slice(0, 4).map((attendee, index) => (
            <AvatarCircle
              key={attendee.id}
              attendee={attendee}
              index={index}
              size="sm"
              animated={false}
            />
          ))}
          {remainingCount > 0 && (
            <OverflowBadge count={remainingCount} size="sm" />
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {totalCount.toLocaleString()} attending
        </span>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex -space-x-3">
          {displayAttendees.slice(0, 6).map((attendee, index) => (
            <AvatarCircle
              key={attendee.id}
              attendee={attendee}
              index={index}
              size="lg"
              animated={isVisible}
            />
          ))}
          {remainingCount > 0 && (
            <OverflowBadge count={remainingCount} size="lg" />
          )}
        </div>
        <p className="text-white/90 text-sm font-medium">
          Join <span className="font-bold">{totalCount.toLocaleString()}</span> professionals
        </p>
      </div>
    );
  }

  // Default variant
  return (
    <div ref={containerRef} className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Who's Attending
        </h3>
        <Link
          href={`/events/${eventId}/attendees`}
          className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex -space-x-3 avatar-stack">
          {displayAttendees.map((attendee, index) => (
            <AvatarCircle
              key={attendee.id}
              attendee={attendee}
              index={index}
              size="md"
              animated={isVisible}
            />
          ))}
          {remainingCount > 0 && (
            <OverflowBadge count={remainingCount} size="md" />
          )}
        </div>
      </div>

      <p className="mt-4 text-muted-foreground">
        Join <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span> other professionals attending this event
      </p>

      <Link
        href={`/events/${eventId}/attendees`}
        className="mt-4 inline-flex items-center justify-center w-full px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-lg transition-colors"
      >
        <Users className="w-4 h-4 mr-2" />
        See All Attendees
      </Link>
    </div>
  );
}

// Generate placeholder attendees for display
function generatePlaceholderAttendees(count: number): Attendee[] {
  const names = [
    'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Rodriguez',
    'Jessica Taylor', 'David Kim', 'Amanda Brown', 'Chris Wilson',
    'Rachel Martinez', 'Brian Lee', 'Nicole Anderson', 'Kevin Thomas'
  ];

  return names.slice(0, count).map((name, index) => ({
    id: `placeholder-${index}`,
    name,
    company: undefined
  }));
}

// Mini avatar row for use in other components
export function AttendeeAvatarRow({
  count,
  maxDisplay = 5
}: {
  count: number;
  maxDisplay?: number;
}) {
  const placeholders = generatePlaceholderAttendees(Math.min(maxDisplay, count));
  const remaining = count - placeholders.length;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {placeholders.map((attendee, index) => (
          <AvatarCircle
            key={attendee.id}
            attendee={attendee}
            index={index}
            size="sm"
            animated={false}
          />
        ))}
        {remaining > 0 && (
          <OverflowBadge count={remaining} size="sm" />
        )}
      </div>
    </div>
  );
}
