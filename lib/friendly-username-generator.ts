/**
 * Friendly Username Generator
 * Creates approachable usernames in Adjective + Noun format (e.g., "Tan Hearts", "Loops Harley")
 */

// Professional but friendly adjectives
const ADJECTIVES = [
  // Colors/Visual
  'Azure', 'Sage', 'Coral', 'Mint', 'Pearl', 'Amber', 'Jade', 'Rose', 'Silver', 'Golden',
  'Crimson', 'Violet', 'Tan', 'Olive', 'Navy', 'Cream', 'Steel', 'Ruby', 'Teal', 'Bronze',

  // Positive qualities
  'Swift', 'Bright', 'Sharp', 'Clear', 'Bold', 'Smart', 'Quick', 'Keen', 'Fresh', 'Smooth',
  'Strong', 'Calm', 'Wise', 'Kind', 'Fair', 'True', 'Pure', 'Fine', 'Cool', 'Warm',

  // Modern/Tech-friendly
  'Digital', 'Modern', 'Elite', 'Prime', 'Ultra', 'Super', 'Mega', 'Pro', 'Max', 'Plus',
  'Tech', 'Smart', 'Fast', 'Next', 'Core', 'Edge', 'Peak', 'Top', 'Star', 'Alpha',

  // Abstract concepts
  'Cosmic', 'Solar', 'Lunar', 'Storm', 'Ocean', 'River', 'Forest', 'Mountain', 'Cloud', 'Wind',
  'Thunder', 'Lightning', 'Crystal', 'Diamond', 'Platinum', 'Titanium', 'Carbon', 'Quantum'
];

// Professional nouns with personality
const NOUNS = [
  // Nature
  'Rivers', 'Mountains', 'Forests', 'Oceans', 'Valleys', 'Meadows', 'Gardens', 'Streams',
  'Clouds', 'Stars', 'Moons', 'Suns', 'Winds', 'Storms', 'Waves', 'Trees', 'Flowers',

  // Gemstones/Materials
  'Diamonds', 'Crystals', 'Pearls', 'Gems', 'Stones', 'Metals', 'Silvers', 'Golds',
  'Rubies', 'Emeralds', 'Sapphires', 'Opals', 'Jades', 'Ambers', 'Quartzes',

  // Abstract concepts
  'Dreams', 'Hopes', 'Visions', 'Ideas', 'Thoughts', 'Plans', 'Goals', 'Paths',
  'Roads', 'Bridges', 'Doors', 'Windows', 'Lights', 'Shadows', 'Echoes', 'Whispers',

  // Professional/Business
  'Solutions', 'Strategies', 'Systems', 'Networks', 'Platforms', 'Frameworks', 'Models',
  'Concepts', 'Methods', 'Approaches', 'Processes', 'Workflows', 'Pipelines', 'Channels',

  // Personality traits
  'Hearts', 'Minds', 'Souls', 'Spirits', 'Wills', 'Powers', 'Forces', 'Energies',
  'Vibes', 'Moods', 'Feelings', 'Senses', 'Instincts', 'Intuitions', 'Insights',

  // Names (like "Harley", "Penn" from your screenshot)
  'Harper', 'Parker', 'Taylor', 'Morgan', 'Jordan', 'Casey', 'Riley', 'Quinn',
  'Blake', 'Drew', 'Sage', 'Lane', 'Reed', 'Stone', 'Brook', 'Fox', 'Wolf',
  'Bear', 'Hawk', 'Jay', 'Wren', 'Phoenix', 'Raven', 'Dove', 'Robin'
];

// Seeded random function for consistency
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
 * Generate a friendly username in Adjective + Noun format
 */
export const generateFriendlyUsername = (userId: string): string => {
  const adjectiveIndex = Math.floor(seededRandom(userId, 1) * ADJECTIVES.length);
  const nounIndex = Math.floor(seededRandom(userId, 2) * NOUNS.length);

  const adjective = ADJECTIVES[adjectiveIndex];
  const noun = NOUNS[nounIndex];

  return `${adjective} ${noun}`;
};

/**
 * Generate multiple username options for user selection
 */
export const generateUsernameOptions = (userId: string, count = 6): string[] => {
  const options: string[] = [];
  const usedCombinations = new Set<string>();

  let attempts = 0;
  while (options.length < count && attempts < count * 3) {
    const adjectiveIndex = Math.floor(seededRandom(userId, attempts * 2 + 1) * ADJECTIVES.length);
    const nounIndex = Math.floor(seededRandom(userId, attempts * 2 + 2) * NOUNS.length);

    const adjective = ADJECTIVES[adjectiveIndex];
    const noun = NOUNS[nounIndex];
    const username = `${adjective} ${noun}`;

    if (!usedCombinations.has(username)) {
      options.push(username);
      usedCombinations.add(username);
    }

    attempts++;
  }

  return options;
};

/**
 * Check if username follows friendly pattern
 */
export const isFriendlyUsername = (username: string): boolean => {
  const parts = username.split(' ');
  if (parts.length !== 2) return false;

  const [adjective, noun] = parts;
  return ADJECTIVES.includes(adjective) && NOUNS.includes(noun);
};

/**
 * Generate random friendly username (for real-time generation)
 */
export const generateRandomFriendlyUsername = (): string => {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];

  return `${adjective} ${noun}`;
};