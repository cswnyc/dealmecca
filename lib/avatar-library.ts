/**
 * Predefined Avatar Library
 * Collection of cartoon-style avatars for anonymous user customization
 */

export interface AvatarOption {
  id: string;
  name: string;
  svg: string;
  description: string;
}

// Professional cartoon-style avatars similar to the screenshot
export const AVATAR_LIBRARY: AvatarOption[] = [
  {
    id: 'avatar_1',
    name: 'Professional',
    description: 'Friendly professional with glasses',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#f3f4f6"/>
      <!-- Head -->
      <circle cx="50" cy="45" r="28" fill="#fbbf24"/>
      <!-- Hair -->
      <path d="M25 35 C25 20, 35 15, 50 15 C65 15, 75 20, 75 35 L75 45 C70 40, 60 38, 50 38 C40 38, 30 40, 25 45 Z" fill="#92400e"/>
      <!-- Eyes -->
      <circle cx="42" cy="42" r="3" fill="#1f2937"/>
      <circle cx="58" cy="42" r="3" fill="#1f2937"/>
      <!-- Glasses -->
      <circle cx="42" cy="42" r="6" fill="none" stroke="#374151" stroke-width="2"/>
      <circle cx="58" cy="42" r="6" fill="none" stroke="#374151" stroke-width="2"/>
      <line x1="48" y1="42" x2="52" y2="42" stroke="#374151" stroke-width="2"/>
      <!-- Nose -->
      <ellipse cx="50" cy="48" rx="2" ry="1" fill="#f59e0b"/>
      <!-- Mouth -->
      <path d="M45 52 Q50 56 55 52" stroke="#1f2937" stroke-width="2" fill="none"/>
      <!-- Body -->
      <rect x="35" y="70" width="30" height="30" rx="5" fill="#3b82f6"/>
    </svg>`
  },
  {
    id: 'avatar_2',
    name: 'Creative',
    description: 'Creative type with curly hair',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#f3f4f6"/>
      <!-- Head -->
      <circle cx="50" cy="45" r="28" fill="#d97706"/>
      <!-- Curly Hair -->
      <circle cx="40" cy="25" r="8" fill="#7c2d12"/>
      <circle cx="50" cy="20" r="10" fill="#7c2d12"/>
      <circle cx="60" cy="25" r="8" fill="#7c2d12"/>
      <circle cx="35" cy="35" r="6" fill="#7c2d12"/>
      <circle cx="65" cy="35" r="6" fill="#7c2d12"/>
      <!-- Eyes -->
      <circle cx="42" cy="42" r="3" fill="#1f2937"/>
      <circle cx="58" cy="42" r="3" fill="#1f2937"/>
      <!-- Eyebrows -->
      <path d="M38 38 L46 36" stroke="#7c2d12" stroke-width="2"/>
      <path d="M54 36 L62 38" stroke="#7c2d12" stroke-width="2"/>
      <!-- Nose -->
      <ellipse cx="50" cy="48" rx="2" ry="1" fill="#c2410c"/>
      <!-- Mouth -->
      <path d="M45 52 Q50 56 55 52" stroke="#1f2937" stroke-width="2" fill="none"/>
      <!-- Body -->
      <rect x="35" y="70" width="30" height="30" rx="5" fill="#10b981"/>
    </svg>`
  },
  {
    id: 'avatar_3',
    name: 'Executive',
    description: 'Executive with neat appearance',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#f3f4f6"/>
      <!-- Head -->
      <circle cx="50" cy="45" r="28" fill="#fcd34d"/>
      <!-- Hair -->
      <path d="M25 35 C25 22, 35 17, 50 17 C65 17, 75 22, 75 35 L75 40 C70 36, 60 35, 50 35 C40 35, 30 36, 25 40 Z" fill="#374151"/>
      <!-- Eyes -->
      <circle cx="42" cy="42" r="3" fill="#1f2937"/>
      <circle cx="58" cy="42" r="3" fill="#1f2937"/>
      <!-- Eyebrows -->
      <path d="M38 38 L46 37" stroke="#374151" stroke-width="2"/>
      <path d="M54 37 L62 38" stroke="#374151" stroke-width="2"/>
      <!-- Nose -->
      <ellipse cx="50" cy="48" rx="2" ry="1" fill="#f59e0b"/>
      <!-- Mouth -->
      <path d="M46 52 Q50 55 54 52" stroke="#1f2937" stroke-width="2" fill="none"/>
      <!-- Body (suit) -->
      <rect x="35" y="70" width="30" height="30" rx="5" fill="#1f2937"/>
      <!-- Tie -->
      <rect x="48" y="70" width="4" height="20" fill="#dc2626"/>
    </svg>`
  },
  {
    id: 'avatar_4',
    name: 'Friendly',
    description: 'Approachable team member',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#f3f4f6"/>
      <!-- Head -->
      <circle cx="50" cy="45" r="28" fill="#fed7aa"/>
      <!-- Hair -->
      <path d="M25 35 C25 20, 35 15, 50 15 C65 15, 75 20, 75 35 L75 45 C70 40, 60 38, 50 38 C40 38, 30 40, 25 45 Z" fill="#451a03"/>
      <!-- Eyes -->
      <circle cx="42" cy="42" r="3" fill="#1f2937"/>
      <circle cx="58" cy="42" r="3" fill="#1f2937"/>
      <!-- Eyebrows -->
      <path d="M38 38 L46 37" stroke="#451a03" stroke-width="2"/>
      <path d="M54 37 L62 38" stroke="#451a03" stroke-width="2"/>
      <!-- Nose -->
      <ellipse cx="50" cy="48" rx="2" ry="1" fill="#8B5CF6"/>
      <!-- Smile -->
      <path d="M44 52 Q50 58 56 52" stroke="#1f2937" stroke-width="2" fill="none"/>
      <!-- Body -->
      <rect x="35" y="70" width="30" height="30" rx="5" fill="#7c3aed"/>
    </svg>`
  },
  {
    id: 'avatar_5',
    name: 'Analyst',
    description: 'Data-focused professional',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#f3f4f6"/>
      <!-- Head -->
      <circle cx="50" cy="45" r="28" fill="#fef3c7"/>
      <!-- Hair (short) -->
      <path d="M28 38 C28 25, 35 18, 50 18 C65 18, 72 25, 72 38 L72 42 C68 40, 60 39, 50 39 C40 39, 32 40, 28 42 Z" fill="#b45309"/>
      <!-- Eyes -->
      <circle cx="42" cy="42" r="3" fill="#1f2937"/>
      <circle cx="58" cy="42" r="3" fill="#1f2937"/>
      <!-- Glasses (square) -->
      <rect x="36" y="38" width="12" height="8" rx="1" fill="none" stroke="#374151" stroke-width="2"/>
      <rect x="52" y="38" width="12" height="8" rx="1" fill="none" stroke="#374151" stroke-width="2"/>
      <line x1="48" y1="42" x2="52" y2="42" stroke="#374151" stroke-width="2"/>
      <!-- Nose -->
      <ellipse cx="50" cy="48" rx="2" ry="1" fill="#d97706"/>
      <!-- Mouth -->
      <path d="M46 52 Q50 54 54 52" stroke="#1f2937" stroke-width="2" fill="none"/>
      <!-- Body -->
      <rect x="35" y="70" width="30" height="30" rx="5" fill="#059669"/>
    </svg>`
  },
  {
    id: 'avatar_6',
    name: 'Strategist',
    description: 'Strategic thinker',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#f3f4f6"/>
      <!-- Head -->
      <circle cx="50" cy="45" r="28" fill="#fbbf24"/>
      <!-- Hair (wavy) -->
      <path d="M25 35 Q30 18, 40 20 Q50 15, 60 20 Q70 18, 75 35 L75 45 C70 40, 60 38, 50 38 C40 38, 30 40, 25 45 Z" fill="#dc2626"/>
      <!-- Eyes -->
      <circle cx="42" cy="42" r="3" fill="#1f2937"/>
      <circle cx="58" cy="42" r="3" fill="#1f2937"/>
      <!-- Eyebrows -->
      <path d="M38 38 L46 36" stroke="#dc2626" stroke-width="2"/>
      <path d="M54 36 L62 38" stroke="#dc2626" stroke-width="2"/>
      <!-- Nose -->
      <ellipse cx="50" cy="48" rx="2" ry="1" fill="#f59e0b"/>
      <!-- Mouth -->
      <path d="M45 52 Q50 56 55 52" stroke="#1f2937" stroke-width="2" fill="none"/>
      <!-- Body -->
      <rect x="35" y="70" width="30" height="30" rx="5" fill="#7c2d12"/>
    </svg>`
  },
  {
    id: 'avatar_7',
    name: 'Designer',
    description: 'Creative designer type',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#f3f4f6"/>
      <!-- Head -->
      <circle cx="50" cy="45" r="28" fill="#f3e8ff"/>
      <!-- Hair (stylish) -->
      <path d="M28 35 Q25 22, 35 18 Q50 12, 65 18 Q75 22, 72 35 L72 42 C68 38, 60 37, 50 37 C40 37, 32 38, 28 42 Z" fill="#6b21a8"/>
      <!-- Eyes -->
      <circle cx="42" cy="42" r="3" fill="#1f2937"/>
      <circle cx="58" cy="42" r="3" fill="#1f2937"/>
      <!-- Eyebrows -->
      <path d="M38 38 L46 36" stroke="#6b21a8" stroke-width="2"/>
      <path d="M54 36 L62 38" stroke="#6b21a8" stroke-width="2"/>
      <!-- Nose -->
      <ellipse cx="50" cy="48" rx="2" ry="1" fill="#ddd6fe"/>
      <!-- Mouth -->
      <path d="M45 52 Q50 56 55 52" stroke="#1f2937" stroke-width="2" fill="none"/>
      <!-- Body -->
      <rect x="35" y="70" width="30" height="30" rx="5" fill="#c026d3"/>
    </svg>`
  },
  {
    id: 'avatar_8',
    name: 'Manager',
    description: 'Team manager',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#f3f4f6"/>
      <!-- Head -->
      <circle cx="50" cy="45" r="28" fill="#fde68a"/>
      <!-- Hair (professional) -->
      <path d="M25 35 C25 22, 35 16, 50 16 C65 16, 75 22, 75 35 L75 40 C70 36, 60 35, 50 35 C40 35, 30 36, 25 40 Z" fill="#78350f"/>
      <!-- Eyes -->
      <circle cx="42" cy="42" r="3" fill="#1f2937"/>
      <circle cx="58" cy="42" r="3" fill="#1f2937"/>
      <!-- Eyebrows -->
      <path d="M38 38 L46 37" stroke="#78350f" stroke-width="2"/>
      <path d="M54 37 L62 38" stroke="#78350f" stroke-width="2"/>
      <!-- Nose -->
      <ellipse cx="50" cy="48" rx="2" ry="1" fill="#f59e0b"/>
      <!-- Mouth -->
      <path d="M46 52 Q50 55 54 52" stroke="#1f2937" stroke-width="2" fill="none"/>
      <!-- Body -->
      <rect x="35" y="70" width="30" height="30" rx="5" fill="#2575FC"/>
    </svg>`
  }
];

/**
 * Get avatar by ID
 */
export const getAvatarById = (id: string): AvatarOption | null => {
  return AVATAR_LIBRARY.find(avatar => avatar.id === id) || null;
};

/**
 * Get avatar SVG as data URL
 */
export const getAvatarDataUrl = (id: string, size = 40): string => {
  const avatar = getAvatarById(id);
  if (!avatar) {
    return '';
  }

  // Wrap SVG with proper sizing
  const sizedSvg = avatar.svg.replace(
    '<svg viewBox="0 0 100 100"',
    `<svg width="${size}" height="${size}" viewBox="0 0 100 100"`
  );

  const encoded = encodeURIComponent(sizedSvg);
  return `data:image/svg+xml,${encoded}`;
};

/**
 * Get random avatar for new users
 */
export const getRandomAvatar = (seed?: string): AvatarOption => {
  let index = 0;
  if (seed) {
    // Use seed for consistent selection
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    index = Math.abs(hash) % AVATAR_LIBRARY.length;
  } else {
    index = Math.floor(Math.random() * AVATAR_LIBRARY.length);
  }

  return AVATAR_LIBRARY[index];
};