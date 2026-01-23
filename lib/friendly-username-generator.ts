/**
 * Pop Culture Username Generator
 * Generates usernames from 80s/90s/early 2000s pop culture references
 * (music, movies, TV shows, video games, cartoons, and brands)
 */

import popCultureData from '@/data/pop-culture-usernames.json';

// The pool of available pop culture usernames
const USERNAME_POOL: string[] = popCultureData.usernames;

// Seeded random function for consistent results based on user ID
const seededRandom = (seed: string, offset = 0): number => {
  let hash = offset;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647;
};

/**
 * Fisher-Yates shuffle with seed for reproducible shuffling
 */
const seededShuffle = <T>(array: T[], seed: string): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed, i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Generate a consistent username for a given user ID
 */
export const generateFriendlyUsername = (userId: string): string => {
  const index = Math.floor(seededRandom(userId, 1) * USERNAME_POOL.length);
  return USERNAME_POOL[index];
};

/**
 * Generate multiple random username options for user selection
 * Uses true randomness so each shuffle gives different results
 */
export const generateUsernameOptions = (userId: string, count = 6): string[] => {
  // Use current timestamp + userId to get different results each time
  const seed = `${userId}-${Date.now()}-${Math.random()}`;
  const shuffled = seededShuffle(USERNAME_POOL, seed);
  return shuffled.slice(0, count);
};

/**
 * Generate truly random username options (no seed)
 */
export const generateRandomUsernameOptions = (count = 6, exclude: string[] = []): string[] => {
  const available = USERNAME_POOL.filter(u => !exclude.includes(u));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * Check if username is from our pop culture pool
 */
export const isPopCultureUsername = (username: string): boolean => {
  return USERNAME_POOL.includes(username);
};

/**
 * Generate a single random username
 */
export const generateRandomFriendlyUsername = (): string => {
  return USERNAME_POOL[Math.floor(Math.random() * USERNAME_POOL.length)];
};

/**
 * Get total count of available usernames
 */
export const getUsernamePoolSize = (): number => {
  return USERNAME_POOL.length;
};

/**
 * Get metadata about the username pool
 */
export const getUsernameMetadata = () => {
  return popCultureData.metadata;
};

// Legacy export for backwards compatibility
export const isFriendlyUsername = isPopCultureUsername;
