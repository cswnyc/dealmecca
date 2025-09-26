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

  // Fallback to initials
  return (
    <div
      className={`rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium ${className}`}
      style={avatarStyle}
    >
      <span className={textSize}>
        {username.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase() || 'A'}
      </span>
    </div>
  );
}