import crypto from 'node:crypto';

/**
 * Generate an anonymized public handle from a seed string (typically Firebase UID).
 * Format: user-{6-character-hash}
 *
 * @param seed - The input string to hash (e.g., Firebase UID)
 * @returns A deterministic anonymized handle
 *
 * @example
 * makeAlias('abc123xyz') // => 'user-4f2a1b'
 */
export function makeAlias(seed: string): string {
  const hash = crypto.createHash('sha1').update(seed).digest('hex');
  return `user-${hash.slice(0, 6)}`;
}
