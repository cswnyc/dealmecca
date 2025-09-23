/**
 * Anonymous User Generator
 * Creates industry-themed usernames and generates consistent avatars
 */

// Industry-themed username prefixes for B2B media/advertising
const USERNAME_PREFIXES = [
  // Ad Tech
  'RFP', 'CPM', 'CPC', 'CPA', 'CTR', 'DSP', 'DMP', 'SSP', 'RTB',
  'AdTech', 'TradeDesk', 'Programmatic', 'MediaBuy', 'AdOps',

  // Media Industry
  'Media', 'Publishing', 'Content', 'Editorial', 'Broadcast',
  'Digital', 'Native', 'Sponsored', 'Brand', 'Campaign',

  // Business/Sales
  'Revenue', 'Pitch', 'Proposal', 'Deal', 'Sales', 'Account',
  'Client', 'Agency', 'Partner', 'Vendor', 'Buyer',

  // Analytics/Data
  'Analytics', 'Metric', 'KPI', 'Data', 'Insight', 'Report',
  'Dashboard', 'Performance', 'Attribution', 'Conversion'
];

// Generate random suffixes for uniqueness
const generateSuffix = (seed?: string): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const specialChars = ['--', '++', 'Pro', 'Max', 'Plus', 'X', 'Hub', 'Net', 'Link'];

  // Use seed for consistent generation if provided
  const random = seed ? seededRandom(seed) : Math.random();

  if (random < 0.3) {
    // Special suffix (30% chance)
    return specialChars[Math.floor(random * 10 * specialChars.length) % specialChars.length];
  } else {
    // Random alphanumeric (70% chance)
    const length = Math.floor(random * 3) + 3; // 3-5 characters
    let result = '';
    for (let i = 0; i < length; i++) {
      const charRandom = seed ? seededRandom(seed + i) : Math.random();
      result += chars[Math.floor(charRandom * chars.length)];
    }
    return result;
  }
};

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
 * Generate a professional, anonymous username
 */
export const generateUsername = (userId: string): string => {
  const random = seededRandom(userId);
  const prefix = USERNAME_PREFIXES[Math.floor(random * USERNAME_PREFIXES.length)];
  const suffix = generateSuffix(userId);

  return `${prefix}${suffix}`;
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
    { bg: '#ea580c', pattern: '#f97316' }, // Orange
    { bg: '#4338ca', pattern: '#6366f1' }, // Indigo
    { bg: '#0891b2', pattern: '#06b6d4' }, // Cyan
    { bg: '#65a30d', pattern: '#84cc16' }, // Lime
  ];

  const palette = colorPalettes[Math.floor(hash1 * colorPalettes.length)];
  const patternVariant = Math.floor(hash2 * 4); // 4 pattern variants

  return { ...palette, variant: patternVariant };
};

/**
 * Generate SVG avatar based on user ID
 */
export const generateAvatar = (userId: string, size = 40): string => {
  const colors = generateAvatarColors(userId);
  const { bg, pattern, variant } = colors;

  // Different geometric patterns based on variant
  const patterns = [
    // Circles pattern
    `<circle cx="12" cy="12" r="6" fill="${pattern}" opacity="0.8"/>
     <circle cx="28" cy="12" r="4" fill="${pattern}" opacity="0.6"/>
     <circle cx="20" cy="28" r="5" fill="${pattern}" opacity="0.7"/>`,

    // Triangles pattern
    `<polygon points="20,8 28,24 12,24" fill="${pattern}" opacity="0.8"/>
     <polygon points="8,12 16,6 16,18" fill="${pattern}" opacity="0.6"/>`,

    // Rectangles pattern
    `<rect x="8" y="8" width="12" height="6" fill="${pattern}" opacity="0.8"/>
     <rect x="22" y="16" width="8" height="10" fill="${pattern}" opacity="0.6"/>
     <rect x="12" y="20" width="6" height="8" fill="${pattern}" opacity="0.7"/>`,

    // Hexagon pattern
    `<polygon points="20,6 28,12 28,20 20,26 12,20 12,12" fill="${pattern}" opacity="0.8"/>
     <polygon points="10,10 14,8 18,10 18,14 14,16 10,14" fill="${pattern}" opacity="0.6"/>`
  ];

  const selectedPattern = patterns[variant];

  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" fill="${bg}" rx="4"/>
    ${selectedPattern}
  </svg>`;
};

/**
 * Generate a complete anonymous user profile
 */
export const generateAnonymousProfile = (userId: string) => {
  return {
    userId,
    username: generateUsername(userId),
    avatar: generateAvatar(userId),
    isAnonymous: true,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Validate if a username follows our pattern (for consistency checks)
 */
export const isValidGeneratedUsername = (username: string): boolean => {
  const prefixPattern = USERNAME_PREFIXES.join('|');
  const regex = new RegExp(`^(${prefixPattern})[a-z0-9\\-\\+]+$`, 'i');
  return regex.test(username);
};

/**
 * Get avatar as data URL for use in img src
 */
export const getAvatarDataUrl = (userId: string, size = 40): string => {
  const svg = generateAvatar(userId, size);
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
};