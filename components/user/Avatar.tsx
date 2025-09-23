/**
 * Avatar Component
 * Displays generated SVG avatars for anonymous users
 */

import React from 'react';
import { generateAvatar, getAvatarDataUrl } from '@/lib/user-generator';

interface AvatarProps {
  userId: string;
  size?: number;
  className?: string;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  userId,
  size = 40,
  className = '',
  alt = 'User avatar'
}) => {
  const avatarDataUrl = getAvatarDataUrl(userId, size);

  return (
    <img
      src={avatarDataUrl}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
    />
  );
};

interface AvatarSVGProps {
  userId: string;
  size?: number;
  className?: string;
}

// SVG version for better performance in some cases
export const AvatarSVG: React.FC<AvatarSVGProps> = ({
  userId,
  size = 40,
  className = ''
}) => {
  const svgContent = generateAvatar(userId, size);

  return (
    <div
      className={`rounded-lg overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

// Different avatar sizes as preset components
export const AvatarSmall: React.FC<Omit<AvatarProps, 'size'>> = (props) => (
  <Avatar {...props} size={24} />
);

export const AvatarMedium: React.FC<Omit<AvatarProps, 'size'>> = (props) => (
  <Avatar {...props} size={40} />
);

export const AvatarLarge: React.FC<Omit<AvatarProps, 'size'>> = (props) => (
  <Avatar {...props} size={64} />
);

export const AvatarXLarge: React.FC<Omit<AvatarProps, 'size'>> = (props) => (
  <Avatar {...props} size={96} />
);

export default Avatar;