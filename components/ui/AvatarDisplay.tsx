'use client';

import { getAvatarById } from '@/lib/avatar-library';

interface AvatarDisplayProps {
  avatarId?: string;
  username?: string;
  size?: number;
  className?: string;
}

export function AvatarDisplay({
  avatarId,
  username = 'Anonymous',
  size = 40,
  className = ''
}: AvatarDisplayProps) {
  // Use inline styles for dynamic sizing to avoid Tailwind purge issues
  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`
  };

  const textSize = size <= 24 ? 'text-xs' : size <= 32 ? 'text-sm' : 'text-base';

  // If we have an avatarId, try to get the avatar from the library
  if (avatarId) {
    const avatar = getAvatarById(avatarId);
    if (avatar) {
      return (
        <div className={`rounded-full overflow-hidden ${className}`} style={avatarStyle}>
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{
              __html: avatar.svg.replace(
                '<svg viewBox="0 0 100 100"',
                '<svg viewBox="0 0 100 100" class="w-full h-full"'
              )
            }}
          />
        </div>
      );
    }
  }

  // Fallback to anonymous figure icon (orange/coral generic style)
  const anonymousFigureSvg = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <circle cx="50" cy="50" r="50" fill="#f9fafb"/>
      <!-- Head -->
      <circle cx="50" cy="35" r="15" fill="#fb923c"/>
      <!-- Body -->
      <path d="M50 50 L40 75 L35 90 L45 90 L50 75 L55 90 L65 90 L60 75 L50 50" fill="#fb923c"/>
      <!-- Arms -->
      <path d="M50 55 L30 65 L25 60 L40 52" fill="#fb923c"/>
      <path d="M50 55 L70 65 L75 60 L60 52" fill="#fb923c"/>
    </svg>
  `;

  return (
    <div className={`rounded-full overflow-hidden ${className}`} style={avatarStyle}>
      <div
        className="w-full h-full"
        dangerouslySetInnerHTML={{ __html: anonymousFigureSvg }}
      />
    </div>
  );
}