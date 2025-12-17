/**
 * Anonymous User Generator
 * Creates friendly usernames and selects avatars from the library
 */

import { generateFriendlyUsername } from './friendly-username-generator';
import { getRandomAvatar } from './avatar-library';

// Seeded random function for consistency
const seededRandom = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647;
};

/**
 * Generate a friendly username using the new system
 */
export const generateUsername = (userId: string): string => {
  return generateFriendlyUsername(userId);
};

/**
 * Generate avatar colors based on user ID
 */
const generateAvatarColors = (userId: string) => {
  const hash1 = seededRandom(userId);
  const hash2 = seededRandom(userId + 'color');

  // Professional color palette
  const colorPalettes = [
    { bg: '#1e40af', pattern: '#3b82f6' }, // Blue
    { bg: '#059669', pattern: '#10b981' }, // Emerald
    { bg: '#7c3aed', pattern: '#a855f7' }, // Purple
    { bg: '#dc2626', pattern: '#ef4444' }, // Red
    { bg: '#8B5CF6', pattern: '#A78BFA' }, // Violet
    { bg: '#4338ca', pattern: '#6366f1' }, // Indigo
    { bg: '#2575FC', pattern: '#5B8DFF' }, // Primary Blue
    { bg: '#65a30d', pattern: '#84cc16' }, // Lime
  ];

  const palette = colorPalettes[Math.floor(hash1 * colorPalettes.length)];
  const patternVariant = Math.floor(hash2 * 4); // 4 pattern variants

  return { ...palette, variant: patternVariant };
};

/**
 * Generate avatar from the avatar library based on user ID
 */
export const generateAvatar = (userId: string, size = 40): string => {
  const avatar = getRandomAvatar(userId);

  // Return the SVG with proper sizing
  const sizedSvg = avatar.svg.replace(
    '<svg viewBox="0 0 100 100"',
    `<svg width="${size}" height="${size}" viewBox="0 0 100 100"`
  );

  return sizedSvg;
};

/**
 * Generate a complete anonymous user profile
 */
export const generateAnonymousProfile = (userId: string) => {
  const avatar = getRandomAvatar(userId);

  return {
    userId,
    username: generateUsername(userId),
    avatar: generateAvatar(userId),
    avatarId: avatar.id, // Store the avatar ID for the new system
    isAnonymous: true,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Validate if a username follows our pattern (for consistency checks)
 */
export const isValidGeneratedUsername = (username: string): boolean => {
  // Allow any reasonable username format since we now support custom usernames too
  return username.length > 0 && username.length <= 50;
};

/**
 * Get avatar as data URL for use in img src
 */
export const getAvatarDataUrl = (userId: string, size = 40): string => {
  const svg = generateAvatar(userId, size);
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
};